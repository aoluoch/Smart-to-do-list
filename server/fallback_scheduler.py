"""
Fallback AI Reasoning System
Provides alternative task scheduling logic when MeTTa is unavailable
"""

import logging
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Optional, Set
from models import Task

logger = logging.getLogger(__name__)


def get_current_datetime():
    """Get current datetime that's compatible with Task deadline format"""
    return datetime.now()


def safe_datetime_comparison(dt1, dt2):
    """Safely compare two datetime objects, handling timezone differences"""
    # If both have timezone info or both don't, compare directly
    if (dt1.tzinfo is None) == (dt2.tzinfo is None):
        return dt1 - dt2

    # If one has timezone and other doesn't, make them compatible
    if dt1.tzinfo is None:
        dt1 = dt1.replace(tzinfo=timezone.utc)
    if dt2.tzinfo is None:
        dt2 = dt2.replace(tzinfo=timezone.utc)

    return dt1 - dt2


def is_task_overdue(task, reference_time=None):
    """Check if a task is overdue, handling timezone issues"""
    if reference_time is None:
        reference_time = get_current_datetime()

    try:
        diff = safe_datetime_comparison(task.deadline, reference_time)
        return diff.total_seconds() < 0
    except Exception as e:
        logger.warning(f"Error comparing task deadline: {e}")
        # Fallback to simple comparison
        return task.deadline < reference_time


class FallbackTaskScheduler:
    """
    Fallback task scheduling system that implements basic AI reasoning
    without relying on MeTTa
    """
    
    def __init__(self):
        self.priority_weights = {
            'high': 3.0,
            'medium': 2.0,
            'low': 1.0
        }
        
        # Urgency calculation parameters
        self.deadline_urgency_days = 7  # Days before deadline becomes urgent
        self.overdue_penalty = 5.0  # Multiplier for overdue tasks
        
    def get_next_recommended_task(self, tasks: List[Task]) -> Optional[str]:
        """
        Get the next recommended task using fallback logic
        
        Algorithm:
        1. Filter out completed tasks
        2. Get tasks with no incomplete dependencies (ready tasks)
        3. Calculate urgency score for each ready task
        4. Return the task with highest urgency score
        """
        try:
            logger.info("Using fallback scheduler for next task recommendation")
            
            # Filter active tasks
            active_tasks = [t for t in tasks if t.status != 'completed']
            if not active_tasks:
                return None
            
            # Get ready tasks (no incomplete dependencies)
            ready_tasks = self._get_ready_tasks(active_tasks)
            if not ready_tasks:
                # If no tasks are ready, return the one with highest urgency anyway
                ready_tasks = active_tasks
            
            # Calculate urgency scores
            task_scores = []
            for task in ready_tasks:
                score = self._calculate_urgency_score(task)
                task_scores.append((task.id, score))
                logger.debug(f"Task {task.id} urgency score: {score:.2f}")
            
            # Sort by score (highest first)
            task_scores.sort(key=lambda x: x[1], reverse=True)
            
            if task_scores:
                recommended_task_id = task_scores[0][0]
                logger.info(f"Fallback scheduler recommends task: {recommended_task_id}")
                return recommended_task_id
            
            return None
            
        except Exception as e:
            logger.error(f"Error in fallback scheduler: {e}")
            return None
    
    def _get_ready_tasks(self, tasks: List[Task]) -> List[Task]:
        """Get tasks that have no incomplete dependencies"""
        task_dict = {t.id: t for t in tasks}
        ready_tasks = []
        
        for task in tasks:
            if task.status == 'completed':
                continue
                
            # Check if all dependencies are completed
            dependencies_met = True
            if task.dependencies:
                for dep_id in task.dependencies:
                    dep_task = task_dict.get(dep_id)
                    if not dep_task or dep_task.status != 'completed':
                        dependencies_met = False
                        break
            
            if dependencies_met:
                ready_tasks.append(task)
        
        return ready_tasks
    
    def _calculate_urgency_score(self, task: Task) -> float:
        """
        Calculate urgency score for a task
        
        Factors:
        - Priority (high/medium/low)
        - Days until deadline
        - Task duration
        - Overdue status
        """
        score = 0.0
        
        # Base priority score
        priority_score = self.priority_weights.get(task.priority, 1.0)
        score += priority_score
        
        # Deadline urgency
        now = get_current_datetime()
        try:
            diff = safe_datetime_comparison(task.deadline, now)
            days_until_deadline = diff.days
        except Exception as e:
            logger.warning(f"Error calculating deadline difference: {e}")
            days_until_deadline = (task.deadline - now).days
        
        if days_until_deadline < 0:
            # Overdue - very high urgency
            score += self.overdue_penalty * abs(days_until_deadline)
        elif days_until_deadline <= self.deadline_urgency_days:
            # Approaching deadline
            urgency_factor = (self.deadline_urgency_days - days_until_deadline) / self.deadline_urgency_days
            score += urgency_factor * 2.0
        
        # Duration factor (shorter tasks get slight boost for quick wins)
        if task.duration:
            duration_hours = task.duration / 60.0
            if duration_hours <= 1.0:
                score += 0.5  # Quick win bonus
            elif duration_hours >= 8.0:
                score -= 0.2  # Slight penalty for very long tasks
        
        return score
    
    def check_circular_dependencies(self, task_id: str, tasks: List[Task]) -> bool:
        """Check if adding dependencies would create circular dependencies"""
        try:
            task_dict = {t.id: t for t in tasks}
            target_task = task_dict.get(task_id)
            
            if not target_task or not target_task.dependencies:
                return False
            
            # Use DFS to detect cycles
            visited = set()
            rec_stack = set()
            
            def has_cycle(current_id: str) -> bool:
                if current_id in rec_stack:
                    return True
                if current_id in visited:
                    return False
                
                visited.add(current_id)
                rec_stack.add(current_id)
                
                current_task = task_dict.get(current_id)
                if current_task and current_task.dependencies:
                    for dep_id in current_task.dependencies:
                        if has_cycle(dep_id):
                            return True
                
                rec_stack.remove(current_id)
                return False
            
            return has_cycle(task_id)
            
        except Exception as e:
            logger.error(f"Error checking circular dependencies: {e}")
            return False
    
    def get_ready_tasks(self, tasks: List[Task]) -> List[str]:
        """Get list of task IDs that are ready to be worked on"""
        try:
            ready_tasks = self._get_ready_tasks(tasks)
            return [task.id for task in ready_tasks]
        except Exception as e:
            logger.error(f"Error getting ready tasks: {e}")
            return []
    
    def calculate_task_urgency(self, task_id: str, tasks: List[Task]) -> float:
        """Calculate urgency score for a specific task"""
        try:
            task = next((t for t in tasks if t.id == task_id), None)
            if not task:
                return 0.0
            
            return self._calculate_urgency_score(task)
            
        except Exception as e:
            logger.error(f"Error calculating task urgency: {e}")
            return 0.0
    
    def get_task_statistics(self, tasks: List[Task]) -> Dict[str, int]:
        """Get task statistics using fallback logic"""
        try:
            now = get_current_datetime()

            stats = {
                'total': len(tasks),
                'completed': len([t for t in tasks if t.status == 'completed']),
                'pending': len([t for t in tasks if t.status == 'pending']),
                'inProgress': len([t for t in tasks if t.status == 'in-progress']),
                'overdue': len([t for t in tasks if t.status != 'completed' and is_task_overdue(t, now)])
            }
            
            # Additional insights
            ready_tasks = self._get_ready_tasks(tasks)
            stats['ready'] = len(ready_tasks)
            
            # High priority tasks
            high_priority = [t for t in tasks if t.priority == 'high' and t.status != 'completed']
            stats['high_priority_pending'] = len(high_priority)
            
            return stats
            
        except Exception as e:
            logger.error(f"Error getting task statistics: {e}")
            return {
                'total': len(tasks),
                'completed': 0,
                'pending': 0,
                'inProgress': 0,
                'overdue': 0
            }
    
    def get_task_recommendations(self, tasks: List[Task], limit: int = 5) -> List[Dict[str, any]]:
        """Get multiple task recommendations with reasoning"""
        try:
            active_tasks = [t for t in tasks if t.status != 'completed']
            ready_tasks = self._get_ready_tasks(active_tasks)
            
            if not ready_tasks:
                ready_tasks = active_tasks
            
            # Calculate scores and create recommendations
            recommendations = []
            for task in ready_tasks:
                score = self._calculate_urgency_score(task)
                
                # Generate reasoning
                reasons = []
                if task.priority == 'high':
                    reasons.append("High priority task")
                
                try:
                    diff = safe_datetime_comparison(task.deadline, get_current_datetime())
                    days_until_deadline = diff.days
                except Exception as e:
                    logger.warning(f"Error calculating deadline for recommendations: {e}")
                    days_until_deadline = (task.deadline - get_current_datetime()).days
                if days_until_deadline < 0:
                    reasons.append(f"Overdue by {abs(days_until_deadline)} days")
                elif days_until_deadline <= 3:
                    reasons.append(f"Due in {days_until_deadline} days")
                
                if task.duration and task.duration <= 60:
                    reasons.append("Quick win (≤1 hour)")
                
                recommendations.append({
                    'task_id': task.id,
                    'title': task.title,
                    'urgency_score': score,
                    'reasons': reasons,
                    'deadline': task.deadline.isoformat(),
                    'priority': task.priority
                })
            
            # Sort by urgency score
            recommendations.sort(key=lambda x: x['urgency_score'], reverse=True)
            
            return recommendations[:limit]
            
        except Exception as e:
            logger.error(f"Error getting task recommendations: {e}")
            return []
