import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Task, Notification, TaskStats } from '@/types';
import { apiService } from '@/services/api';

export interface AppContextType {
  // Authentication
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;

  // Tasks
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
  getTaskStats: () => Promise<TaskStats>;
  getNextRecommendedTask: () => Promise<Task | null>;

  // Notifications
  notifications: Notification[];
  markNotificationAsRead: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;

  // UI State
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

// useApp hook moved to @/hooks/useApp.ts

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const savedToken = localStorage.getItem('todoapp_token');
    if (savedToken) {
      // Verify token by fetching current user
      apiService.getCurrentUser()
        .then(({ user }) => {
          setUser(user);
          setIsAuthenticated(true);
          // Load user's tasks and notifications
          loadUserData();
        })
        .catch(() => {
          // Token is invalid, clear it
          apiService.logout();
          localStorage.removeItem('todoapp_user');
        });
    }
  }, []);

  const loadUserData = async () => {
    try {
      const [tasksResponse, notificationsResponse] = await Promise.all([
        apiService.getTasks(),
        apiService.getNotifications(),
      ]);
      setTasks(tasksResponse.tasks);
      setNotifications(notificationsResponse.notifications);
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiService.login(email, password);
      setUser(response.user);
      setIsAuthenticated(true);
      localStorage.setItem('todoapp_user', JSON.stringify(response.user));

      // Load user's tasks and notifications
      await loadUserData();

      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiService.register(username, email, password);
      setUser(response.user);
      setIsAuthenticated(true);
      localStorage.setItem('todoapp_user', JSON.stringify(response.user));

      // Load user's tasks and notifications (will be empty for new user)
      await loadUserData();

      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = () => {
    apiService.logout();
    setUser(null);
    setIsAuthenticated(false);
    setTasks([]);
    setNotifications([]);
    localStorage.removeItem('todoapp_user');
  };

  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await apiService.createTask(taskData);
      setTasks(prev => [response.task, ...prev]);
    } catch (error) {
      console.error('Failed to create task:', error);
      throw error;
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const response = await apiService.updateTask(id, updates);
      setTasks(prev => prev.map(task =>
        task.id === id ? response.task : task
      ));
    } catch (error) {
      console.error('Failed to update task:', error);
      throw error;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await apiService.deleteTask(id);
      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (error) {
      console.error('Failed to delete task:', error);
      throw error;
    }
  };

  const completeTask = async (id: string) => {
    try {
      const response = await apiService.completeTask(id);
      setTasks(prev => prev.map(task =>
        task.id === id ? response.task : task
      ));
      // Refresh notifications as completing a task may generate new ones
      const notificationsResponse = await apiService.getNotifications();
      setNotifications(notificationsResponse.notifications);
    } catch (error) {
      console.error('Failed to complete task:', error);
      throw error;
    }
  };

  const getTaskStats = async (): Promise<TaskStats> => {
    try {
      const response = await apiService.getTaskStats();
      return response.stats;
    } catch (error) {
      console.error('Failed to get task stats:', error);
      // Fallback to local calculation
      const now = new Date();
      const total = tasks.length;
      const completed = tasks.filter(task => task.status === 'completed').length;
      const pending = tasks.filter(task => task.status === 'pending').length;
      const inProgress = tasks.filter(task => task.status === 'in-progress').length;
      const overdue = tasks.filter(task =>
        task.status !== 'completed' && task.deadline < now
      ).length;

      return { total, completed, pending, overdue, inProgress };
    }
  };

  const getNextRecommendedTask = async (): Promise<Task | null> => {
    try {
      const response = await apiService.getRecommendedTask();
      return response.task;
    } catch (error) {
      console.error('Failed to get recommended task:', error);
      // Fallback to local calculation
      const now = new Date();
      const incompleteTasks = tasks.filter(task => task.status !== 'completed');

      // Priority scoring: deadline urgency + priority weight
      const scoredTasks = incompleteTasks.map(task => {
        const hoursUntilDeadline = (task.deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
        const priorityWeight = task.priority === 'high' ? 3 : task.priority === 'medium' ? 2 : 1;
        const urgencyScore = Math.max(0, 100 - hoursUntilDeadline); // Higher score for sooner deadlines

        return {
          task,
          score: urgencyScore * priorityWeight
        };
      });

      scoredTasks.sort((a, b) => b.score - a.score);
      return scoredTasks.length > 0 ? scoredTasks[0].task : null;
    }
  };

  const markNotificationAsRead = async (id: string) => {
    try {
      await apiService.markNotificationAsRead(id);
      setNotifications(prev => prev.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      ));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  };

  const clearAllNotifications = async () => {
    try {
      await apiService.clearAllNotifications();
      setNotifications([]);
    } catch (error) {
      console.error('Failed to clear notifications:', error);
      throw error;
    }
  };

  const value: AppContextType = {
    user,
    isAuthenticated,
    login,
    register,
    logout,
    tasks,
    addTask,
    updateTask,
    deleteTask,
    completeTask,
    getTaskStats,
    getNextRecommendedTask,
    notifications,
    markNotificationAsRead,
    clearAllNotifications,
    sidebarOpen,
    setSidebarOpen,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};