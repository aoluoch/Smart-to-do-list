"""
Comprehensive test suite for Smart To-Do Scheduler API
Tests all endpoints and functionality
"""

import pytest
import json
import uuid
from datetime import datetime, timedelta
from app import app, db, User, Task, Notification


@pytest.fixture
def client():
    """Create test client"""
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['JWT_SECRET_KEY'] = 'test-secret-key'
    
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            yield client
            db.drop_all()


@pytest.fixture
def auth_headers(client):
    """Create authenticated user and return auth headers"""
    # Register test user
    user_data = {
        'username': 'Test User',
        'email': 'test@example.com',
        'password': 'testpassword123'
    }
    
    response = client.post('/api/auth/register', 
                          data=json.dumps(user_data),
                          content_type='application/json')
    
    assert response.status_code == 201
    data = json.loads(response.data)
    token = data['access_token']
    
    return {'Authorization': f'Bearer {token}'}


class TestAuthentication:
    """Test authentication endpoints"""
    
    def test_register_success(self, client):
        """Test successful user registration"""
        user_data = {
            'username': 'New User',
            'email': 'newuser@example.com',
            'password': 'password123'
        }
        
        response = client.post('/api/auth/register',
                              data=json.dumps(user_data),
                              content_type='application/json')
        
        assert response.status_code == 201
        data = json.loads(response.data)
        assert 'access_token' in data
        assert 'user' in data
        assert data['user']['email'] == user_data['email']
    
    def test_register_duplicate_email(self, client):
        """Test registration with duplicate email"""
        user_data = {
            'username': 'User One',
            'email': 'duplicate@example.com',
            'password': 'password123'
        }
        
        # First registration
        response1 = client.post('/api/auth/register',
                               data=json.dumps(user_data),
                               content_type='application/json')
        assert response1.status_code == 201
        
        # Second registration with same email
        user_data['username'] = 'User Two'
        response2 = client.post('/api/auth/register',
                               data=json.dumps(user_data),
                               content_type='application/json')
        assert response2.status_code == 400
    
    def test_login_success(self, client):
        """Test successful login"""
        # Register user first
        user_data = {
            'username': 'Login User',
            'email': 'login@example.com',
            'password': 'loginpassword'
        }
        
        client.post('/api/auth/register',
                   data=json.dumps(user_data),
                   content_type='application/json')
        
        # Login
        login_data = {
            'email': 'login@example.com',
            'password': 'loginpassword'
        }
        
        response = client.post('/api/auth/login',
                              data=json.dumps(login_data),
                              content_type='application/json')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'access_token' in data
        assert 'user' in data
    
    def test_login_invalid_credentials(self, client):
        """Test login with invalid credentials"""
        login_data = {
            'email': 'nonexistent@example.com',
            'password': 'wrongpassword'
        }
        
        response = client.post('/api/auth/login',
                              data=json.dumps(login_data),
                              content_type='application/json')
        
        assert response.status_code == 401
    
    def test_get_current_user(self, client, auth_headers):
        """Test getting current user info"""
        response = client.get('/api/auth/me', headers=auth_headers)
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'user' in data
        assert data['user']['email'] == 'test@example.com'


class TestTasks:
    """Test task endpoints"""
    
    def test_create_task(self, client, auth_headers):
        """Test creating a new task"""
        task_data = {
            'title': 'Test Task',
            'description': 'This is a test task',
            'deadline': (datetime.now() + timedelta(days=1)).isoformat(),
            'priority': 'high',
            'duration': 120,
            'dependencies': []
        }
        
        response = client.post('/api/tasks',
                              data=json.dumps(task_data),
                              content_type='application/json',
                              headers=auth_headers)
        
        assert response.status_code == 201
        data = json.loads(response.data)
        assert 'task' in data
        assert data['task']['title'] == task_data['title']
    
    def test_get_tasks(self, client, auth_headers):
        """Test getting all tasks"""
        # Create a task first
        task_data = {
            'title': 'Get Tasks Test',
            'deadline': (datetime.now() + timedelta(days=1)).isoformat(),
            'priority': 'medium',
            'duration': 60
        }
        
        client.post('/api/tasks',
                   data=json.dumps(task_data),
                   content_type='application/json',
                   headers=auth_headers)
        
        # Get tasks
        response = client.get('/api/tasks', headers=auth_headers)
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'tasks' in data
        assert len(data['tasks']) >= 1
    
    def test_update_task(self, client, auth_headers):
        """Test updating a task"""
        # Create task
        task_data = {
            'title': 'Original Title',
            'deadline': (datetime.now() + timedelta(days=1)).isoformat(),
            'priority': 'low',
            'duration': 30
        }
        
        create_response = client.post('/api/tasks',
                                     data=json.dumps(task_data),
                                     content_type='application/json',
                                     headers=auth_headers)
        
        task_id = json.loads(create_response.data)['task']['id']
        
        # Update task
        update_data = {
            'title': 'Updated Title',
            'priority': 'high'
        }
        
        response = client.put(f'/api/tasks/{task_id}',
                             data=json.dumps(update_data),
                             content_type='application/json',
                             headers=auth_headers)
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['task']['title'] == 'Updated Title'
        assert data['task']['priority'] == 'high'
    
    def test_complete_task(self, client, auth_headers):
        """Test completing a task"""
        # Create task
        task_data = {
            'title': 'Task to Complete',
            'deadline': (datetime.now() + timedelta(days=1)).isoformat(),
            'priority': 'medium',
            'duration': 45
        }
        
        create_response = client.post('/api/tasks',
                                     data=json.dumps(task_data),
                                     content_type='application/json',
                                     headers=auth_headers)
        
        task_id = json.loads(create_response.data)['task']['id']
        
        # Complete task
        response = client.post(f'/api/tasks/{task_id}/complete',
                              headers=auth_headers)
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['task']['status'] == 'completed'
        assert data['task']['completedAt'] is not None
    
    def test_delete_task(self, client, auth_headers):
        """Test deleting a task"""
        # Create task
        task_data = {
            'title': 'Task to Delete',
            'deadline': (datetime.now() + timedelta(days=1)).isoformat(),
            'priority': 'low',
            'duration': 15
        }
        
        create_response = client.post('/api/tasks',
                                     data=json.dumps(task_data),
                                     content_type='application/json',
                                     headers=auth_headers)
        
        task_id = json.loads(create_response.data)['task']['id']
        
        # Delete task
        response = client.delete(f'/api/tasks/{task_id}',
                                headers=auth_headers)
        
        assert response.status_code == 200
        
        # Verify task is deleted
        get_response = client.get(f'/api/tasks/{task_id}',
                                 headers=auth_headers)
        assert get_response.status_code == 404


class TestAIPoweredEndpoints:
    """Test AI-powered endpoints"""
    
    def test_get_recommended_task(self, client, auth_headers):
        """Test getting recommended task"""
        # Create some tasks
        tasks = [
            {
                'title': 'High Priority Task',
                'deadline': (datetime.now() + timedelta(hours=2)).isoformat(),
                'priority': 'high',
                'duration': 60
            },
            {
                'title': 'Low Priority Task',
                'deadline': (datetime.now() + timedelta(days=7)).isoformat(),
                'priority': 'low',
                'duration': 30
            }
        ]
        
        for task_data in tasks:
            client.post('/api/tasks',
                       data=json.dumps(task_data),
                       content_type='application/json',
                       headers=auth_headers)
        
        # Get recommendation
        response = client.get('/api/tasks/recommended', headers=auth_headers)
        
        assert response.status_code == 200
        data = json.loads(response.data)
        # Should recommend the high priority task
        if data['task']:
            assert data['task']['priority'] == 'high'
    
    def test_get_task_stats(self, client, auth_headers):
        """Test getting task statistics"""
        response = client.get('/api/tasks/stats', headers=auth_headers)
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'stats' in data
        assert 'total' in data['stats']
        assert 'completed' in data['stats']
        assert 'pending' in data['stats']
    
    def test_get_dependency_graph(self, client, auth_headers):
        """Test getting dependency graph"""
        response = client.get('/api/dependencies/graph', headers=auth_headers)
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'nodes' in data
        assert 'edges' in data
        assert 'readyTasks' in data


class TestNotifications:
    """Test notification endpoints"""
    
    def test_get_notifications(self, client, auth_headers):
        """Test getting notifications"""
        response = client.get('/api/notifications', headers=auth_headers)
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'notifications' in data
    
    def test_clear_notifications(self, client, auth_headers):
        """Test clearing all notifications"""
        response = client.delete('/api/notifications', headers=auth_headers)
        
        assert response.status_code == 200


class TestHealthCheck:
    """Test health check endpoint"""
    
    def test_health_check(self, client):
        """Test health check endpoint"""
        response = client.get('/api/health')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['status'] == 'healthy'
        assert 'timestamp' in data
        assert 'version' in data


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
