
# Gunicorn configuration for Smart To-Do Scheduler
import os
from dotenv import load_dotenv

# Load environment variables before starting
load_dotenv()

bind = "0.0.0.0:5000"
workers = 4
worker_class = "sync"
worker_connections = 1000
timeout = 30
keepalive = 2
max_requests = 1000
max_requests_jitter = 100
preload_app = True

# Environment-based configuration
port = int(os.getenv('PORT', 5000))
host = os.getenv('HOST', '0.0.0.0')
bind = f"{host}:{port}"

# Debug information
def on_starting(server):
    """Called just before the master process is initialized."""
    database_url = os.getenv('DATABASE_URL')
    if database_url:
        db_type = 'PostgreSQL' if (database_url.startswith('postgresql') or database_url.startswith('postgres')) else 'Other'
        server.log.info(f"🗄️  Database: {db_type}")
        server.log.info(f"🗄️  Database URL: {database_url[:50]}{'...' if len(database_url) > 50 else ''}")
    else:
        server.log.warning("⚠️  WARNING: DATABASE_URL not found in environment!")

    server.log.info(f"🚀 Starting server on {bind}")
    server.log.info(f"🔧 Environment: {os.getenv('FLASK_ENV', 'not set')}")

