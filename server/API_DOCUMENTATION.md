# Smart To-Do Scheduler API Documentation

## Overview

The Smart To-Do Scheduler API is a RESTful web service built with Flask that provides intelligent task management with AI-powered scheduling capabilities. The API uses JWT authentication and integrates with a MeTTa reasoning engine for advanced task prioritization and dependency resolution.

**Base URL:** `http://localhost:5000/api`

**Authentication:** JWT Bearer Token (required for most endpoints)

**Content-Type:** `application/json`

## Authentication

All protected endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Register User
**POST** `/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "username": "string (required)",
  "email": "string (required, unique)",
  "password": "string (required)",
  "workCapacity": "integer (optional, default: 8)",
  "emailReminders": "boolean (optional, default: true)"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "username": "string",
    "email": "string",
    "avatar": "string|null",
    "workCapacity": "integer",
    "emailReminders": "boolean",
    "createdAt": "ISO 8601 datetime"
  }
}
```

**Error Responses:**
- `400` - Validation error or user already exists
- `500` - Server error

### Login
**POST** `/auth/login`

Authenticate user and receive access token.

**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "username": "string",
    "email": "string",
    "avatar": "string|null",
    "workCapacity": "integer",
    "emailReminders": "boolean",
    "createdAt": "ISO 8601 datetime"
  }
}
```

**Error Responses:**
- `400` - Missing required fields
- `401` - Invalid credentials
- `500` - Server error

### Get Current User
**GET** `/auth/me`

Get information about the currently authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "username": "string",
    "email": "string",
    "avatar": "string|null",
    "workCapacity": "integer",
    "emailReminders": "boolean",
    "createdAt": "ISO 8601 datetime"
  }
}
```

**Error Responses:**
- `401` - Invalid or missing token
- `404` - User not found
- `500` - Server error

## Task Management

### Get All Tasks
**GET** `/tasks`

Retrieve all tasks for the authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "tasks": [
    {
      "id": "uuid",
      "title": "string",
      "description": "string|null",
      "deadline": "ISO 8601 datetime",
      "priority": "high|medium|low",
      "duration": "integer (minutes)",
      "status": "pending|in-progress|completed",
      "dependencies": ["uuid", "uuid"],
      "notes": "string|null",
      "createdAt": "ISO 8601 datetime",
      "updatedAt": "ISO 8601 datetime",
      "completedAt": "ISO 8601 datetime|null"
    }
  ]
}
```

### Create Task
**POST** `/tasks`

Create a new task for the authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "string (required)",
  "description": "string (optional)",
  "deadline": "ISO 8601 datetime (required)",
  "priority": "high|medium|low (required)",
  "duration": "integer (required, minutes)",
  "dependencies": ["uuid"] (optional),
  "notes": "string (optional)"
}
```

**Response (201):**
```json
{
  "message": "Task created successfully",
  "task": {
    "id": "uuid",
    "title": "string",
    "description": "string|null",
    "deadline": "ISO 8601 datetime",
    "priority": "high|medium|low",
    "duration": "integer",
    "status": "pending",
    "dependencies": ["uuid"],
    "notes": "string|null",
    "createdAt": "ISO 8601 datetime",
    "updatedAt": "ISO 8601 datetime",
    "completedAt": null
  }
}
```

**Error Responses:**
- `400` - Validation error or circular dependency detected
- `401` - Invalid or missing token
- `500` - Server error

### Get Specific Task
**GET** `/tasks/{task_id}`

Retrieve a specific task by ID.

**Headers:** `Authorization: Bearer <token>`

**Path Parameters:**
- `task_id` (string): UUID of the task

**Response (200):**
```json
{
  "task": {
    "id": "uuid",
    "title": "string",
    "description": "string|null",
    "deadline": "ISO 8601 datetime",
    "priority": "high|medium|low",
    "duration": "integer",
    "status": "pending|in-progress|completed",
    "dependencies": ["uuid"],
    "notes": "string|null",
    "createdAt": "ISO 8601 datetime",
    "updatedAt": "ISO 8601 datetime",
    "completedAt": "ISO 8601 datetime|null"
  }
}
```

**Error Responses:**
- `401` - Invalid or missing token
- `404` - Task not found
- `500` - Server error

### Update Task
**PUT** `/tasks/{task_id}`

Update an existing task.

**Headers:** `Authorization: Bearer <token>`

**Path Parameters:**
- `task_id` (string): UUID of the task

**Request Body:** (All fields optional)
```json
{
  "title": "string",
  "description": "string",
  "deadline": "ISO 8601 datetime",
  "priority": "high|medium|low",
  "duration": "integer",
  "status": "pending|in-progress|completed",
  "dependencies": ["uuid"],
  "notes": "string"
}
```

**Response (200):**
```json
{
  "message": "Task updated successfully",
  "task": {
    "id": "uuid",
    "title": "string",
    "description": "string|null",
    "deadline": "ISO 8601 datetime",
    "priority": "high|medium|low",
    "duration": "integer",
    "status": "pending|in-progress|completed",
    "dependencies": ["uuid"],
    "notes": "string|null",
    "createdAt": "ISO 8601 datetime",
    "updatedAt": "ISO 8601 datetime",
    "completedAt": "ISO 8601 datetime|null"
  }
}
```

**Error Responses:**
- `400` - Validation error or circular dependency detected
- `401` - Invalid or missing token
- `404` - Task not found
- `500` - Server error

### Delete Task
**DELETE** `/tasks/{task_id}`

Delete a specific task.

**Headers:** `Authorization: Bearer <token>`

**Path Parameters:**
- `task_id` (string): UUID of the task

**Response (200):**
```json
{
  "message": "Task deleted successfully"
}
```

**Error Responses:**
- `401` - Invalid or missing token
- `404` - Task not found
- `500` - Server error

## AI-Powered Features

### Get Recommended Task
**GET** `/tasks/recommended`

Get the next recommended task using AI-powered scheduling algorithms.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "task": {
    "id": "uuid",
    "title": "string",
    "description": "string|null",
    "deadline": "ISO 8601 datetime",
    "priority": "high|medium|low",
    "duration": "integer",
    "status": "pending|in-progress|completed",
    "dependencies": ["uuid"],
    "notes": "string|null",
    "createdAt": "ISO 8601 datetime",
    "updatedAt": "ISO 8601 datetime",
    "completedAt": "ISO 8601 datetime|null"
  }
}
```

**Note:** Returns `{"task": null}` if no tasks are available or ready to start.

**Error Responses:**
- `401` - Invalid or missing token
- `500` - Server error

### Get Task Statistics
**GET** `/tasks/stats`

Get comprehensive statistics about user's tasks.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "stats": {
    "total": "integer",
    "pending": "integer",
    "inProgress": "integer",
    "completed": "integer",
    "overdue": "integer"
  }
}
```

**Error Responses:**
- `401` - Invalid or missing token
- `500` - Server error

### Get Dependency Graph
**GET** `/dependencies/graph`

Get task dependency graph with ready tasks identified.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "nodes": [
    {
      "id": "uuid",
      "title": "string",
      "description": "string|null",
      "deadline": "ISO 8601 datetime",
      "priority": "high|medium|low",
      "duration": "integer",
      "status": "pending|in-progress|completed",
      "dependencies": ["uuid"],
      "notes": "string|null",
      "createdAt": "ISO 8601 datetime",
      "updatedAt": "ISO 8601 datetime",
      "completedAt": "ISO 8601 datetime|null"
    }
  ],
  "edges": [
    {
      "from": "uuid",
      "to": "uuid"
    }
  ],
  "readyTasks": ["uuid", "uuid"]
}
```

**Error Responses:**
- `401` - Invalid or missing token
- `500` - Server error

## Notifications

### Get All Notifications
**GET** `/notifications`

Retrieve all notifications for the authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "notifications": [
    {
      "id": "uuid",
      "title": "string",
      "message": "string",
      "type": "deadline|dependency|overdue|completed",
      "taskId": "uuid|null",
      "read": "boolean",
      "createdAt": "ISO 8601 datetime"
    }
  ]
}
```

**Error Responses:**
- `401` - Invalid or missing token
- `500` - Server error

### Mark Notification as Read
**PUT** `/notifications/{notification_id}/read`

Mark a specific notification as read.

**Headers:** `Authorization: Bearer <token>`

**Path Parameters:**
- `notification_id` (string): UUID of the notification

**Response (200):**
```json
{
  "message": "Notification marked as read",
  "notification": {
    "id": "uuid",
    "title": "string",
    "message": "string",
    "type": "deadline|dependency|overdue|completed",
    "taskId": "uuid|null",
    "read": true,
    "createdAt": "ISO 8601 datetime"
  }
}
```

**Error Responses:**
- `401` - Invalid or missing token
- `404` - Notification not found
- `500` - Server error

### Clear All Notifications
**DELETE** `/notifications`

Clear all notifications for the authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "All notifications cleared"
}
```

**Error Responses:**
- `401` - Invalid or missing token
- `500` - Server error

## Health Check

### Server Health
**GET** `/health`

Check server health status (no authentication required).

**Response (200):**
```json
{
  "status": "healthy",
  "timestamp": "ISO 8601 datetime",
  "version": "1.0.0"
}
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error description",
  "message": "Detailed error message (optional)"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created successfully
- `400` - Bad Request (validation errors, missing fields)
- `401` - Unauthorized (invalid or missing JWT token)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

## Data Models

### User Model
```typescript
interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  workCapacity: number;
  emailReminders: boolean;
  createdAt: string;
}
```

### Task Model
```typescript
interface Task {
  id: string;
  title: string;
  description?: string;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
  duration: number; // minutes
  status: 'pending' | 'in-progress' | 'completed';
  dependencies: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}
```

### Notification Model
```typescript
interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'deadline' | 'dependency' | 'overdue' | 'completed';
  taskId?: string;
  read: boolean;
  createdAt: string;
}
```

## Rate Limiting

Currently no rate limiting is implemented. Consider implementing rate limiting for production use.

## CORS

The API supports CORS for cross-origin requests. Configure allowed origins in the environment variables.

## Authentication Flow

1. **Register** or **Login** to receive a JWT token
2. **Include the token** in the Authorization header for all protected endpoints
3. **Token expires** after the configured time (default: 1 hour)
4. **Refresh** by logging in again when token expires

## MeTTa AI Integration

The API integrates with MeTTa (Meta Type Talk) reasoning engine for:

- **Smart Task Prioritization** - Combines deadline urgency with priority weights
- **Dependency Resolution** - Ensures proper task ordering
- **Circular Dependency Detection** - Prevents invalid task relationships
- **Ready Task Identification** - Finds tasks that can be started immediately

### AI Features:
- `getNextTask()` - Get the next recommended task
- `calculateUrgency(taskId)` - Calculate urgency score
- `isReady(taskId)` - Check if task is ready to start
- `hasCircularDependency(taskId)` - Detect circular dependencies
- `getTaskStats()` - Get comprehensive statistics

## Usage Examples

### Complete Workflow Example

```bash
# 1. Register a new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "John Doe",
    "email": "john@example.com",
    "password": "securepassword",
    "workCapacity": 8,
    "emailReminders": true
  }'

# 2. Login to get token
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"securepassword"}' \
  | jq -r '.access_token')

# 3. Create a task
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Complete project documentation",
    "description": "Write comprehensive API docs",
    "deadline": "2025-08-30T17:00:00Z",
    "priority": "high",
    "duration": 120,
    "dependencies": []
  }'

# 4. Get AI recommendation
curl -X GET http://localhost:5000/api/tasks/recommended \
  -H "Authorization: Bearer $TOKEN"

# 5. Get task statistics
curl -X GET http://localhost:5000/api/tasks/stats \
  -H "Authorization: Bearer $TOKEN"
```

### JavaScript/TypeScript Example

```typescript
class TodoAPI {
  private baseURL = 'http://localhost:5000/api';
  private token: string | null = null;

  async login(email: string, password: string) {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    this.token = data.access_token;
    return data;
  }

  async createTask(task: CreateTaskRequest) {
    const response = await fetch(`${this.baseURL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify(task)
    });

    return response.json();
  }

  async getRecommendedTask() {
    const response = await fetch(`${this.baseURL}/tasks/recommended`, {
      headers: { 'Authorization': `Bearer ${this.token}` }
    });

    return response.json();
  }
}
```

### Python Example

```python
import requests
import json

class TodoAPI:
    def __init__(self, base_url="http://localhost:5000/api"):
        self.base_url = base_url
        self.token = None

    def login(self, email, password):
        response = requests.post(f"{self.base_url}/auth/login",
                               json={"email": email, "password": password})
        data = response.json()
        self.token = data.get("access_token")
        return data

    def create_task(self, task_data):
        headers = {"Authorization": f"Bearer {self.token}"}
        response = requests.post(f"{self.base_url}/tasks",
                               json=task_data, headers=headers)
        return response.json()

    def get_recommended_task(self):
        headers = {"Authorization": f"Bearer {self.token}"}
        response = requests.get(f"{self.base_url}/tasks/recommended",
                              headers=headers)
        return response.json()

# Usage
api = TodoAPI()
api.login("alex.johnson@example.com", "password")
recommendation = api.get_recommended_task()
print(f"Next task: {recommendation['task']['title']}")
```

## Best Practices

### Security
- **Always use HTTPS** in production
- **Store JWT tokens securely** (httpOnly cookies recommended)
- **Implement token refresh** for long-running applications
- **Validate all input** on both client and server
- **Use environment variables** for sensitive configuration

### Performance
- **Cache user data** to reduce API calls
- **Implement pagination** for large task lists
- **Use batch operations** when possible
- **Monitor API response times**
- **Implement proper error handling** with retries

### Error Handling
```typescript
async function apiCall(url: string, options: RequestInit) {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API call failed');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}
```

### Rate Limiting Considerations
- **Implement client-side rate limiting** to avoid overwhelming the server
- **Use exponential backoff** for retries
- **Cache responses** when appropriate
- **Batch multiple operations** into single requests when possible

## Troubleshooting

### Common Issues

**401 Unauthorized:**
- Check if JWT token is included in Authorization header
- Verify token hasn't expired (default: 1 hour)
- Ensure token format: `Bearer <token>`

**400 Bad Request:**
- Validate all required fields are present
- Check data types match API expectations
- Verify date formats are ISO 8601

**404 Not Found:**
- Confirm resource ID exists and belongs to authenticated user
- Check URL path is correct

**500 Internal Server Error:**
- Check server logs for detailed error information
- Verify database connection
- Ensure MeTTa service is running

### Debug Mode
Enable detailed logging by setting environment variable:
```bash
export FLASK_DEBUG=True
```

### Health Check
Always verify server status before making API calls:
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-08-26T12:00:00.000000",
  "version": "1.0.0"
}
```

### Complete Task
**POST** `/tasks/{task_id}/complete`

Mark a task as completed and create a completion notification.

**Headers:** `Authorization: Bearer <token>`

**Path Parameters:**
- `task_id` (string): UUID of the task

**Response (200):**
```json
{
  "message": "Task completed successfully",
  "task": {
    "id": "uuid",
    "title": "string",
    "description": "string|null",
    "deadline": "ISO 8601 datetime",
    "priority": "high|medium|low",
    "duration": "integer",
    "status": "completed",
    "dependencies": ["uuid"],
    "notes": "string|null",
    "createdAt": "ISO 8601 datetime",
    "updatedAt": "ISO 8601 datetime",
    "completedAt": "ISO 8601 datetime"
  }
}
```

**Error Responses:**
- `401` - Invalid or missing token
- `404` - Task not found
- `500` - Server error
