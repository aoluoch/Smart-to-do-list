"""
MeTTa Monitoring and Logging System
Provides comprehensive monitoring, logging, and health checking for MeTTa operations
"""

import logging
import time
import threading
import json
import os
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from collections import defaultdict, deque
from contextlib import contextmanager


@dataclass
class MeTTaOperationMetrics:
    """Metrics for a single MeTTa operation"""
    operation_name: str
    start_time: float
    end_time: Optional[float] = None
    success: bool = True
    error_message: Optional[str] = None
    connection_id: Optional[str] = None
    retry_count: int = 0
    
    @property
    def duration(self) -> Optional[float]:
        if self.end_time:
            return self.end_time - self.start_time
        return None
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class MeTTaHealthMonitor:
    """Health monitoring system for MeTTa operations"""
    
    def __init__(self, max_history: int = 1000):
        self.max_history = max_history
        self.operation_history = deque(maxlen=max_history)
        self.error_counts = defaultdict(int)
        self.performance_stats = defaultdict(list)
        self.lock = threading.Lock()
        self.start_time = time.time()
        
        # Health thresholds
        self.error_rate_threshold = 0.1  # 10% error rate
        self.slow_operation_threshold = 5.0  # 5 seconds
        self.connection_timeout_threshold = 10.0  # 10 seconds
        
        # Setup logging
        self.logger = self._setup_logger()
    
    def _setup_logger(self) -> logging.Logger:
        """Setup dedicated logger for MeTTa monitoring"""
        logger = logging.getLogger('metta_monitor')
        logger.setLevel(logging.INFO)
        
        # Create file handler
        log_file = 'logs/metta_monitor.log'
        os.makedirs(os.path.dirname(log_file), exist_ok=True)
        
        file_handler = logging.FileHandler(log_file)
        file_handler.setLevel(logging.INFO)
        
        # Create console handler
        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.WARNING)
        
        # Create formatter
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        file_handler.setFormatter(formatter)
        console_handler.setFormatter(formatter)
        
        # Add handlers
        if not logger.handlers:
            logger.addHandler(file_handler)
            logger.addHandler(console_handler)
        
        return logger
    
    @contextmanager
    def track_operation(self, operation_name: str, connection_id: Optional[str] = None):
        """Context manager to track MeTTa operations"""
        metrics = MeTTaOperationMetrics(
            operation_name=operation_name,
            start_time=time.time(),
            connection_id=connection_id
        )
        
        try:
            self.logger.info(f"Starting operation: {operation_name}")
            yield metrics
            
        except Exception as e:
            metrics.success = False
            metrics.error_message = str(e)
            self.logger.error(f"Operation failed: {operation_name} - {e}")
            raise
            
        finally:
            metrics.end_time = time.time()
            self._record_operation(metrics)
    
    def _record_operation(self, metrics: MeTTaOperationMetrics):
        """Record operation metrics"""
        with self.lock:
            self.operation_history.append(metrics)
            
            # Update error counts
            if not metrics.success:
                self.error_counts[metrics.operation_name] += 1
                self.error_counts['total'] += 1
            
            # Update performance stats
            if metrics.duration:
                self.performance_stats[metrics.operation_name].append(metrics.duration)
                
                # Log slow operations
                if metrics.duration > self.slow_operation_threshold:
                    self.logger.warning(
                        f"Slow operation detected: {metrics.operation_name} "
                        f"took {metrics.duration:.2f}s"
                    )
        
        # Log operation completion
        status = "SUCCESS" if metrics.success else "FAILED"
        duration_str = f" ({metrics.duration:.3f}s)" if metrics.duration else ""
        self.logger.info(f"Operation {status}: {metrics.operation_name}{duration_str}")
    
    def get_health_status(self) -> Dict[str, Any]:
        """Get current health status"""
        with self.lock:
            total_operations = len(self.operation_history)
            if total_operations == 0:
                return {
                    'status': 'UNKNOWN',
                    'message': 'No operations recorded yet',
                    'uptime': time.time() - self.start_time
                }
            
            # Calculate error rate
            total_errors = self.error_counts.get('total', 0)
            error_rate = total_errors / total_operations if total_operations > 0 else 0
            
            # Calculate average response times
            avg_times = {}
            for op_name, durations in self.performance_stats.items():
                if durations:
                    avg_times[op_name] = sum(durations) / len(durations)
            
            # Determine overall health
            status = 'HEALTHY'
            issues = []
            
            if error_rate > self.error_rate_threshold:
                status = 'UNHEALTHY'
                issues.append(f"High error rate: {error_rate:.1%}")
            
            # Check for recent errors
            recent_operations = list(self.operation_history)[-10:]
            recent_errors = [op for op in recent_operations if not op.success]
            if len(recent_errors) >= 3:
                status = 'DEGRADED'
                issues.append("Multiple recent failures")
            
            return {
                'status': status,
                'uptime': time.time() - self.start_time,
                'total_operations': total_operations,
                'total_errors': total_errors,
                'error_rate': error_rate,
                'average_response_times': avg_times,
                'issues': issues,
                'last_operation': recent_operations[-1].to_dict() if recent_operations else None
            }
    
    def get_operation_stats(self, operation_name: Optional[str] = None) -> Dict[str, Any]:
        """Get detailed statistics for operations"""
        with self.lock:
            if operation_name:
                ops = [op for op in self.operation_history if op.operation_name == operation_name]
            else:
                ops = list(self.operation_history)
            
            if not ops:
                return {'message': 'No operations found'}
            
            successful_ops = [op for op in ops if op.success]
            failed_ops = [op for op in ops if not op.success]
            
            durations = [op.duration for op in ops if op.duration]
            
            stats = {
                'total_count': len(ops),
                'success_count': len(successful_ops),
                'failure_count': len(failed_ops),
                'success_rate': len(successful_ops) / len(ops) if ops else 0,
            }
            
            if durations:
                stats.update({
                    'avg_duration': sum(durations) / len(durations),
                    'min_duration': min(durations),
                    'max_duration': max(durations),
                    'slow_operations': len([d for d in durations if d > self.slow_operation_threshold])
                })
            
            # Recent error patterns
            if failed_ops:
                error_messages = [op.error_message for op in failed_ops if op.error_message]
                error_patterns = defaultdict(int)
                for msg in error_messages:
                    if 'BorrowMutError' in msg:
                        error_patterns['BorrowMutError'] += 1
                    elif 'timeout' in msg.lower():
                        error_patterns['Timeout'] += 1
                    elif 'connection' in msg.lower():
                        error_patterns['Connection'] += 1
                    else:
                        error_patterns['Other'] += 1
                
                stats['error_patterns'] = dict(error_patterns)
            
            return stats
    
    def export_metrics(self, filepath: str):
        """Export metrics to JSON file"""
        with self.lock:
            data = {
                'export_time': datetime.now().isoformat(),
                'health_status': self.get_health_status(),
                'operation_history': [op.to_dict() for op in self.operation_history],
                'error_counts': dict(self.error_counts),
                'performance_stats': {
                    name: {
                        'count': len(durations),
                        'avg': sum(durations) / len(durations) if durations else 0,
                        'min': min(durations) if durations else 0,
                        'max': max(durations) if durations else 0
                    }
                    for name, durations in self.performance_stats.items()
                }
            }
        
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2)
        
        self.logger.info(f"Metrics exported to {filepath}")


# Global monitor instance
monitor = MeTTaHealthMonitor()


def get_monitor() -> MeTTaHealthMonitor:
    """Get the global monitor instance"""
    return monitor
