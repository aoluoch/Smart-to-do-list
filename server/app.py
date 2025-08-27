"""
Smart To-Do Scheduler Flask Backend
Main application file with all API endpoints
"""

import os
import uuid
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
from flask_migrate import Migrate
from dotenv import load_dotenv

from models import db, User, Task, Notification
from metta_service import MeTTaSchedulerService

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'dev-secret-key')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'dev-secret-key')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(seconds=int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES', 3600)))

# Initialize extensions
db.init_app(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)

# CORS configuration
cors_origins = os.getenv('CORS_ORIGINS', 'http://localhost:8080').split(',')
CORS(app, origins=cors_origins)

# Initialize MeTTa service
metta_service = MeTTaSchedulerService(os.getenv('METTA_SCHEDULER_FILE', 'scheduler.metta'))


# Error handlers
@app.errorhandler(400)
def bad_request(error):
    return jsonify({'error': 'Bad request', 'message': str(error)}), 400


@app.errorhandler(401)
def unauthorized(error):
    return jsonify({'error': 'Unauthorized', 'message': 'Authentication required'}), 401


@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found', 'message': 'Resource not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error', 'message': 'Something went wrong'}), 500


# Utility functions
def validate_required_fields(data, required_fields):
    """Validate that all required fields are present in request data"""
    missing_fields = [field for field in required_fields if field not in data or data[field] is None]
    if missing_fields:
        return False, f"Missing required fields: {', '.join(missing_fields)}"
    return True, None


def get_user_tasks(user_id):
    """Get all tasks for a user"""
    return Task.query.filter_by(user_id=user_id).all()


# Authentication endpoints
@app.route('/api/auth/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        
        # Validate required fields
        valid, error_msg = validate_required_fields(data, ['username', 'email', 'password'])
        if not valid:
            return jsonify({'error': error_msg}), 400
        
        # Check if user already exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'User with this email already exists'}), 400
        
        # Create new user
        user = User(
            id=str(uuid.uuid4()),
            username=data['username'],
            email=data['email'],
            work_capacity=data.get('workCapacity', 8),
            email_reminders=data.get('emailReminders', True)
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        # Create access token
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            'message': 'User registered successfully',
            'access_token': access_token,
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Registration failed', 'message': str(e)}), 500


@app.route('/api/auth/login', methods=['POST'])
def login():
    """Authenticate user and return access token"""
    try:
        data = request.get_json()
        
        # Validate required fields
        valid, error_msg = validate_required_fields(data, ['email', 'password'])
        if not valid:
            return jsonify({'error': error_msg}), 400
        
        # Find user
        user = User.query.filter_by(email=data['email']).first()
        
        if not user or not user.check_password(data['password']):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Create access token
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            'message': 'Login successful',
            'access_token': access_token,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Login failed', 'message': str(e)}), 500


@app.route('/api/auth/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current user information"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({'user': user.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get user', 'message': str(e)}), 500


# Task endpoints
@app.route('/api/tasks', methods=['GET'])
@jwt_required()
def get_tasks():
    """Get all tasks for the current user"""
    try:
        user_id = get_jwt_identity()
        tasks = get_user_tasks(user_id)
        
        return jsonify({
            'tasks': [task.to_dict() for task in tasks]
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get tasks', 'message': str(e)}), 500


@app.route('/api/tasks', methods=['POST'])
@jwt_required()
def create_task():
    """Create a new task"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['title', 'deadline', 'priority', 'duration']
        valid, error_msg = validate_required_fields(data, required_fields)
        if not valid:
            return jsonify({'error': error_msg}), 400
        
        # Parse deadline
        try:
            deadline = datetime.fromisoformat(data['deadline'].replace('Z', '+00:00'))
        except ValueError:
            return jsonify({'error': 'Invalid deadline format. Use ISO format.'}), 400
        
        # Validate priority
        if data['priority'] not in ['high', 'medium', 'low']:
            return jsonify({'error': 'Priority must be high, medium, or low'}), 400
        
        # Create new task
        task = Task(
            id=str(uuid.uuid4()),
            user_id=user_id,
            title=data['title'],
            description=data.get('description'),
            deadline=deadline,
            priority=data['priority'],
            duration=int(data['duration']),
            status=data.get('status', 'pending'),
            notes=data.get('notes')
        )
        
        # Set dependencies
        dependencies = data.get('dependencies', [])
        if dependencies:
            # Check for circular dependencies
            user_tasks = get_user_tasks(user_id)
            if metta_service.check_circular_dependencies(task.id, user_tasks + [task]):
                return jsonify({'error': 'Circular dependency detected'}), 400
        
        task.dependencies = dependencies
        
        db.session.add(task)
        db.session.commit()
        
        return jsonify({
            'message': 'Task created successfully',
            'task': task.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create task', 'message': str(e)}), 500


@app.route('/api/tasks/<task_id>', methods=['GET'])
@jwt_required()
def get_task(task_id):
    """Get a specific task"""
    try:
        user_id = get_jwt_identity()
        task = Task.query.filter_by(id=task_id, user_id=user_id).first()

        if not task:
            return jsonify({'error': 'Task not found'}), 404

        return jsonify({'task': task.to_dict()}), 200

    except Exception as e:
        return jsonify({'error': 'Failed to get task', 'message': str(e)}), 500


@app.route('/api/tasks/<task_id>', methods=['PUT'])
@jwt_required()
def update_task(task_id):
    """Update a specific task"""
    try:
        user_id = get_jwt_identity()
        task = Task.query.filter_by(id=task_id, user_id=user_id).first()

        if not task:
            return jsonify({'error': 'Task not found'}), 404

        data = request.get_json()

        # Update fields if provided
        if 'title' in data:
            task.title = data['title']
        if 'description' in data:
            task.description = data['description']
        if 'deadline' in data:
            try:
                task.deadline = datetime.fromisoformat(data['deadline'].replace('Z', '+00:00'))
            except ValueError:
                return jsonify({'error': 'Invalid deadline format'}), 400
        if 'priority' in data:
            if data['priority'] not in ['high', 'medium', 'low']:
                return jsonify({'error': 'Invalid priority'}), 400
            task.priority = data['priority']
        if 'duration' in data:
            task.duration = int(data['duration'])
        if 'status' in data:
            if data['status'] not in ['pending', 'in-progress', 'completed']:
                return jsonify({'error': 'Invalid status'}), 400
            task.status = data['status']
            if data['status'] == 'completed' and not task.completed_at:
                task.completed_at = datetime.utcnow()
        if 'notes' in data:
            task.notes = data['notes']
        if 'dependencies' in data:
            # Check for circular dependencies
            user_tasks = get_user_tasks(user_id)
            temp_task = task
            temp_task.dependencies = data['dependencies']
            if metta_service.check_circular_dependencies(task.id, user_tasks):
                return jsonify({'error': 'Circular dependency detected'}), 400
            task.dependencies = data['dependencies']

        task.updated_at = datetime.utcnow()
        db.session.commit()

        return jsonify({
            'message': 'Task updated successfully',
            'task': task.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update task', 'message': str(e)}), 500


@app.route('/api/tasks/<task_id>', methods=['DELETE'])
@jwt_required()
def delete_task(task_id):
    """Delete a specific task"""
    try:
        user_id = get_jwt_identity()
        task = Task.query.filter_by(id=task_id, user_id=user_id).first()

        if not task:
            return jsonify({'error': 'Task not found'}), 404

        db.session.delete(task)
        db.session.commit()

        return jsonify({'message': 'Task deleted successfully'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete task', 'message': str(e)}), 500


@app.route('/api/tasks/<task_id>/complete', methods=['POST'])
@jwt_required()
def complete_task(task_id):
    """Mark a task as completed"""
    try:
        user_id = get_jwt_identity()
        task = Task.query.filter_by(id=task_id, user_id=user_id).first()

        if not task:
            return jsonify({'error': 'Task not found'}), 404

        task.status = 'completed'
        task.completed_at = datetime.utcnow()
        task.updated_at = datetime.utcnow()

        db.session.commit()

        # Create completion notification
        notification = Notification(
            id=str(uuid.uuid4()),
            user_id=user_id,
            title='Task Completed',
            message=f'You completed "{task.title}"',
            type='completed',
            task_id=task.id
        )
        db.session.add(notification)
        db.session.commit()

        return jsonify({
            'message': 'Task completed successfully',
            'task': task.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to complete task', 'message': str(e)}), 500


# AI-powered endpoints
@app.route('/api/tasks/recommended', methods=['GET'])
@jwt_required()
def get_recommended_task():
    """Get the next recommended task using MeTTa AI scheduling"""
    try:
        user_id = get_jwt_identity()
        tasks = get_user_tasks(user_id)

        if not tasks:
            return jsonify({'task': None}), 200

        # Get recommendation from MeTTa service
        recommended_task_id = metta_service.get_next_recommended_task(tasks)

        if recommended_task_id:
            recommended_task = Task.query.filter_by(id=recommended_task_id, user_id=user_id).first()
            if recommended_task:
                return jsonify({'task': recommended_task.to_dict()}), 200

        # Fallback to simple priority-based recommendation
        incomplete_tasks = [t for t in tasks if t.status != 'completed']
        if incomplete_tasks:
            # Sort by priority and deadline
            priority_weights = {'high': 3, 'medium': 2, 'low': 1}
            sorted_tasks = sorted(incomplete_tasks,
                                key=lambda t: (priority_weights[t.priority], t.deadline),
                                reverse=True)
            return jsonify({'task': sorted_tasks[0].to_dict()}), 200

        return jsonify({'task': None}), 200

    except Exception as e:
        return jsonify({'error': 'Failed to get recommended task', 'message': str(e)}), 500


@app.route('/api/tasks/stats', methods=['GET'])
@jwt_required()
def get_task_stats():
    """Get task statistics"""
    try:
        user_id = get_jwt_identity()
        tasks = get_user_tasks(user_id)

        # Get statistics from MeTTa service
        stats = metta_service.get_task_statistics(tasks)

        return jsonify({'stats': stats}), 200

    except Exception as e:
        return jsonify({'error': 'Failed to get task statistics', 'message': str(e)}), 500


@app.route('/api/dependencies/graph', methods=['GET'])
@jwt_required()
def get_dependency_graph():
    """Get task dependency graph"""
    try:
        user_id = get_jwt_identity()
        tasks = get_user_tasks(user_id)

        # Build dependency edges
        edges = []
        for task in tasks:
            for dep_id in task.dependencies:
                edges.append({
                    'from': dep_id,
                    'to': task.id
                })

        # Get ready tasks using MeTTa
        ready_task_ids = metta_service.get_ready_tasks(tasks)

        return jsonify({
            'nodes': [task.to_dict() for task in tasks],
            'edges': edges,
            'readyTasks': ready_task_ids
        }), 200

    except Exception as e:
        return jsonify({'error': 'Failed to get dependency graph', 'message': str(e)}), 500


# Notification endpoints
@app.route('/api/notifications', methods=['GET'])
@jwt_required()
def get_notifications():
    """Get all notifications for the current user"""
    try:
        user_id = get_jwt_identity()
        notifications = Notification.query.filter_by(user_id=user_id).order_by(Notification.created_at.desc()).all()

        return jsonify({
            'notifications': [notification.to_dict() for notification in notifications]
        }), 200

    except Exception as e:
        return jsonify({'error': 'Failed to get notifications', 'message': str(e)}), 500


@app.route('/api/notifications/<notification_id>/read', methods=['PUT'])
@jwt_required()
def mark_notification_read(notification_id):
    """Mark a notification as read"""
    try:
        user_id = get_jwt_identity()
        notification = Notification.query.filter_by(id=notification_id, user_id=user_id).first()

        if not notification:
            return jsonify({'error': 'Notification not found'}), 404

        notification.read = True
        db.session.commit()

        return jsonify({
            'message': 'Notification marked as read',
            'notification': notification.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to mark notification as read', 'message': str(e)}), 500


@app.route('/api/notifications', methods=['DELETE'])
@jwt_required()
def clear_notifications():
    """Clear all notifications for the current user"""
    try:
        user_id = get_jwt_identity()
        Notification.query.filter_by(user_id=user_id).delete()
        db.session.commit()

        return jsonify({'message': 'All notifications cleared'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to clear notifications', 'message': str(e)}), 500


# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'version': '1.0.0'
    }), 200


# Database initialization
def create_tables():
    """Create database tables"""
    with app.app_context():
        db.create_all()
        print("Database tables created successfully")


def create_sample_data():
    """Create sample data for testing"""
    with app.app_context():
        # Check if sample user already exists
        sample_user = User.query.filter_by(email='alex.johnson@example.com').first()
        if sample_user:
            print("Sample data already exists")
            return

        # Create sample user
        user = User(
            id='1',
            username='Alex Johnson',
            email='alex.johnson@example.com',
            work_capacity=8,
            email_reminders=True
        )
        user.set_password('password')
        db.session.add(user)

        # Create sample tasks
        sample_tasks = [
            {
                'id': '1',
                'title': 'Review Project Proposal',
                'description': 'Review the Q1 project proposal and provide feedback',
                'deadline': datetime.now() + timedelta(hours=2),
                'priority': 'high',
                'duration': 120,
                'status': 'pending',
                'dependencies': [],
                'notes': 'Check budget allocation section carefully'
            },
            {
                'id': '2',
                'title': 'Setup Development Environment',
                'description': 'Configure local development environment for new project',
                'deadline': datetime.now() + timedelta(days=1),
                'priority': 'high',
                'duration': 180,
                'status': 'in-progress',
                'dependencies': ['1']
            },
            {
                'id': '3',
                'title': 'Design Database Schema',
                'description': 'Create ERD and design database schema for user management',
                'deadline': datetime.now() + timedelta(days=2),
                'priority': 'medium',
                'duration': 240,
                'status': 'pending',
                'dependencies': ['2']
            }
        ]

        for task_data in sample_tasks:
            task = Task(
                id=task_data['id'],
                user_id=user.id,
                title=task_data['title'],
                description=task_data['description'],
                deadline=task_data['deadline'],
                priority=task_data['priority'],
                duration=task_data['duration'],
                status=task_data['status'],
                notes=task_data.get('notes')
            )
            task.dependencies = task_data['dependencies']
            db.session.add(task)

        # Create sample notifications
        sample_notifications = [
            {
                'id': '1',
                'title': 'Task Due Soon',
                'message': 'Review Project Proposal is due in 2 hours',
                'type': 'deadline',
                'task_id': '1',
                'read': False
            },
            {
                'id': '2',
                'title': 'Task In Progress',
                'message': 'Setup Development Environment is currently in progress',
                'type': 'dependency',
                'task_id': '2',
                'read': True
            }
        ]

        for notif_data in sample_notifications:
            notification = Notification(
                id=notif_data['id'],
                user_id=user.id,
                title=notif_data['title'],
                message=notif_data['message'],
                type=notif_data['type'],
                task_id=notif_data['task_id'],
                read=notif_data['read']
            )
            db.session.add(notification)

        db.session.commit()
        print("Sample data created successfully")


if __name__ == '__main__':
    # Initialize database
    create_tables()

    # Create sample data for development
    if os.getenv('FLASK_ENV') == 'development':
        create_sample_data()

    # Run the application
    host = os.getenv('HOST', '0.0.0.0')
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'

    print(f"Starting Smart To-Do Scheduler API server...")
    print(f"Server running on http://{host}:{port}")
    print(f"Debug mode: {debug}")

    app.run(host=host, port=port, debug=debug)
