#!/usr/bin/env python3
"""
Simple test to verify MeTTa integration is working without syntax errors
"""

from metta_service import MeTTaSchedulerService
from models import Task
from datetime import datetime, timedelta

def test_metta_service():
    """Test the MeTTa service to ensure it loads without errors"""
    print("Testing MeTTa service initialization...")
    
    try:
        # Initialize the service
        service = MeTTaSchedulerService("scheduler.metta")
        print("✓ MeTTa service initialized successfully")
        
        # Create some test tasks
        tasks = [
            Task(
                id="test1",
                title="Test Task 1",
                description="First test task",
                deadline=datetime.now() + timedelta(days=5),
                priority="high",
                duration=120,
                status="pending",
                dependencies=[]
            ),
            Task(
                id="test2", 
                title="Test Task 2",
                description="Second test task",
                deadline=datetime.now() + timedelta(days=3),
                priority="medium",
                duration=90,
                status="pending",
                dependencies=["test1"]
            )
        ]
        
        print("✓ Test tasks created")
        
        # Test loading tasks into MeTTa
        service.load_tasks_into_metta(tasks)
        print("✓ Tasks loaded into MeTTa successfully")
        
        # Test getting next recommended task
        next_task = service.get_next_recommended_task(tasks)
        print(f"✓ Next recommended task: {next_task}")
        
        # Test getting ready tasks
        ready_tasks = service.get_ready_tasks(tasks)
        print(f"✓ Ready tasks: {ready_tasks}")
        
        # Test calculating urgency
        urgency = service.calculate_task_urgency("test1", tasks)
        print(f"✓ Task urgency for test1: {urgency}")
        
        print("\n🎉 All MeTTa integration tests passed!")
        return True
        
    except Exception as e:
        print(f"❌ Error in MeTTa service: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_metta_service()
