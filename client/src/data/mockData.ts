import { User, Task, Notification } from '@/types';

export const mockUser: User = {
  id: '1',
  username: 'Alex Johnson',
  email: 'alex.johnson@example.com',
  avatar: '/api/placeholder/150/150',
  workCapacity: 8,
  emailReminders: true,
  createdAt: new Date('2024-01-01'),
};

export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Review Project Proposal',
    description: 'Review the Q1 project proposal and provide feedback',
    deadline: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    priority: 'high',
    duration: 120, // 2 hours
    status: 'pending',
    dependencies: [],
    notes: 'Check budget allocation section carefully',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: '2',
    title: 'Setup Development Environment',
    description: 'Configure local development environment for new project',
    deadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
    priority: 'high',
    duration: 180, // 3 hours
    status: 'in-progress',
    dependencies: ['1'],
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: '3',
    title: 'Design Database Schema',
    description: 'Create ERD and design database schema for user management',
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // day after tomorrow
    priority: 'medium',
    duration: 240, // 4 hours
    status: 'pending',
    dependencies: ['2'],
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
  },
  {
    id: '4',
    title: 'Write Unit Tests',
    description: 'Create comprehensive unit tests for core functionality',
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    priority: 'medium',
    duration: 360, // 6 hours
    status: 'pending',
    dependencies: ['3'],
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
  },
  {
    id: '5',
    title: 'Team Standup Meeting',
    description: 'Daily standup with development team',
    deadline: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
    priority: 'low',
    duration: 30, // 30 minutes
    status: 'pending',
    dependencies: [],
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
  },
  {
    id: '6',
    title: 'Update Documentation',
    description: 'Update project documentation with latest changes',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    priority: 'low',
    duration: 90, // 1.5 hours
    status: 'pending',
    dependencies: ['4'],
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000),
  },
  {
    id: '7',
    title: 'Code Review - Authentication Module',
    description: 'Review pull request for authentication implementation',
    deadline: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago (overdue)
    priority: 'high',
    duration: 60, // 1 hour
    status: 'pending',
    dependencies: [],
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
  },
  {
    id: '8',
    title: 'Deploy to Staging',
    description: 'Deploy latest version to staging environment for testing',
    deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
    priority: 'medium',
    duration: 45, // 45 minutes
    status: 'pending',
    dependencies: ['7', '4'],
    createdAt: new Date(Date.now() - 15 * 60 * 1000),
    updatedAt: new Date(Date.now() - 15 * 60 * 1000),
  },
  {
    id: '9',
    title: 'Client Presentation Prep',
    description: 'Prepare presentation materials for client demo',
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    priority: 'high',
    duration: 180, // 3 hours
    status: 'completed',
    dependencies: [],
    completedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
  },
  {
    id: '10',
    title: 'Security Audit',
    description: 'Perform security audit on authentication and authorization',
    deadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 6 days from now
    priority: 'high',
    duration: 300, // 5 hours
    status: 'pending',
    dependencies: ['8'],
    createdAt: new Date(Date.now() - 10 * 60 * 1000),
    updatedAt: new Date(Date.now() - 10 * 60 * 1000),
  },
];

export const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Task Due Soon',
    message: 'Team Standup Meeting is due in 30 minutes',
    type: 'deadline',
    taskId: '5',
    read: false,
    createdAt: new Date(Date.now() - 5 * 60 * 1000),
  },
  {
    id: '2',
    title: 'Overdue Task',
    message: 'Code Review - Authentication Module is now overdue',
    type: 'overdue',
    taskId: '7',
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: '3',
    title: 'Dependency Unlocked',
    message: 'Setup Development Environment can now start (Review Project Proposal dependency resolved)',
    type: 'dependency',
    taskId: '2',
    read: true,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
  },
];