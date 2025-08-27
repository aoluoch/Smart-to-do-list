import { User, Task, Notification, TaskStats } from '@/types';

const API_BASE_URL = '/api';

interface LoginResponse {
  message: string;
  access_token: string;
  user: User;
}

interface RegisterResponse {
  message: string;
  access_token: string;
  user: User;
}

interface TaskResponse {
  message: string;
  task: Task;
}

interface TasksResponse {
  tasks: Task[];
}

interface NotificationsResponse {
  notifications: Notification[];
}

interface StatsResponse {
  stats: TaskStats;
}

interface RecommendedTaskResponse {
  task: Task | null;
}

class ApiService {
  private token: string | null = null;

  constructor() {
    // Load token from localStorage on initialization
    this.token = localStorage.getItem('todoapp_token');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  private convertDates(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    
    if (typeof obj === 'string') {
      // Check if it's an ISO date string
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(obj)) {
        return new Date(obj);
      }
      return obj;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.convertDates(item));
    }
    
    if (typeof obj === 'object') {
      const converted: any = {};
      for (const [key, value] of Object.entries(obj)) {
        converted[key] = this.convertDates(value);
      }
      return converted;
    }
    
    return obj;
  }

  // Authentication
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password }),
    });

    const data = await this.handleResponse<LoginResponse>(response);
    
    // Store token
    this.token = data.access_token;
    localStorage.setItem('todoapp_token', this.token);
    
    // Convert date strings to Date objects
    data.user = this.convertDates(data.user);
    
    return data;
  }

  async register(username: string, email: string, password: string): Promise<RegisterResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ username, email, password }),
    });

    const data = await this.handleResponse<RegisterResponse>(response);
    
    // Store token
    this.token = data.access_token;
    localStorage.setItem('todoapp_token', this.token);
    
    // Convert date strings to Date objects
    data.user = this.convertDates(data.user);
    
    return data;
  }

  async getCurrentUser(): Promise<{ user: User }> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: this.getHeaders(),
    });

    const data = await this.handleResponse<{ user: User }>(response);
    data.user = this.convertDates(data.user);
    
    return data;
  }

  logout(): void {
    this.token = null;
    localStorage.removeItem('todoapp_token');
  }

  // Tasks
  async getTasks(): Promise<TasksResponse> {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      headers: this.getHeaders(),
    });

    const data = await this.handleResponse<TasksResponse>(response);
    data.tasks = this.convertDates(data.tasks);
    
    return data;
  }

  async createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'>): Promise<TaskResponse> {
    // Convert Date objects to ISO strings for API
    const apiTaskData = {
      ...taskData,
      deadline: taskData.deadline.toISOString(),
    };

    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(apiTaskData),
    });

    const data = await this.handleResponse<TaskResponse>(response);
    data.task = this.convertDates(data.task);
    
    return data;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<TaskResponse> {
    // Convert Date objects to ISO strings for API
    const apiUpdates = { ...updates };
    if (apiUpdates.deadline) {
      apiUpdates.deadline = apiUpdates.deadline.toISOString() as any;
    }
    if (apiUpdates.completedAt) {
      apiUpdates.completedAt = apiUpdates.completedAt.toISOString() as any;
    }

    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(apiUpdates),
    });

    const data = await this.handleResponse<TaskResponse>(response);
    data.task = this.convertDates(data.task);
    
    return data;
  }

  async deleteTask(id: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    return this.handleResponse<{ message: string }>(response);
  }

  async completeTask(id: string): Promise<TaskResponse> {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}/complete`, {
      method: 'POST',
      headers: this.getHeaders(),
    });

    const data = await this.handleResponse<TaskResponse>(response);
    data.task = this.convertDates(data.task);
    
    return data;
  }

  async getRecommendedTask(): Promise<RecommendedTaskResponse> {
    const response = await fetch(`${API_BASE_URL}/tasks/recommended`, {
      headers: this.getHeaders(),
    });

    const data = await this.handleResponse<RecommendedTaskResponse>(response);
    if (data.task) {
      data.task = this.convertDates(data.task);
    }
    
    return data;
  }

  async getTaskStats(): Promise<StatsResponse> {
    const response = await fetch(`${API_BASE_URL}/tasks/stats`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse<StatsResponse>(response);
  }

  // Notifications
  async getNotifications(): Promise<NotificationsResponse> {
    const response = await fetch(`${API_BASE_URL}/notifications`, {
      headers: this.getHeaders(),
    });

    const data = await this.handleResponse<NotificationsResponse>(response);
    data.notifications = this.convertDates(data.notifications);
    
    return data;
  }

  async markNotificationAsRead(id: string): Promise<{ message: string; notification: Notification }> {
    const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
      method: 'PUT',
      headers: this.getHeaders(),
    });

    const data = await this.handleResponse<{ message: string; notification: Notification }>(response);
    data.notification = this.convertDates(data.notification);
    
    return data;
  }

  async clearAllNotifications(): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/notifications`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    return this.handleResponse<{ message: string }>(response);
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string; version: string }> {
    const response = await fetch(`${API_BASE_URL}/health`);
    return this.handleResponse<{ status: string; timestamp: string; version: string }>(response);
  }
}

export const apiService = new ApiService();
