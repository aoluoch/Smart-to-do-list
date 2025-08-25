export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  workCapacity: number; // hours per day
  emailReminders: boolean;
  createdAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  deadline: Date;
  priority: 'high' | 'medium' | 'low';
  duration: number; // in minutes
  status: 'pending' | 'in-progress' | 'completed';
  dependencies: string[]; // task IDs
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'deadline' | 'dependency' | 'overdue' | 'completed';
  taskId?: string;
  read: boolean;
  createdAt: Date;
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  inProgress: number;
}

export interface DependencyEdge {
  from: string;
  to: string;
}

export interface TaskGraph {
  nodes: Task[];
  edges: DependencyEdge[];
}