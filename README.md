# 🎯 Smart To-Do Scheduler

An intelligent task management application with AI-powered scheduling, dependency management, and real-time notifications. Built with React frontend and Flask backend, featuring MeTTa reasoning engine for smart task prioritization.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.8+-blue.svg)
![React](https://img.shields.io/badge/react-18+-blue.svg)
![Flask](https://img.shields.io/badge/flask-2.3+-green.svg)

## ✨ Features

### 🤖 AI-Powered Scheduling
- **Intelligent Task Prioritization** using MeTTa reasoning engine
- **Dependency Resolution** with circular dependency detection
- **Smart Recommendations** for next tasks to work on
- **Urgency Calculation** based on deadlines and priorities

### 📋 Task Management
- **CRUD Operations** for tasks with rich metadata
- **Priority Levels** (High, Medium, Low)
- **Status Tracking** (Pending, In Progress, Completed)
- **Deadline Management** with overdue detection
- **Task Dependencies** with visual dependency graphs

### 🔐 User Management
- **JWT Authentication** with secure token-based sessions
- **User Registration** and login
- **User Profiles** with customizable work capacity
- **Multi-user Support** with data isolation

### 🔔 Notifications
- **Real-time Alerts** for deadlines and task updates
- **Multiple Notification Types** (deadline, overdue, completed, dependency)
- **Read/Unread Status** tracking
- **Task-linked Notifications** for context

### 📊 Analytics & Insights
- **Task Statistics** (total, pending, completed, overdue)
- **Dependency Graphs** with visual representation
- **Progress Tracking** and completion metrics

## 🏗️ Architecture

```
Smart-to-do-list/
├── client/                 # React Frontend (TypeScript + Vite)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities and API client
│   │   └── types/         # TypeScript type definitions
│   ├── public/            # Static assets
│   └── package.json       # Frontend dependencies
│
├── server/                # Flask Backend (Python)
│   ├── app.py            # Main Flask application
│   ├── models.py         # Database models (SQLAlchemy)
│   ├── metta_service.py  # MeTTa AI integration
│   ├── scheduler.metta   # MeTTa knowledge base
│   ├── requirements.txt  # Python dependencies
│   └── tests/            # Test suites
│
└── README.md             # This file
```

## 🚀 Quick Start

### Prerequisites

- **Python 3.8+** with pip
- **Node.js 16+** with npm
- **Git** for version control

### Backend Setup

1. **Navigate to server directory:**
   ```bash
   cd server
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Initialize the project:**
   ```bash
   python start_server.py init
   ```
   This will install dependencies, create database, and populate sample data.

4. **Start the backend server:**
   ```bash
   python start_server.py
   ```
   Server runs at `http://localhost:5000`

### Frontend Setup

1. **Navigate to client directory:**
   ```bash
   cd client
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```
   Frontend runs at `http://localhost:8080`

### Sample Users

The system comes with pre-populated sample users (password: "password"):
- **alex.johnson@example.com** - 10 sample tasks with dependencies
- **sarah.chen@example.com** - Clean slate for testing
- **mike.rodriguez@example.com** - Additional test user

## 📚 API Documentation

Comprehensive API documentation is available at [`server/API_DOCUMENTATION.md`](server/API_DOCUMENTATION.md).

### Quick API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register new user |
| `/api/auth/login` | POST | User authentication |
| `/api/tasks` | GET/POST | List/Create tasks |
| `/api/tasks/{id}` | GET/PUT/DELETE | Task operations |
| `/api/tasks/recommended` | GET | AI-recommended next task |
| `/api/tasks/stats` | GET | Task statistics |
| `/api/notifications` | GET/DELETE | Notification management |
| `/api/health` | GET | Server health check |

### Authentication

All protected endpoints require JWT token:
```bash
curl -H "Authorization: Bearer <your_jwt_token>" \
     http://localhost:5000/api/tasks
```

## 🧪 Testing

### Backend Tests
```bash
cd server
python start_server.py test  # Run automated test suite
python test_manual.py        # Run manual integration tests
```

### API Testing
```bash
# Health check
curl http://localhost:5000/api/health

# Login and get token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alex.johnson@example.com","password":"password"}'
```

## 🔧 Configuration

### Environment Variables

Copy `server/.env.example` to `server/.env` and configure:

```env
# Database - PostgreSQL required
DATABASE_URL=postgresql://username:password@localhost:5432/smart_todo

# JWT Security
JWT_SECRET_KEY=your-super-secret-key
JWT_ACCESS_TOKEN_EXPIRES=3600

# CORS
CORS_ORIGINS=http://localhost:8080

# Server
HOST=0.0.0.0
PORT=5000
```

### Database Configuration

The application requires PostgreSQL for all environments:

**Local PostgreSQL:**
```env
DATABASE_URL=postgresql://username:password@localhost:5432/smart_todo
```

**Cloud PostgreSQL:**
```env
DATABASE_URL=postgresql://user:pass@host:port/database
```

## 🤖 MeTTa AI Integration

The application uses MeTTa (Meta Type Talk) reasoning engine for intelligent task scheduling:

### AI Capabilities:
- **Priority Calculation** - Combines deadline urgency with user-defined priorities
- **Dependency Resolution** - Ensures tasks are scheduled in correct order
- **Circular Dependency Detection** - Prevents invalid task relationships
- **Ready Task Identification** - Finds tasks that can be started immediately
- **Smart Recommendations** - Suggests optimal next tasks based on multiple factors

### Fallback Logic:
When MeTTa is unavailable, the system falls back to deterministic algorithms ensuring continuous operation.

## 🚀 Deployment

### Development
```bash
# Backend
cd server && python start_server.py

# Frontend  
cd client && npm run dev
```

### Production

**Backend with Gunicorn:**
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

**Frontend Build:**
```bash
npm run build
```

### Docker Support
```dockerfile
# Backend Dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality component library
- **React Query** - Data fetching and caching

### Backend
- **Flask** - Lightweight Python web framework
- **SQLAlchemy** - Python SQL toolkit and ORM
- **Flask-JWT-Extended** - JWT authentication
- **Flask-CORS** - Cross-origin resource sharing
- **MeTTa** - AI reasoning engine integration
- **pytest** - Testing framework

### Database
- **SQLite** - Development database
- **PostgreSQL** - Production database support

## 📈 Performance

- **Backend**: Handles 100+ concurrent requests
- **Database**: Optimized queries with proper indexing
- **Frontend**: Lazy loading and code splitting
- **API**: RESTful design with efficient data transfer

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch** (`git checkout -b feature/amazing-feature`)
3. **Add tests** for new functionality
4. **Ensure all tests pass** (`python start_server.py test`)
5. **Commit changes** (`git commit -m 'Add amazing feature'`)
6. **Push to branch** (`git push origin feature/amazing-feature`)
7. **Open Pull Request**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Troubleshooting

**Common Issues:**
- **MeTTa Import Error**: `pip install hyperon`
- **Database Issues**: Run `python init_db.py reset`
- **CORS Errors**: Check `CORS_ORIGINS` in `.env`
- **JWT Issues**: Verify `JWT_SECRET_KEY` is set

**Getting Help:**
1. Check the [API Documentation](server/API_DOCUMENTATION.md)
2. Run the test suite to verify setup
3. Check server logs for detailed error information
4. Create an issue with reproduction steps

### Health Check
```bash
curl http://localhost:5000/api/health
```

## 🎯 Roadmap

- [ ] **Mobile App** - React Native implementation
- [ ] **Real-time Updates** - WebSocket integration
- [ ] **Team Collaboration** - Shared tasks and projects
- [ ] **Advanced Analytics** - Productivity insights and reports
- [ ] **Calendar Integration** - Sync with Google Calendar/Outlook
- [ ] **Email Notifications** - Automated deadline reminders
- [ ] **API Rate Limiting** - Production-ready rate limiting
- [ ] **Caching Layer** - Redis integration for performance

---

**Built with ❤️ by the Smart To-Do Scheduler Team**
