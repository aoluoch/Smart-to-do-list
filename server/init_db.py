#!/usr/bin/env python3
"""
Database initialization script for Smart To-Do Scheduler
Creates tables and optionally loads sample data
"""

import os
import sys
from datetime import datetime, timedelta
from app import app, db, User, Task, Notification


def create_database():
    """Create all database tables"""
    print("Creating database tables...")
    
    with app.app_context():
        try:
            db.create_all()
            print("✅ Database tables created successfully")
            return True
        except Exception as e:
            print(f"❌ Error creating database tables: {e}")
            return False


def drop_database():
    """Drop all database tables"""
    print("Dropping database tables...")
    
    with app.app_context():
        try:
            db.drop_all()
            print("✅ Database tables dropped successfully")
            return True
        except Exception as e:
            print(f"❌ Error dropping database tables: {e}")
            return False


def create_sample_user():
    """Create sample user for testing"""
    print("Creating sample user...")
    
    with app.app_context():
        try:
            # Check if user already exists
            existing_user = User.query.filter_by(email='alex.johnson@example.com').first()
            if existing_user:
                print("Sample user already exists")
                return existing_user
            
            # Create sample user
            user = User(
                id='sample-user-1',
                username='Alex Johnson',
                email='alex.johnson@example.com',
                work_capacity=8,
                email_reminders=True
            )
            user.set_password('password')
            
            db.session.add(user)
            db.session.commit()
            
            print(f"✅ Sample user created: {user.email}")
            return user
            
        except Exception as e:
            print(f"❌ Error creating sample user: {e}")
            db.session.rollback()
            return None


def create_sample_tasks(user):
    """Create sample tasks for testing"""
    print("Creating sample tasks...")
    
    with app.app_context():
        try:
            # Check if tasks already exist
            existing_tasks = Task.query.filter_by(user_id=user.id).count()
            if existing_tasks > 0:
                print(f"Sample tasks already exist ({existing_tasks} tasks)")
                return
            
            # Sample tasks with realistic data
            sample_tasks = [
                {
                    'id': 'task-1',
                    'title': 'Review Project Proposal',
                    'description': 'Review the Q1 project proposal and provide detailed feedback on budget allocation and timeline',
                    'deadline': datetime.now() + timedelta(hours=2),
                    'priority': 'high',
                    'duration': 120,
                    'status': 'pending',
                    'dependencies': [],
                    'notes': 'Focus on budget section and resource allocation'
                },
                {
                    'id': 'task-2',
                    'title': 'Setup Development Environment',
                    'description': 'Configure local development environment for the new React project',
                    'deadline': datetime.now() + timedelta(days=1),
                    'priority': 'high',
                    'duration': 180,
                    'status': 'in-progress',
                    'dependencies': ['task-1']
                },
                {
                    'id': 'task-3',
                    'title': 'Design Database Schema',
                    'description': 'Create ERD and design database schema for user management system',
                    'deadline': datetime.now() + timedelta(days=2),
                    'priority': 'medium',
                    'duration': 240,
                    'status': 'pending',
                    'dependencies': ['task-2']
                },
                {
                    'id': 'task-4',
                    'title': 'Write Unit Tests',
                    'description': 'Create comprehensive unit tests for core functionality',
                    'deadline': datetime.now() + timedelta(days=3),
                    'priority': 'medium',
                    'duration': 360,
                    'status': 'pending',
                    'dependencies': ['task-3']
                },
                {
                    'id': 'task-5',
                    'title': 'Team Standup Meeting',
                    'description': 'Daily standup with development team',
                    'deadline': datetime.now() + timedelta(minutes=30),
                    'priority': 'low',
                    'duration': 30,
                    'status': 'pending',
                    'dependencies': []
                },
                {
                    'id': 'task-6',
                    'title': 'Update Documentation',
                    'description': 'Update project documentation with latest changes',
                    'deadline': datetime.now() + timedelta(days=7),
                    'priority': 'low',
                    'duration': 90,
                    'status': 'pending',
                    'dependencies': ['task-4']
                },
                {
                    'id': 'task-7',
                    'title': 'Code Review - Authentication Module',
                    'description': 'Review pull request for authentication implementation',
                    'deadline': datetime.now() - timedelta(hours=2),  # Overdue
                    'priority': 'high',
                    'duration': 60,
                    'status': 'pending',
                    'dependencies': []
                },
                {
                    'id': 'task-8',
                    'title': 'Deploy to Staging',
                    'description': 'Deploy latest version to staging environment for testing',
                    'deadline': datetime.now() + timedelta(days=4),
                    'priority': 'medium',
                    'duration': 45,
                    'status': 'pending',
                    'dependencies': ['task-7', 'task-4']
                },
                {
                    'id': 'task-9',
                    'title': 'Client Presentation Prep',
                    'description': 'Prepare presentation materials for client demo',
                    'deadline': datetime.now() + timedelta(days=5),
                    'priority': 'high',
                    'duration': 180,
                    'status': 'completed',
                    'dependencies': [],
                    'completed_at': datetime.now() - timedelta(hours=12)
                },
                {
                    'id': 'task-10',
                    'title': 'Security Audit',
                    'description': 'Perform security audit on authentication and authorization',
                    'deadline': datetime.now() + timedelta(days=6),
                    'priority': 'high',
                    'duration': 300,
                    'status': 'pending',
                    'dependencies': ['task-8']
                }
            ]
            
            created_count = 0
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
                    notes=task_data.get('notes'),
                    completed_at=task_data.get('completed_at')
                )
                task.dependencies = task_data['dependencies']
                
                db.session.add(task)
                created_count += 1
            
            db.session.commit()
            print(f"✅ Created {created_count} sample tasks")
            
        except Exception as e:
            print(f"❌ Error creating sample tasks: {e}")
            db.session.rollback()


def create_sample_notifications(user):
    """Create sample notifications for testing"""
    print("Creating sample notifications...")
    
    with app.app_context():
        try:
            # Check if notifications already exist
            existing_notifications = Notification.query.filter_by(user_id=user.id).count()
            if existing_notifications > 0:
                print(f"Sample notifications already exist ({existing_notifications} notifications)")
                return
            
            sample_notifications = [
                {
                    'id': 'notif-1',
                    'title': 'Task Due Soon',
                    'message': 'Team Standup Meeting is due in 30 minutes',
                    'type': 'deadline',
                    'task_id': 'task-5',
                    'read': False
                },
                {
                    'id': 'notif-2',
                    'title': 'Overdue Task',
                    'message': 'Code Review - Authentication Module is now overdue',
                    'type': 'overdue',
                    'task_id': 'task-7',
                    'read': False
                },
                {
                    'id': 'notif-3',
                    'title': 'Task Completed',
                    'message': 'You completed "Client Presentation Prep"',
                    'type': 'completed',
                    'task_id': 'task-9',
                    'read': True
                },
                {
                    'id': 'notif-4',
                    'title': 'Dependency Unlocked',
                    'message': 'Setup Development Environment can now start (Review Project Proposal dependency resolved)',
                    'type': 'dependency',
                    'task_id': 'task-2',
                    'read': True
                }
            ]
            
            created_count = 0
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
                created_count += 1
            
            db.session.commit()
            print(f"✅ Created {created_count} sample notifications")
            
        except Exception as e:
            print(f"❌ Error creating sample notifications: {e}")
            db.session.rollback()


def main():
    """Main initialization function"""
    print("Smart To-Do Scheduler Database Initialization")
    print("=" * 50)
    
    # Parse command line arguments
    if len(sys.argv) > 1:
        command = sys.argv[1].lower()
    else:
        command = 'init'
    
    if command == 'drop':
        print("Dropping database...")
        if drop_database():
            print("Database dropped successfully")
        else:
            print("Failed to drop database")
            sys.exit(1)
    
    elif command == 'reset':
        print("Resetting database...")
        drop_database()
        create_database()
        
        # Create sample data
        user = create_sample_user()
        if user:
            create_sample_tasks(user)
            create_sample_notifications(user)
        
        print("Database reset completed")
    
    elif command == 'init':
        print("Initializing database...")
        
        if create_database():
            # Create sample data for development
            if os.getenv('FLASK_ENV') == 'development':
                user = create_sample_user()
                if user:
                    create_sample_tasks(user)
                    create_sample_notifications(user)
                print("Sample data created for development")
            
            print("Database initialization completed successfully")
        else:
            print("Database initialization failed")
            sys.exit(1)
    
    else:
        print("Usage: python init_db.py [init|drop|reset]")
        print("  init  - Create tables and sample data (default)")
        print("  drop  - Drop all tables")
        print("  reset - Drop and recreate tables with sample data")
        sys.exit(1)


if __name__ == '__main__':
    main()
