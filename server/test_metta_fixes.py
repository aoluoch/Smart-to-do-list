#!/usr/bin/env python3
"""
Comprehensive test suite for MeTTa BorrowMutError fixes
Tests the connection pooling, monitoring, and fallback systems
"""

import sys
import time
import threading
import concurrent.futures
from datetime import datetime, timedelta
from typing import List
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import our modules
try:
    from metta_service import MeTTaSchedulerService
    from fallback_scheduler import FallbackTaskScheduler
    from metta_monitor import get_monitor
    from models import Task
except ImportError as e:
    logger.error(f"Import error: {e}")
    sys.exit(1)


def create_test_tasks() -> List[Task]:
    """Create a set of test tasks for testing"""
    base_time = datetime.now()
    
    tasks = [
        Task(
            id="task1",
            title="High Priority Task",
            description="Important task with tight deadline",
            deadline=base_time + timedelta(days=1),
            priority="high",
            duration=120,
            status="pending",
            dependencies=[]
        ),
        Task(
            id="task2",
            title="Medium Priority Task",
            description="Regular task",
            deadline=base_time + timedelta(days=3),
            priority="medium",
            duration=90,
            status="pending",
            dependencies=["task1"]
        ),
        Task(
            id="task3",
            title="Low Priority Task",
            description="Can wait",
            deadline=base_time + timedelta(days=7),
            priority="low",
            duration=60,
            status="pending",
            dependencies=[]
        ),
        Task(
            id="task4",
            title="Completed Task",
            description="Already done",
            deadline=base_time + timedelta(days=5),
            priority="medium",
            duration=45,
            status="completed",
            dependencies=[]
        ),
        Task(
            id="task5",
            title="Overdue Task",
            description="Should have been done",
            deadline=base_time - timedelta(days=2),
            priority="high",
            duration=180,
            status="pending",
            dependencies=[]
        )
    ]
    
    return tasks


def test_basic_functionality():
    """Test basic MeTTa service functionality"""
    logger.info("Testing basic functionality...")
    
    try:
        service = MeTTaSchedulerService(pool_size=3)
        tasks = create_test_tasks()
        
        # Test each method
        logger.info("Testing get_next_recommended_task...")
        next_task = service.get_next_recommended_task(tasks)
        logger.info(f"Next recommended task: {next_task}")
        
        logger.info("Testing get_ready_tasks...")
        ready_tasks = service.get_ready_tasks(tasks)
        logger.info(f"Ready tasks: {ready_tasks}")
        
        logger.info("Testing calculate_task_urgency...")
        urgency = service.calculate_task_urgency("task1", tasks)
        logger.info(f"Task1 urgency: {urgency}")
        
        logger.info("Testing check_circular_dependencies...")
        has_cycle = service.check_circular_dependencies("task1", tasks)
        logger.info(f"Has circular dependency: {has_cycle}")
        
        logger.info("Testing get_task_statistics...")
        stats = service.get_task_statistics(tasks)
        logger.info(f"Task statistics: {stats}")
        
        service.close()
        logger.info("✅ Basic functionality test passed")
        return True
        
    except Exception as e:
        logger.error(f"❌ Basic functionality test failed: {e}")
        return False


def test_concurrent_access():
    """Test concurrent access to MeTTa service"""
    logger.info("Testing concurrent access...")
    
    def worker_task(worker_id: int, service: MeTTaSchedulerService, tasks: List[Task]):
        """Worker function for concurrent testing"""
        try:
            for i in range(5):
                # Perform various operations
                next_task = service.get_next_recommended_task(tasks)
                ready_tasks = service.get_ready_tasks(tasks)
                urgency = service.calculate_task_urgency("task1", tasks)
                stats = service.get_task_statistics(tasks)
                
                logger.debug(f"Worker {worker_id}, iteration {i}: next={next_task}, ready={len(ready_tasks)}, urgency={urgency}")
                time.sleep(0.1)  # Small delay
                
            return True
        except Exception as e:
            logger.error(f"Worker {worker_id} failed: {e}")
            return False
    
    try:
        service = MeTTaSchedulerService(pool_size=5)
        tasks = create_test_tasks()
        
        # Run multiple workers concurrently
        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
            futures = [
                executor.submit(worker_task, i, service, tasks)
                for i in range(10)
            ]
            
            results = [future.result() for future in concurrent.futures.as_completed(futures)]
        
        service.close()
        
        success_count = sum(results)
        logger.info(f"Concurrent test: {success_count}/10 workers succeeded")
        
        if success_count >= 8:  # Allow some failures
            logger.info("✅ Concurrent access test passed")
            return True
        else:
            logger.error("❌ Concurrent access test failed")
            return False
            
    except Exception as e:
        logger.error(f"❌ Concurrent access test failed: {e}")
        return False


def test_fallback_system():
    """Test fallback scheduler functionality"""
    logger.info("Testing fallback system...")
    
    try:
        fallback = FallbackTaskScheduler()
        tasks = create_test_tasks()
        
        # Test fallback methods
        next_task = fallback.get_next_recommended_task(tasks)
        logger.info(f"Fallback next task: {next_task}")
        
        ready_tasks = fallback.get_ready_tasks(tasks)
        logger.info(f"Fallback ready tasks: {ready_tasks}")
        
        urgency = fallback.calculate_task_urgency("task1", tasks)
        logger.info(f"Fallback urgency: {urgency}")
        
        has_cycle = fallback.check_circular_dependencies("task1", tasks)
        logger.info(f"Fallback circular check: {has_cycle}")
        
        stats = fallback.get_task_statistics(tasks)
        logger.info(f"Fallback statistics: {stats}")
        
        recommendations = fallback.get_task_recommendations(tasks, limit=3)
        logger.info(f"Fallback recommendations: {len(recommendations)} tasks")
        
        logger.info("✅ Fallback system test passed")
        return True
        
    except Exception as e:
        logger.error(f"❌ Fallback system test failed: {e}")
        return False


def test_monitoring_system():
    """Test monitoring and health checking"""
    logger.info("Testing monitoring system...")
    
    try:
        service = MeTTaSchedulerService(pool_size=3)
        tasks = create_test_tasks()
        
        # Perform some operations to generate metrics
        for i in range(5):
            service.get_next_recommended_task(tasks)
            service.get_ready_tasks(tasks)
        
        # Test health status
        health = service.get_health_status()
        logger.info(f"Health status: {health['status']}")
        
        # Test operation metrics
        metrics = service.get_operation_metrics()
        logger.info(f"Operation metrics: {metrics.get('total_count', 0)} operations")
        
        # Test connection test
        connection_test = service.test_connection()
        logger.info(f"Connection test: {connection_test}")
        
        # Test diagnostics export
        diag_file = service.export_diagnostics()
        logger.info(f"Diagnostics exported to: {diag_file}")
        
        service.close()
        logger.info("✅ Monitoring system test passed")
        return True
        
    except Exception as e:
        logger.error(f"❌ Monitoring system test failed: {e}")
        return False


def test_error_recovery():
    """Test error recovery and retry mechanisms"""
    logger.info("Testing error recovery...")
    
    try:
        # Test with a very small pool to force contention
        service = MeTTaSchedulerService(pool_size=1)
        tasks = create_test_tasks()
        
        # Rapid concurrent requests to test retry logic
        def rapid_requests():
            results = []
            for i in range(3):
                try:
                    result = service.get_next_recommended_task(tasks)
                    results.append(result)
                except Exception as e:
                    logger.warning(f"Request failed: {e}")
                    results.append(None)
            return results
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            futures = [executor.submit(rapid_requests) for _ in range(5)]
            all_results = [future.result() for future in concurrent.futures.as_completed(futures)]
        
        # Check if we got some successful results
        successful_results = sum(1 for results in all_results for result in results if result is not None)
        total_requests = sum(len(results) for results in all_results)
        
        success_rate = successful_results / total_requests if total_requests > 0 else 0
        logger.info(f"Error recovery test: {successful_results}/{total_requests} requests succeeded ({success_rate:.1%})")
        
        service.close()
        
        if success_rate >= 0.7:  # 70% success rate is acceptable
            logger.info("✅ Error recovery test passed")
            return True
        else:
            logger.error("❌ Error recovery test failed")
            return False
            
    except Exception as e:
        logger.error(f"❌ Error recovery test failed: {e}")
        return False


def run_all_tests():
    """Run all tests and report results"""
    logger.info("🚀 Starting comprehensive MeTTa fixes test suite")
    logger.info("=" * 60)
    
    tests = [
        ("Basic Functionality", test_basic_functionality),
        ("Concurrent Access", test_concurrent_access),
        ("Fallback System", test_fallback_system),
        ("Monitoring System", test_monitoring_system),
        ("Error Recovery", test_error_recovery),
    ]
    
    results = []
    for test_name, test_func in tests:
        logger.info(f"\n🧪 Running {test_name} test...")
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            logger.error(f"Test {test_name} crashed: {e}")
            results.append((test_name, False))
    
    # Report results
    logger.info("\n" + "=" * 60)
    logger.info("📊 TEST RESULTS SUMMARY")
    logger.info("=" * 60)
    
    passed = 0
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        logger.info(f"{test_name}: {status}")
        if result:
            passed += 1
    
    total = len(results)
    logger.info(f"\nOverall: {passed}/{total} tests passed ({passed/total:.1%})")
    
    if passed == total:
        logger.info("🎉 All tests passed! MeTTa fixes are working correctly.")
        return True
    else:
        logger.error("⚠️  Some tests failed. Please review the issues above.")
        return False


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
