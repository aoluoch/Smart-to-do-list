import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Task, Notification, TaskStats } from '@/types';

export interface AppContextType {
  // Authentication
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  
  // Tasks
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string) => void;
  getTaskStats: () => TaskStats;
  getNextRecommendedTask: () => Task | null;
  
  // Notifications
  notifications: Notification[];
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  
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
    const savedAuth = localStorage.getItem('todoapp_auth');
    const savedUser = localStorage.getItem('todoapp_user');
    if (savedAuth && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        // Clear invalid data
        localStorage.removeItem('todoapp_auth');
        localStorage.removeItem('todoapp_user');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // TODO: Replace with actual API call to backend
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsAuthenticated(true);
        localStorage.setItem('todoapp_auth', 'true');
        localStorage.setItem('todoapp_user', JSON.stringify(data.user));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      // TODO: Replace with actual API call to backend
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsAuthenticated(true);
        localStorage.setItem('todoapp_auth', 'true');
        localStorage.setItem('todoapp_user', JSON.stringify(data.user));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setTasks([]);
    setNotifications([]);
    localStorage.removeItem('todoapp_auth');
    localStorage.removeItem('todoapp_user');
  };

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === id 
        ? { ...task, ...updates, updatedAt: new Date() }
        : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const completeTask = (id: string) => {
    setTasks(prev => prev.map(task => 
      task.id === id 
        ? { 
            ...task, 
            status: 'completed' as const, 
            completedAt: new Date(),
            updatedAt: new Date()
          }
        : task
    ));
  };

  const getTaskStats = (): TaskStats => {
    const now = new Date();
    const total = tasks.length;
    const completed = tasks.filter(task => task.status === 'completed').length;
    const pending = tasks.filter(task => task.status === 'pending').length;
    const inProgress = tasks.filter(task => task.status === 'in-progress').length;
    const overdue = tasks.filter(task => 
      task.status !== 'completed' && task.deadline < now
    ).length;

    return { total, completed, pending, overdue, inProgress };
  };

  const getNextRecommendedTask = (): Task | null => {
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
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(notification => 
      notification.id === id 
        ? { ...notification, read: true }
        : notification
    ));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
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