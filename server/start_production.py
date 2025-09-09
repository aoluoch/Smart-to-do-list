#!/usr/bin/env python3
import os
import subprocess
import sys
from dotenv import load_dotenv

def start_production_server():
    """Start the production server with gunicorn"""
    print("Starting Smart To-Do Scheduler in PRODUCTION mode...")
    print("=" * 60)

    # Load environment variables
    load_dotenv()
    print("🔧 Environment loaded from .env file")

    # Verify database configuration
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        print("❌ ERROR: DATABASE_URL not found in environment!")
        sys.exit(1)

    # Check if it's a PostgreSQL URL (including postgres:// variant)
    if not (database_url.startswith("postgresql://") or database_url.startswith("postgres://")):
        print(f"❌ ERROR: Unsupported database URL -> {database_url}")
        print("   Only PostgreSQL is supported in production.")
        print("   URL should start with 'postgresql://' or 'postgres://'")
        sys.exit(1)

    print("🗄️  Database: PostgreSQL")
    print(f"🗄️  Database URL: {database_url[:50]}{'...' if len(database_url) > 50 else ''}")

    try:
        cmd = [
            "gunicorn",
            "--config", "gunicorn_config.py",
            "app:app"
        ]
        print(f"Running: {' '.join(cmd)}")
        subprocess.run(cmd, check=True)

    except KeyboardInterrupt:
        print("\n👋 Production server stopped by user")
    except Exception as e:
        print(f"❌ Error starting production server: {e}")
        return False

    return True

if __name__ == '__main__':
    start_production_server()
