"""
Database models for Smart To-Do Scheduler
Matches the TypeScript interfaces from the frontend
"""

from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import json

db = SQLAlchemy()


class User(db.Model):
    """User model matching frontend User interface"""
    __tablename__ = 'users'
    
    id = db.Column(db.String(36), primary_key=True)
    username = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    avatar = db.Column(db.String(255), nullable=True)
    work_capacity = db.Column(db.Integer, default=8)  # hours per day
    email_reminders = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    tasks = db.relationship('Task', backref='user', lazy=True, cascade='all, delete-orphan')
    notifications = db.relationship('Notification', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def set_password(self, password):
        """Hash and set password"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Check if provided password matches hash"""
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        """Convert to dictionary matching frontend User interface"""
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'avatar': self.avatar,
            'workCapacity': self.work_capacity,
            'emailReminders': self.email_reminders,
            'createdAt': self.created_at.isoformat()
        }


class Task(db.Model):
    """Task model matching frontend Task interface"""
    __tablename__ = 'tasks'
    
    id = db.Column(db.String(36), primary_key=True)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    deadline = db.Column(db.DateTime, nullable=False)
    priority = db.Column(db.Enum('high', 'medium', 'low', name='priority_enum'), nullable=False)
    duration = db.Column(db.Integer, nullable=False)  # in minutes
    status = db.Column(db.Enum('pending', 'in-progress', 'completed', name='status_enum'), 
                      default='pending', nullable=False)
    dependencies_json = db.Column(db.Text, default='[]')  # JSON array of task IDs
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = db.Column(db.DateTime, nullable=True)
    
    @property
    def dependencies(self):
        """Get dependencies as list"""
        try:
            return json.loads(self.dependencies_json or '[]')
        except (json.JSONDecodeError, TypeError):
            return []
    
    @dependencies.setter
    def dependencies(self, value):
        """Set dependencies from list"""
        self.dependencies_json = json.dumps(value or [])
    
    def to_dict(self):
        """Convert to dictionary matching frontend Task interface"""
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'deadline': self.deadline.isoformat(),
            'priority': self.priority,
            'duration': self.duration,
            'status': self.status,
            'dependencies': self.dependencies,
            'notes': self.notes,
            'createdAt': self.created_at.isoformat(),
            'updatedAt': self.updated_at.isoformat(),
            'completedAt': self.completed_at.isoformat() if self.completed_at else None
        }


class Notification(db.Model):
    """Notification model matching frontend Notification interface"""
    __tablename__ = 'notifications'
    
    id = db.Column(db.String(36), primary_key=True)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    type = db.Column(db.Enum('deadline', 'dependency', 'overdue', 'completed', name='notification_type_enum'), 
                    nullable=False)
    task_id = db.Column(db.String(36), db.ForeignKey('tasks.id'), nullable=True)
    read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        """Convert to dictionary matching frontend Notification interface"""
        return {
            'id': self.id,
            'title': self.title,
            'message': self.message,
            'type': self.type,
            'taskId': self.task_id,
            'read': self.read,
            'createdAt': self.created_at.isoformat()
        }
