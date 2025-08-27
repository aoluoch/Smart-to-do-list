"""
MeTTa Integration Service
Bridges between Python/Flask and MeTTa reasoning engine for task scheduling
"""

import os
import json
import threading
import time
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Any
from queue import Queue, Empty
from contextlib import contextmanager
from hyperon import MeTTa
from models import Task
from metta_monitor import get_monitor
from fallback_scheduler import FallbackTaskScheduler

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
monitor = get_monitor()


class MeTTaConnectionPool:
    """Thread-safe connection pool for MeTTa instances"""

    def __init__(self, pool_size: int = 5, max_retries: int = 3):
        self.pool_size = pool_size
        self.max_retries = max_retries
        self.pool = Queue(maxsize=pool_size)
        self.lock = threading.Lock()
        self.created_connections = 0
        self.knowledge_base_content = ""

        # Initialize the pool with MeTTa instances
        for _ in range(pool_size):
            self._create_connection()

    def _create_connection(self) -> None:
        """Create a new MeTTa connection and add it to the pool"""
        try:
            metta = MeTTa()
            # Load knowledge base if available
            if self.knowledge_base_content:
                self._load_knowledge_base_to_instance(metta, self.knowledge_base_content)
            self.pool.put(metta)
            self.created_connections += 1
            logger.debug(f"Created MeTTa connection #{self.created_connections}")
        except Exception as e:
            logger.error(f"Failed to create MeTTa connection: {e}")
            raise

    def _load_knowledge_base_to_instance(self, metta: MeTTa, content: str) -> None:
        """Load knowledge base content to a specific MeTTa instance"""
        try:
            expressions = self._parse_metta_expressions(content)
            for expr in expressions:
                if expr.strip():
                    try:
                        metta.run(expr)
                    except Exception as e:
                        logger.warning(f"Error loading expression '{expr[:50]}...': {e}")
        except Exception as e:
            logger.error(f"Error loading knowledge base to instance: {e}")

    def _parse_metta_expressions(self, content: str) -> List[str]:
        """Parse MeTTa content into complete expressions"""
        expressions = []
        current_expr = ""
        paren_count = 0
        in_string = False
        escape_next = False

        for char in content:
            if escape_next:
                current_expr += char
                escape_next = False
                continue

            if char == '\\' and in_string:
                current_expr += char
                escape_next = True
                continue

            if char == '"':
                in_string = not in_string
                current_expr += char
                continue

            if in_string:
                current_expr += char
                continue

            if char == ';' and paren_count == 0:
                # Skip comments
                while char != '\n' and char:
                    char = next(iter(content), '')
                continue

            if char == '(':
                paren_count += 1
                current_expr += char
            elif char == ')':
                paren_count -= 1
                current_expr += char

                if paren_count == 0 and current_expr.strip():
                    expressions.append(current_expr.strip())
                    current_expr = ""
            elif char.isspace():
                if current_expr.strip():
                    current_expr += char
            else:
                current_expr += char

        return expressions

    def set_knowledge_base(self, content: str) -> None:
        """Set the knowledge base content for all future connections"""
        self.knowledge_base_content = content
        logger.info("Updated knowledge base content for connection pool")

    @contextmanager
    def get_connection(self, timeout: float = 5.0):
        """Get a MeTTa connection from the pool with automatic cleanup"""
        connection = None
        start_time = time.time()
        connection_id = f"conn_{int(time.time() * 1000)}"

        with monitor.track_operation("get_connection", connection_id):
            try:
                # Try to get a connection from the pool
                connection = self.pool.get(timeout=timeout)
                logger.debug(f"Retrieved MeTTa connection {connection_id} from pool")
                yield connection

            except Empty:
                # Pool is empty, create a temporary connection
                logger.warning(f"Pool exhausted, creating temporary MeTTa connection {connection_id}")
                connection = MeTTa()
                if self.knowledge_base_content:
                    self._load_knowledge_base_to_instance(connection, self.knowledge_base_content)
                yield connection

            except Exception as e:
                logger.error(f"Error using MeTTa connection {connection_id}: {e}")
                # If there's an error, create a fresh connection
                if connection:
                    try:
                        connection = MeTTa()
                        if self.knowledge_base_content:
                            self._load_knowledge_base_to_instance(connection, self.knowledge_base_content)
                    except Exception as create_error:
                        logger.error(f"Failed to create replacement connection: {create_error}")
                        raise
                raise

            finally:
                # Return connection to pool or discard if it's a temporary one
                if connection:
                    try:
                        operation_time = time.time() - start_time
                        if operation_time < 30:  # Only reuse if operation was quick
                            self.pool.put_nowait(connection)
                            logger.debug(f"Returned MeTTa connection {connection_id} to pool")
                        else:
                            logger.debug(f"Discarded slow MeTTa connection {connection_id} (took {operation_time:.2f}s)")
                    except:
                        # Pool might be full, that's okay
                        logger.debug(f"Pool full, discarded MeTTa connection {connection_id}")

    def close(self) -> None:
        """Close all connections in the pool"""
        while not self.pool.empty():
            try:
                connection = self.pool.get_nowait()
                # MeTTa doesn't have explicit close method, just let it be garbage collected
                del connection
            except Empty:
                break
        logger.info("Closed all MeTTa connections in pool")


class MeTTaSchedulerService:
    """Service for integrating MeTTa task scheduling with the Flask application"""

    def __init__(self, metta_file_path: str = "scheduler.metta", pool_size: int = 5, enable_fallback: bool = True):
        self.metta_file_path = metta_file_path
        self.pool = MeTTaConnectionPool(pool_size=pool_size)
        self.enable_fallback = enable_fallback
        self.fallback_scheduler = FallbackTaskScheduler() if enable_fallback else None
        self._load_metta_knowledge_base()
    
    def _load_metta_knowledge_base(self):
        """Load the MeTTa knowledge base from file"""
        try:
            if os.path.exists(self.metta_file_path):
                with open(self.metta_file_path, 'r') as f:
                    content = f.read()

                # Set the knowledge base content in the pool
                self.pool.set_knowledge_base(content)
                logger.info(f"Loaded MeTTa knowledge base from {self.metta_file_path}")
            else:
                logger.warning(f"MeTTa file {self.metta_file_path} not found")
        except Exception as e:
            logger.error(f"Error loading MeTTa knowledge base: {e}")

    def _safe_metta_operation(self, operation_func, *args, **kwargs):
        """Safely execute MeTTa operations with retry logic and error recovery"""
        max_retries = 3
        last_exception = None
        operation_name = operation_func.__name__

        with monitor.track_operation(f"safe_{operation_name}"):
            for attempt in range(max_retries):
                try:
                    with self.pool.get_connection() as metta:
                        with monitor.track_operation(operation_name):
                            return operation_func(metta, *args, **kwargs)

                except Exception as e:
                    last_exception = e
                    logger.warning(f"MeTTa operation {operation_name} failed (attempt {attempt + 1}/{max_retries}): {e}")

                    # If it's a BorrowMutError or similar, wait a bit before retry
                    if "BorrowMutError" in str(e) or "already borrowed" in str(e):
                        wait_time = 0.1 * (attempt + 1)  # Exponential backoff
                        logger.info(f"BorrowMutError detected, waiting {wait_time}s before retry")
                        time.sleep(wait_time)
                        continue

                    # For other errors, retry immediately
                    if attempt < max_retries - 1:
                        continue

            # If all retries failed, raise the last exception
            logger.error(f"All MeTTa operation retries failed for {operation_name}: {last_exception}")
            raise last_exception


    
    def _task_to_metta_format(self, task: Task) -> str:
        """Convert a Task object to MeTTa format"""
        # Convert priority to MeTTa format
        priority_map = {'high': 'High', 'medium': 'Medium', 'low': 'Low'}
        priority = priority_map.get(task.priority, 'Medium')
        
        # Convert status to MeTTa format
        status_map = {'pending': 'Pending', 'in-progress': 'InProgress', 'completed': 'Completed'}
        status = status_map.get(task.status, 'Pending')
        
        # Format deadline as string
        deadline_str = task.deadline.strftime('%Y-%m-%d')
        
        # Format dependencies
        deps = task.dependencies if task.dependencies else []
        deps_str = f"({' '.join(deps)})" if deps else "()"
        
        # Create MeTTa task representation
        metta_task = f'(task {task.id} "{task.title}" "{deadline_str}" {priority} {task.duration} {status} {deps_str})'
        return metta_task
    
    def _calculate_days_difference(self, deadline: datetime) -> int:
        """Calculate days until deadline"""
        now = datetime.now()
        diff = deadline - now
        return max(0, diff.days)
    
    def _add_dynamic_date_functions_operation(self, metta: MeTTa, tasks: List[Task]):
        """Add dynamic date difference functions to MeTTa based on actual task deadlines"""
        for task in tasks:
            days_diff = self._calculate_days_difference(task.deadline)
            deadline_str = task.deadline.strftime('%Y-%m-%d')
            date_func = f'(= (daysDifference "{deadline_str}") {days_diff})'
            try:
                metta.run(date_func)
            except Exception as e:
                logger.warning(f"Error adding date function for {deadline_str}: {e}")

    def _load_tasks_operation(self, metta: MeTTa, tasks: List[Task]):
        """Load tasks into MeTTa knowledge base using a specific connection"""
        # Add dynamic date functions
        self._add_dynamic_date_functions_operation(metta, tasks)

        # Add tasks to MeTTa
        for task in tasks:
            metta_task = self._task_to_metta_format(task)
            try:
                metta.run(metta_task)
            except Exception as e:
                logger.warning(f"Error adding task {task.id} to MeTTa: {e}")

    def load_tasks_into_metta(self, tasks: List[Task]):
        """Load tasks into MeTTa knowledge base"""
        try:
            return self._safe_metta_operation(self._load_tasks_operation, tasks)
        except Exception as e:
            logger.error(f"Error loading tasks into MeTTa: {e}")
            raise
    
    def _get_next_task_operation(self, metta: MeTTa, tasks: List[Task]) -> Optional[str]:
        """Get the next recommended task using a specific MeTTa connection"""
        # Load current tasks into MeTTa
        self._load_tasks_operation(metta, tasks)

        # Execute MeTTa scheduling algorithm
        result = metta.run("(getNextTask)")

        if result and len(result) > 0:
            # Parse the result to extract task ID
            task_result = str(result[0]) if result[0] != "None" else None
            if task_result and task_result != "None":
                return self._extract_task_id_from_metta_result(task_result)

        return None

    def get_next_recommended_task(self, tasks: List[Task]) -> Optional[str]:
        """Get the next recommended task ID using MeTTa scheduling"""
        try:
            return self._safe_metta_operation(self._get_next_task_operation, tasks)
        except Exception as e:
            logger.error(f"Error getting next recommended task from MeTTa: {e}")

            # Use fallback scheduler if enabled
            if self.enable_fallback and self.fallback_scheduler:
                logger.info("Falling back to alternative scheduler")
                return self.fallback_scheduler.get_next_recommended_task(tasks)

            return None
    
    def _extract_task_id_from_metta_result(self, metta_result: str) -> Optional[str]:
        """Extract task ID from MeTTa result format"""
        try:
            # MeTTa returns task in format: (task ID Description ...)
            # Parse to extract the ID
            result_str = str(metta_result)
            if result_str.startswith('(task '):
                parts = result_str.split(' ')
                if len(parts) > 1:
                    return parts[1]  # Second element is the task ID
            return None
        except Exception:
            return None
    
    def _check_circular_dependencies_operation(self, metta: MeTTa, task_id: str, tasks: List[Task]) -> bool:
        """Check circular dependencies using a specific MeTTa connection"""
        # Load tasks into MeTTa
        self._load_tasks_operation(metta, tasks)

        # Check for circular dependencies
        result = metta.run(f"(hasCircularDependency {task_id})")

        if result and len(result) > 0:
            return str(result[0]).lower() == "true"

        return False

    def check_circular_dependencies(self, task_id: str, tasks: List[Task]) -> bool:
        """Check if adding dependencies would create circular dependencies"""
        try:
            return self._safe_metta_operation(self._check_circular_dependencies_operation, task_id, tasks)
        except Exception as e:
            logger.error(f"Error checking circular dependencies with MeTTa: {e}")

            # Use fallback scheduler if enabled
            if self.enable_fallback and self.fallback_scheduler:
                logger.info("Falling back to alternative dependency checker")
                return self.fallback_scheduler.check_circular_dependencies(task_id, tasks)

            return False
    
    def _get_ready_tasks_operation(self, metta: MeTTa, tasks: List[Task]) -> List[str]:
        """Get ready tasks using a specific MeTTa connection"""
        # Load tasks into MeTTa
        self._load_tasks_operation(metta, tasks)

        # Get ready tasks
        result = metta.run("(getReadyTasks)")

        ready_task_ids = []
        if result:
            for task_result in result:
                task_id = self._extract_task_id_from_metta_result(str(task_result))
                if task_id:
                    ready_task_ids.append(task_id)

        return ready_task_ids

    def get_ready_tasks(self, tasks: List[Task]) -> List[str]:
        """Get list of task IDs that are ready to be worked on (no incomplete dependencies)"""
        try:
            return self._safe_metta_operation(self._get_ready_tasks_operation, tasks)
        except Exception as e:
            logger.error(f"Error getting ready tasks from MeTTa: {e}")

            # Use fallback scheduler if enabled
            if self.enable_fallback and self.fallback_scheduler:
                logger.info("Falling back to alternative ready tasks logic")
                return self.fallback_scheduler.get_ready_tasks(tasks)

            return []

    def _calculate_urgency_operation(self, metta: MeTTa, task_id: str, tasks: List[Task]) -> float:
        """Calculate urgency using a specific MeTTa connection"""
        # Load tasks into MeTTa
        self._load_tasks_operation(metta, tasks)

        # Calculate urgency
        result = metta.run(f"(calculateUrgency {task_id})")

        if result and len(result) > 0:
            try:
                return float(result[0])
            except (ValueError, TypeError):
                return 0.0

        return 0.0

    def calculate_task_urgency(self, task_id: str, tasks: List[Task]) -> float:
        """Calculate urgency score for a specific task"""
        try:
            return self._safe_metta_operation(self._calculate_urgency_operation, task_id, tasks)
        except Exception as e:
            logger.error(f"Error calculating task urgency with MeTTa: {e}")

            # Use fallback scheduler if enabled
            if self.enable_fallback and self.fallback_scheduler:
                logger.info("Falling back to alternative urgency calculation")
                return self.fallback_scheduler.calculate_task_urgency(task_id, tasks)

            return 0.0
    
    def _get_statistics_operation(self, metta: MeTTa, tasks: List[Task]) -> Dict[str, int]:
        """Get statistics using a specific MeTTa connection"""
        # Load tasks into MeTTa
        self._load_tasks_operation(metta, tasks)

        # Get statistics
        result = metta.run("(getTaskStats)")

        # Default statistics
        stats = {
            'total': len(tasks),
            'completed': len([t for t in tasks if t.status == 'completed']),
            'pending': len([t for t in tasks if t.status == 'pending']),
            'inProgress': len([t for t in tasks if t.status == 'in-progress']),
            'overdue': len([t for t in tasks if t.status != 'completed' and t.deadline < datetime.now()])
        }

        # If MeTTa returns statistics, use those instead
        if result and len(result) > 0:
            # Parse MeTTa statistics format if available
            # This would need to be adjusted based on actual MeTTa output
            pass

        return stats

    def get_task_statistics(self, tasks: List[Task]) -> Dict[str, int]:
        """Get task statistics using MeTTa"""
        try:
            return self._safe_metta_operation(self._get_statistics_operation, tasks)
        except Exception as e:
            logger.error(f"Error getting task statistics from MeTTa: {e}")

            # Use fallback scheduler if enabled
            if self.enable_fallback and self.fallback_scheduler:
                logger.info("Falling back to alternative statistics calculation")
                return self.fallback_scheduler.get_task_statistics(tasks)

            # Return basic statistics as final fallback
            return {
                'total': len(tasks),
                'completed': len([t for t in tasks if t.status == 'completed']),
                'pending': len([t for t in tasks if t.status == 'pending']),
                'inProgress': len([t for t in tasks if t.status == 'in-progress']),
                'overdue': len([t for t in tasks if t.status != 'completed' and t.deadline < datetime.now()])
            }

    def get_health_status(self) -> Dict[str, Any]:
        """Get health status of the MeTTa service"""
        try:
            health_status = monitor.get_health_status()

            # Add service-specific information
            health_status.update({
                'service': 'MeTTaSchedulerService',
                'fallback_enabled': self.enable_fallback,
                'pool_size': self.pool.pool_size if hasattr(self.pool, 'pool_size') else 'unknown',
                'knowledge_base_loaded': bool(self.pool.knowledge_base_content)
            })

            return health_status

        except Exception as e:
            logger.error(f"Error getting health status: {e}")
            return {
                'status': 'ERROR',
                'message': f'Health check failed: {e}',
                'service': 'MeTTaSchedulerService'
            }

    def get_operation_metrics(self) -> Dict[str, Any]:
        """Get detailed operation metrics"""
        try:
            return monitor.get_operation_stats()
        except Exception as e:
            logger.error(f"Error getting operation metrics: {e}")
            return {'error': str(e)}

    def export_diagnostics(self, filepath: str = None) -> str:
        """Export diagnostic information to file"""
        try:
            if not filepath:
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                filepath = f"logs/metta_diagnostics_{timestamp}.json"

            monitor.export_metrics(filepath)
            logger.info(f"Diagnostics exported to {filepath}")
            return filepath

        except Exception as e:
            logger.error(f"Error exporting diagnostics: {e}")
            raise

    def test_connection(self) -> Dict[str, Any]:
        """Test MeTTa connection and basic functionality"""
        test_results = {
            'connection_test': False,
            'basic_operation_test': False,
            'fallback_test': False,
            'errors': []
        }

        try:
            # Test connection
            with self.pool.get_connection(timeout=2.0) as metta:
                test_results['connection_test'] = True

                # Test basic operation
                try:
                    result = metta.run("(+ 1 1)")
                    test_results['basic_operation_test'] = True
                except Exception as e:
                    test_results['errors'].append(f"Basic operation failed: {e}")

        except Exception as e:
            test_results['errors'].append(f"Connection failed: {e}")

        # Test fallback
        if self.enable_fallback and self.fallback_scheduler:
            try:
                from models import Task
                test_task = Task(
                    id="test",
                    title="Test Task",
                    description="Test",
                    deadline=datetime.now() + timedelta(days=1),
                    priority="medium",
                    duration=60,
                    status="pending"
                )
                result = self.fallback_scheduler.get_next_recommended_task([test_task])
                test_results['fallback_test'] = result == "test"
            except Exception as e:
                test_results['errors'].append(f"Fallback test failed: {e}")

        return test_results

    def close(self):
        """Close the MeTTa connection pool"""
        if hasattr(self, 'pool'):
            self.pool.close()
            logger.info("MeTTa scheduler service closed")
