"""
MeTTa Integration Service
Bridges between Python/Flask and MeTTa reasoning engine for task scheduling
"""

import os
import json
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Any
from hyperon import MeTTa
from models import Task


class MeTTaSchedulerService:
    """Service for integrating MeTTa task scheduling with the Flask application"""
    
    def __init__(self, metta_file_path: str = "scheduler.metta"):
        self.metta_file_path = metta_file_path
        self.metta = MeTTa()
        self._load_metta_knowledge_base()
    
    def _load_metta_knowledge_base(self):
        """Load the MeTTa knowledge base from file"""
        try:
            if os.path.exists(self.metta_file_path):
                with open(self.metta_file_path, 'r') as f:
                    content = f.read()

                # Parse and execute complete MeTTa expressions
                expressions = self._parse_metta_expressions(content)
                for expr in expressions:
                    if expr.strip():
                        try:
                            self.metta.run(expr)
                        except Exception as e:
                            print(f"Warning: Error executing MeTTa expression '{expr[:50]}...': {e}")
            else:
                print(f"Warning: MeTTa file {self.metta_file_path} not found")
        except Exception as e:
            print(f"Error loading MeTTa knowledge base: {e}")

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

            if char == '\\':
                escape_next = True
                current_expr += char
                continue

            if char == '"' and not escape_next:
                in_string = not in_string
                current_expr += char
                continue

            if not in_string:
                if char == '(':
                    if paren_count == 0 and current_expr.strip():
                        # Check if this is a comment line
                        stripped = current_expr.strip()
                        if not (stripped.startswith(';') or stripped.startswith('#')):
                            expressions.append(current_expr.strip())
                        current_expr = ""
                    paren_count += 1
                elif char == ')':
                    paren_count -= 1

            current_expr += char

            # If we've closed all parentheses and have content, we have a complete expression
            if not in_string and paren_count == 0 and current_expr.strip():
                stripped = current_expr.strip()
                if not (stripped.startswith(';') or stripped.startswith('#')):
                    expressions.append(stripped)
                current_expr = ""

        # Handle any remaining content
        if current_expr.strip():
            stripped = current_expr.strip()
            if not (stripped.startswith(';') or stripped.startswith('#')):
                expressions.append(stripped)

        return expressions
    
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
    
    def _add_dynamic_date_functions(self, tasks: List[Task]):
        """Add dynamic date difference functions to MeTTa based on actual task deadlines"""
        for task in tasks:
            days_diff = self._calculate_days_difference(task.deadline)
            deadline_str = task.deadline.strftime('%Y-%m-%d')
            date_func = f'(= (daysDifference "{deadline_str}") {days_diff})'
            try:
                self.metta.run(date_func)
            except Exception as e:
                print(f"Warning: Error adding date function for {deadline_str}: {e}")
    
    def load_tasks_into_metta(self, tasks: List[Task]):
        """Load tasks into MeTTa knowledge base"""
        try:
            # Clear existing tasks (simplified approach)
            # In a production system, you might want more sophisticated state management
            
            # Add dynamic date functions
            self._add_dynamic_date_functions(tasks)
            
            # Add tasks to MeTTa
            for task in tasks:
                metta_task = self._task_to_metta_format(task)
                try:
                    self.metta.run(metta_task)
                except Exception as e:
                    print(f"Warning: Error adding task {task.id} to MeTTa: {e}")
                    
        except Exception as e:
            print(f"Error loading tasks into MeTTa: {e}")
    
    def get_next_recommended_task(self, tasks: List[Task]) -> Optional[str]:
        """Get the next recommended task ID using MeTTa scheduling"""
        try:
            # Load current tasks into MeTTa
            self.load_tasks_into_metta(tasks)
            
            # Execute MeTTa scheduling algorithm
            result = self.metta.run("(getNextTask)")
            
            if result and len(result) > 0:
                # Parse the result to extract task ID
                # MeTTa returns results in a specific format, adjust parsing as needed
                task_result = str(result[0]) if result[0] != "None" else None
                if task_result and task_result != "None":
                    # Extract task ID from MeTTa result format
                    # This might need adjustment based on actual MeTTa output format
                    return self._extract_task_id_from_metta_result(task_result)
            
            return None
            
        except Exception as e:
            print(f"Error getting next recommended task: {e}")
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
    
    def check_circular_dependencies(self, task_id: str, tasks: List[Task]) -> bool:
        """Check if adding dependencies would create circular dependencies"""
        try:
            # Load tasks into MeTTa
            self.load_tasks_into_metta(tasks)
            
            # Check for circular dependencies
            result = self.metta.run(f"(hasCircularDependency {task_id})")
            
            if result and len(result) > 0:
                return str(result[0]).lower() == "true"
            
            return False
            
        except Exception as e:
            print(f"Error checking circular dependencies: {e}")
            return False
    
    def get_ready_tasks(self, tasks: List[Task]) -> List[str]:
        """Get list of task IDs that are ready to be worked on (no incomplete dependencies)"""
        try:
            # Load tasks into MeTTa
            self.load_tasks_into_metta(tasks)
            
            # Get ready tasks
            result = self.metta.run("(getReadyTasks)")
            
            ready_task_ids = []
            if result:
                for task_result in result:
                    task_id = self._extract_task_id_from_metta_result(str(task_result))
                    if task_id:
                        ready_task_ids.append(task_id)
            
            return ready_task_ids
            
        except Exception as e:
            print(f"Error getting ready tasks: {e}")
            return []
    
    def calculate_task_urgency(self, task_id: str, tasks: List[Task]) -> float:
        """Calculate urgency score for a specific task"""
        try:
            # Load tasks into MeTTa
            self.load_tasks_into_metta(tasks)
            
            # Calculate urgency
            result = self.metta.run(f"(calculateUrgency {task_id})")
            
            if result and len(result) > 0:
                try:
                    return float(result[0])
                except (ValueError, TypeError):
                    return 0.0
            
            return 0.0
            
        except Exception as e:
            print(f"Error calculating task urgency: {e}")
            return 0.0
    
    def get_task_statistics(self, tasks: List[Task]) -> Dict[str, int]:
        """Get task statistics using MeTTa"""
        try:
            # Load tasks into MeTTa
            self.load_tasks_into_metta(tasks)
            
            # Get statistics
            result = self.metta.run("(getTaskStats)")
            
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
            
        except Exception as e:
            print(f"Error getting task statistics: {e}")
            # Return basic statistics as fallback
            return {
                'total': len(tasks),
                'completed': len([t for t in tasks if t.status == 'completed']),
                'pending': len([t for t in tasks if t.status == 'pending']),
                'inProgress': len([t for t in tasks if t.status == 'in-progress']),
                'overdue': len([t for t in tasks if t.status != 'completed' and t.deadline < datetime.now()])
            }
