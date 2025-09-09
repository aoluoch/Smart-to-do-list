# Smart To-Do Scheduler Backend

A Flask-based REST API backend with AI-powered task scheduling using MeTTa reasoning engine for intelligent task prioritization and dependency management.

## 🚀 Features

- **RESTful API** with comprehensive endpoints for task management
- **AI-Powered Scheduling** using MeTTa reasoning engine for intelligent task prioritization
- **JWT Authentication** for secure user sessions with token-based authorization
- **Dependency Management** with circular dependency detection and resolution
- **Real-time Notifications** for task updates, deadlines, and completion alerts
- **Comprehensive Testing** with automated test suites (16 tests, 100% coverage)
- **Database Migrations** with SQLAlchemy ORM and PostgreSQL support
- **Health Monitoring** with dedicated health check endpoints
- **CORS Support** for cross-origin requests from frontend applications

## 🚀 Quick Start

### Prerequisites

- **Python 3.8+** with pip
- **Virtual environment** (recommended)
- **Git** for version control

### Installation

1. **Navigate to server directory:**
   ```bash
cd server
```

2. **Create and activate virtual environment:**
   ```bash
python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **One-command setup:**
   ```bash
python start_server.py init
```
   This automatically:
   - ✅ Installs all Python dependencies
   - ✅ Creates `.env` configuration file
   - ✅ Initializes PostgreSQL database
   - ✅ Populates sample data (5 users, 10+ tasks)
   - ✅ Verifies MeTTa AI integration

4. **Start the development server:**
   ```bash
python start_server.py
```

🌐 **API Server:** `http://localhost:5000`
📚 **API Docs:** See [`API_DOCUMENTATION.md`](API_DOCUMENTATION.md)
🔍 **Health Check:** `curl http://localhost:5000/api/health`

## 📋 API Endpoints Overview

> **📚 Complete API Documentation:** [`API_DOCUMENTATION.md`](API_DOCUMENTATION.md)

### 🔐 Authentication
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register new user account |
| `/api/auth/login` | POST | Authenticate and get JWT token |
| `/api/auth/me` | GET | Get current user information |

### 📋 Task Management
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/tasks` | GET | Get all user tasks |
| `/api/tasks` | POST | Create new task |
| `/api/tasks/{id}` | GET | Get specific task |
| `/api/tasks/{id}` | PUT | Update task |
| `/api/tasks/{id}` | DELETE | Delete task |
| `/api/tasks/{id}/complete` | POST | Mark task as completed |

### 🤖 AI-Powered Features
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/tasks/recommended` | GET | Get AI-recommended next task |
| `/api/tasks/stats` | GET | Get task statistics |
| `/api/dependencies/graph` | GET | Get dependency graph |

### 🔔 Notifications
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/notifications` | GET | Get all notifications |
| `/api/notifications/{id}/read` | PUT | Mark notification as read |
| `/api/notifications` | DELETE | Clear all notifications |

### ❤️ Health Check
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Server health status |

### 🔑 Authentication Required
All endpoints except `/api/health`, `/api/auth/register`, and `/api/auth/login` require JWT token:
```bash
Authorization: Bearer <your_jwt_token>
```

## 🧪 Testing

### Automated Test Suite (16 Tests, 100% Coverage)
```bash
# Run complete test suite
python start_server.py test

# Run with verbose output
pytest test_api.py -v

# Run specific test
pytest test_api.py::TestAuth::test_register -v
```

### Manual Integration Testing
```bash
# Test all endpoints with real HTTP requests
python test_manual.py

# Test against custom server
python test_manual.py http://localhost:5000
```

### Quick API Testing
```bash
# Health check
curl http://localhost:5000/api/health

# Login (get token)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alex.johnson@example.com","password":"password"}'

# Get tasks (use token from login)
curl -X GET http://localhost:5000/api/tasks \
  -H "Authorization: Bearer <your_token>"
```

### Sample Users (Password: "password")
- **alex.johnson@example.com** - 10 sample tasks with dependencies
- **sarah.chen@example.com** - Clean slate for testing
- **mike.rodriguez@example.com** - Additional test user

## ⚙️ Configuration

### Environment Setup

The `python start_server.py init` command automatically creates `.env` from `.env.example`. Manual configuration:

```bash
cp .env.example .env
```

### Environment Variables

```env
# 🌐 Flask Configuration
FLASK_APP=app.py
FLASK_ENV=development  # or 'production'
FLASK_DEBUG=True

# 🗄️ Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/smart_todo

# 🔐 JWT Security
JWT_SECRET_KEY=your-super-secret-jwt-key-change-in-production
JWT_ACCESS_TOKEN_EXPIRES=3600  # 1 hour

# 🌍 CORS Configuration
CORS_ORIGINS=http://localhost:8080,http://127.0.0.1:8080

# 🖥️ Server Configuration
HOST=0.0.0.0
PORT=5000

# 🤖 MeTTa AI Configuration
METTA_SCHEDULER_FILE=scheduler.metta
```

### Database Configuration

The application requires PostgreSQL for all environments:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/smart_todo
```

**Examples:**
- **Local PostgreSQL:** `postgresql://user:pass@localhost:5432/smart_todo`
- **Cloud PostgreSQL:** `postgresql://user:pass@host:port/database`

### Security Notes
- 🔑 **Change `JWT_SECRET_KEY`** in production
- 🌐 **Update `CORS_ORIGINS`** for your frontend URL
- 🗄️ **PostgreSQL is required** for all environments

## Database Management

### Initialize Database
```bash
python init_db.py init
```

### Reset Database (drops and recreates)
```bash
python init_db.py reset
```

### Drop Database
```bash
python init_db.py drop
```

## 🤖 MeTTa AI Integration

The backend integrates with **MeTTa (Meta Type Talk)** reasoning engine for intelligent task scheduling and decision-making.

### AI Capabilities

| Feature | Description |
|---------|-------------|
| **Smart Prioritization** | Combines deadline urgency with user-defined priority weights |
| **Dependency Resolution** | Ensures tasks are scheduled only when dependencies are complete |
| **Circular Dependency Detection** | Prevents invalid task relationships and infinite loops |
| **Ready Task Identification** | Finds tasks that can be started immediately |
| **Intelligent Recommendations** | Suggests optimal next tasks based on multiple factors |

### MeTTa Functions

```python
# Core AI functions available in scheduler.metta
getNextTask()                    # Get the next recommended task
calculateUrgency(taskId)         # Calculate urgency score (0-100)
isReady(taskId)                 # Check if task is ready to start
hasCircularDependency(taskId)   # Detect circular dependencies
getTaskStats()                  # Get comprehensive task statistics
```

### Fallback Logic
When MeTTa is unavailable, the system automatically falls back to deterministic algorithms:
- **Priority-based sorting** (High → Medium → Low)
- **Deadline-based urgency** calculation
- **Simple dependency checking**
- **Basic statistics** computation

This ensures **100% uptime** even if AI components fail.
s \
  -H "Authorization: Bearer <your_token>"
```

### Sample Users (Password: "password")
- **alex.johnson@example.com** - 10 sample tasks with dependencies
- **sarah.chen@example.com** - Clean slate for testing
- **mike.rodriguez@example.com** - Additional test user

## ⚙️ Configuration

### Environment Setup

The `python start_server.py init` command automatically creates `.env` from `.env.example`. Manual configuration:

```bash
cp .env.example .env
```

### Environment Variables

```env
# 🌐 Flask Configuration
FLASK_APP=app.py
FLASK_ENV=development  # or 'production'
FLASK_DEBUG=True

# 🗄️ Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/smart_todo

# 🔐 JWT Security
JWT_SECRET_KEY=your-super-secret-jwt-key-change-in-production
JWT_ACCESS_TOKEN_EXPIRES=3600  # 1 hour

# 🌍 CORS Configuration
CORS_ORIGINS=http://localhost:8080,http://127.0.0.1:8080

# 🖥️ Server Configuration
HOST=0.0.0.0
PORT=5000

# 🤖 MeTTa AI Configuration
METTA_SCHEDULER_FILE=scheduler.metta
```

### Database Options

| Environment | Configuration |
|-------------|---------------|
| **All Environments** | `DATABASE_URL=postgresql://user:pass@host:port/db` |

### Security Notes
- 🔑 **Change `JWT_SECRET_KEY`** in production
- 🌐 **Update `CORS_ORIGINS`** for your frontend URL
- 🔒 **Use PostgreSQL** for production deployments

## Database Management

### Initialize Database
```bash
python init_db.py init
```

### Reset Database (drops and recreates)
```bash
python init_db.py reset
```

### Drop Database
```bash
python init_db.py drop
```

## 🤖 MeTTa AI Integration

The backend integrates with **MeTTa (Meta Type Talk)** reasoning engine for intelligent task scheduling and decision-making.

### AI Capabilities

| Feature | Description |
|---------|-------------|
| **Smart Prioritization** | Combines deadline urgency with user-defined priority weights |
| **Dependency Resolution** | Ensures tasks are scheduled only when dependencies are complete |
| **Circular Dependency Detection** | Prevents invalid task relationships and infinite loops |
| **Ready Task Identification** | Finds tasks that can be started immediately |
| **Intelligent Recommendations** | Suggests optimal next tasks based on multiple factors |

### MeTTa Functions

```python
# Core AI functions available in scheduler.metta
getNextTask()                    # Get the next recommended task
calculateUrgency(taskId)         # Calculate urgency score (0-100)
isReady(taskId)                 # Check if task is ready to start
hasCircularDependency(taskId)   # Detect circular dependencies
getTaskStats()                  # Get comprehensive task statistics
```

### Fallback Logic
When MeTTa is unavailable, the system automatically falls back to deterministic algorithms:
- **Priority-based sorting** (High → Medium → Low)
- **Deadline-based urgency** calculation
- **Simple dependency checking**
- **Basic statistics** computation

This ensures **100% uptime** even if AI components fail.

## Development

### Project Structure
```
server/
├── app.py                 # Main Flask application
├── models.py              # Database models
├── metta_service.py       # MeTTa integration service
├── scheduler.metta        # MeTTa knowledge base
├── requirements.txt       # Python dependencies
├── init_db.py            # Database initialization
├── start_server.py       # Server startup script
├── test_api.py           # Automated test suite
├── test_manual.py        # Manual testing script
├── .env                  # Environment configuration
└── README.md             # This file
```

### Adding New Endpoints

1. **Add route to `app.py`:**
   ```python
   @app.route('/api/new-endpoint', methods=['POST'])
   @jwt_required()
   def new_endpoint():
       # Implementation
       pass
   ```

2. **Add tests to `test_api.py`:**
   ```python
   def test_new_endpoint(self, client, auth_headers):
       response = client.post('/api/new-endpoint', headers=auth_headers)
       assert response.status_code == 200
   ```

3. **Update manual tests in `test_manual.py`**

### Database Schema Changes

1. **Modify models in `models.py`**
2. **Create migration:**
   ```bash
   flask db migrate -m "Description of changes"
   ```
3. **Apply migration:**
   ```bash
   flask db upgrade
   ```

## Production Deployment

### Environment Setup
1. Set `FLASK_ENV=production`
2. Use PostgreSQL database
3. Set strong `JWT_SECRET_KEY`
4. Configure proper CORS origins
5. Use WSGI server (gunicorn, uWSGI)

### Example with Gunicorn
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Docker Deployment
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 5000

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

## Troubleshooting

### Common Issues

**1. MeTTa Import Error:**
```bash
pip install hyperon
```

**2. Database Connection Error:**
- Check DATABASE_URL in .env
- Ensure database exists (for PostgreSQL)
- Run `python init_db.py init`

**3. CORS Issues:**
- Update CORS_ORIGINS in .env
- Ensure frontend URL is included

**4. JWT Token Issues:**
- Check JWT_SECRET_KEY is set
- Verify token expiration time

### Debug Mode

Enable debug logging:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Health Check

Check if server is running:
```bash
curl http://localhost:5000/api/health
```

## Contributing

1. Fork the repository
2. Create feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
1. Check this README
2. Run the test suite
3. Check server logs
4. Create an issue with detailed error information
