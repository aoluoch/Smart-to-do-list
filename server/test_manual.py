#!/usr/bin/env python3
"""
Manual testing script for Smart To-Do Scheduler API
Tests all endpoints with real HTTP requests
"""

import requests
import json
import time
from datetime import datetime, timedelta


class APITester:
    """Manual API testing class"""
    
    def __init__(self, base_url="http://localhost:5000"):
        self.base_url = base_url
        self.access_token = None
        self.headers = {'Content-Type': 'application/json'}
        self.test_user_id = None
        self.test_task_ids = []
    
    def log(self, message, status="INFO"):
        """Log test messages"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {status}: {message}")
    
    def make_request(self, method, endpoint, data=None, auth_required=True):
        """Make HTTP request with error handling"""
        url = f"{self.base_url}{endpoint}"
        headers = self.headers.copy()
        
        if auth_required and self.access_token:
            headers['Authorization'] = f'Bearer {self.access_token}'
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, headers=headers, data=json.dumps(data) if data else None)
            elif method == 'PUT':
                response = requests.put(url, headers=headers, data=json.dumps(data) if data else None)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)
            else:
                raise ValueError(f"Unsupported method: {method}")
            
            return response
        except requests.exceptions.ConnectionError:
            self.log(f"Connection error - is the server running on {self.base_url}?", "ERROR")
            return None
        except Exception as e:
            self.log(f"Request error: {e}", "ERROR")
            return None
    
    def test_health_check(self):
        """Test health check endpoint"""
        self.log("Testing health check endpoint...")
        
        response = self.make_request('GET', '/api/health', auth_required=False)
        if response and response.status_code == 200:
            data = response.json()
            self.log(f"Health check passed: {data['status']}", "SUCCESS")
            return True
        else:
            self.log("Health check failed", "ERROR")
            return False
    
    def test_user_registration(self):
        """Test user registration"""
        self.log("Testing user registration...")
        
        user_data = {
            'username': 'Test User',
            'email': 'test@example.com',
            'password': 'testpassword123',
            'workCapacity': 8,
            'emailReminders': True
        }
        
        response = self.make_request('POST', '/api/auth/register', user_data, auth_required=False)
        if response and response.status_code == 201:
            data = response.json()
            self.access_token = data['access_token']
            self.test_user_id = data['user']['id']
            self.log(f"User registered successfully: {data['user']['email']}", "SUCCESS")
            return True
        else:
            self.log(f"Registration failed: {response.text if response else 'No response'}", "ERROR")
            return False
    
    def test_user_login(self):
        """Test user login"""
        self.log("Testing user login...")
        
        login_data = {
            'email': 'test@example.com',
            'password': 'testpassword123'
        }
        
        response = self.make_request('POST', '/api/auth/login', login_data, auth_required=False)
        if response and response.status_code == 200:
            data = response.json()
            self.access_token = data['access_token']
            self.log("Login successful", "SUCCESS")
            return True
        else:
            self.log(f"Login failed: {response.text if response else 'No response'}", "ERROR")
            return False
    
    def test_get_current_user(self):
        """Test getting current user"""
        self.log("Testing get current user...")
        
        response = self.make_request('GET', '/api/auth/me')
        if response and response.status_code == 200:
            data = response.json()
            self.log(f"Current user: {data['user']['username']}", "SUCCESS")
            return True
        else:
            self.log("Get current user failed", "ERROR")
            return False
    
    def test_create_tasks(self):
        """Test creating tasks"""
        self.log("Testing task creation...")
        
        tasks = [
            {
                'title': 'High Priority Task',
                'description': 'This is a high priority task for testing',
                'deadline': (datetime.now() + timedelta(hours=2)).isoformat(),
                'priority': 'high',
                'duration': 120,
                'dependencies': [],
                'notes': 'Important task'
            },
            {
                'title': 'Medium Priority Task',
                'description': 'This is a medium priority task',
                'deadline': (datetime.now() + timedelta(days=1)).isoformat(),
                'priority': 'medium',
                'duration': 90,
                'dependencies': []
            },
            {
                'title': 'Dependent Task',
                'description': 'This task depends on the high priority task',
                'deadline': (datetime.now() + timedelta(days=2)).isoformat(),
                'priority': 'low',
                'duration': 60,
                'dependencies': []  # Will be updated after first task is created
            }
        ]
        
        created_tasks = 0
        for i, task_data in enumerate(tasks):
            response = self.make_request('POST', '/api/tasks', task_data)
            if response and response.status_code == 201:
                data = response.json()
                task_id = data['task']['id']
                self.test_task_ids.append(task_id)
                self.log(f"Task created: {data['task']['title']}", "SUCCESS")
                created_tasks += 1
                
                # Update dependency for third task
                if i == 0:
                    tasks[2]['dependencies'] = [task_id]
            else:
                self.log(f"Task creation failed: {response.text if response else 'No response'}", "ERROR")
        
        return created_tasks == len(tasks)
    
    def test_get_tasks(self):
        """Test getting all tasks"""
        self.log("Testing get all tasks...")
        
        response = self.make_request('GET', '/api/tasks')
        if response and response.status_code == 200:
            data = response.json()
            task_count = len(data['tasks'])
            self.log(f"Retrieved {task_count} tasks", "SUCCESS")
            return True
        else:
            self.log("Get tasks failed", "ERROR")
            return False
    
    def test_update_task(self):
        """Test updating a task"""
        if not self.test_task_ids:
            self.log("No tasks available for update test", "ERROR")
            return False
        
        self.log("Testing task update...")
        
        task_id = self.test_task_ids[0]
        update_data = {
            'title': 'Updated High Priority Task',
            'status': 'in-progress',
            'notes': 'Updated notes for this task'
        }
        
        response = self.make_request('PUT', f'/api/tasks/{task_id}', update_data)
        if response and response.status_code == 200:
            data = response.json()
            self.log(f"Task updated: {data['task']['title']}", "SUCCESS")
            return True
        else:
            self.log("Task update failed", "ERROR")
            return False
    
    def test_complete_task(self):
        """Test completing a task"""
        if len(self.test_task_ids) < 2:
            self.log("Not enough tasks for completion test", "ERROR")
            return False
        
        self.log("Testing task completion...")
        
        task_id = self.test_task_ids[1]
        response = self.make_request('POST', f'/api/tasks/{task_id}/complete')
        if response and response.status_code == 200:
            data = response.json()
            self.log(f"Task completed: {data['task']['title']}", "SUCCESS")
            return True
        else:
            self.log("Task completion failed", "ERROR")
            return False
    
    def test_ai_endpoints(self):
        """Test AI-powered endpoints"""
        self.log("Testing AI-powered endpoints...")
        
        # Test recommended task
        response = self.make_request('GET', '/api/tasks/recommended')
        if response and response.status_code == 200:
            data = response.json()
            if data['task']:
                self.log(f"Recommended task: {data['task']['title']}", "SUCCESS")
            else:
                self.log("No recommended task (this is okay)", "INFO")
        else:
            self.log("Get recommended task failed", "ERROR")
            return False
        
        # Test task statistics
        response = self.make_request('GET', '/api/tasks/stats')
        if response and response.status_code == 200:
            data = response.json()
            stats = data['stats']
            self.log(f"Task stats - Total: {stats['total']}, Completed: {stats['completed']}", "SUCCESS")
        else:
            self.log("Get task stats failed", "ERROR")
            return False
        
        # Test dependency graph
        response = self.make_request('GET', '/api/dependencies/graph')
        if response and response.status_code == 200:
            data = response.json()
            self.log(f"Dependency graph - Nodes: {len(data['nodes'])}, Edges: {len(data['edges'])}", "SUCCESS")
        else:
            self.log("Get dependency graph failed", "ERROR")
            return False
        
        return True
    
    def test_notifications(self):
        """Test notification endpoints"""
        self.log("Testing notification endpoints...")
        
        # Get notifications
        response = self.make_request('GET', '/api/notifications')
        if response and response.status_code == 200:
            data = response.json()
            notification_count = len(data['notifications'])
            self.log(f"Retrieved {notification_count} notifications", "SUCCESS")
            
            # Mark first notification as read if any exist
            if notification_count > 0:
                notif_id = data['notifications'][0]['id']
                response = self.make_request('PUT', f'/api/notifications/{notif_id}/read')
                if response and response.status_code == 200:
                    self.log("Notification marked as read", "SUCCESS")
                else:
                    self.log("Mark notification as read failed", "ERROR")
                    return False
            
            return True
        else:
            self.log("Get notifications failed", "ERROR")
            return False
    
    def test_delete_task(self):
        """Test deleting a task"""
        if len(self.test_task_ids) < 3:
            self.log("Not enough tasks for deletion test", "ERROR")
            return False
        
        self.log("Testing task deletion...")
        
        task_id = self.test_task_ids[2]
        response = self.make_request('DELETE', f'/api/tasks/{task_id}')
        if response and response.status_code == 200:
            self.log("Task deleted successfully", "SUCCESS")
            return True
        else:
            self.log("Task deletion failed", "ERROR")
            return False
    
    def run_all_tests(self):
        """Run all tests in sequence"""
        self.log("Starting comprehensive API testing...", "INFO")
        self.log("=" * 50, "INFO")
        
        tests = [
            ("Health Check", self.test_health_check),
            ("User Registration", self.test_user_registration),
            ("User Login", self.test_user_login),
            ("Get Current User", self.test_get_current_user),
            ("Create Tasks", self.test_create_tasks),
            ("Get All Tasks", self.test_get_tasks),
            ("Update Task", self.test_update_task),
            ("Complete Task", self.test_complete_task),
            ("AI Endpoints", self.test_ai_endpoints),
            ("Notifications", self.test_notifications),
            ("Delete Task", self.test_delete_task)
        ]
        
        passed = 0
        failed = 0
        
        for test_name, test_func in tests:
            self.log(f"\n--- Running {test_name} Test ---", "INFO")
            try:
                if test_func():
                    passed += 1
                else:
                    failed += 1
            except Exception as e:
                self.log(f"Test {test_name} crashed: {e}", "ERROR")
                failed += 1
            
            time.sleep(0.5)  # Small delay between tests
        
        self.log("\n" + "=" * 50, "INFO")
        self.log(f"Testing completed: {passed} passed, {failed} failed", "INFO")
        
        if failed == 0:
            self.log("🎉 All tests passed! API is working correctly.", "SUCCESS")
        else:
            self.log(f"❌ {failed} tests failed. Check the logs above.", "ERROR")
        
        return failed == 0


if __name__ == '__main__':
    import sys
    
    # Allow custom base URL
    base_url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:5000"
    
    tester = APITester(base_url)
    success = tester.run_all_tests()
    
    sys.exit(0 if success else 1)
