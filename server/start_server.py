#!/usr/bin/env python3
"""
Smart To-Do Scheduler Server Startup Script
Handles initialization, dependency checking, and server startup
"""

import os
import sys
import subprocess
import time
from pathlib import Path


def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        print("❌ Python 3.8 or higher is required")
        print(f"Current version: {sys.version}")
        return False
    
    print(f"✅ Python version: {sys.version.split()[0]}")
    return True


def check_virtual_environment():
    """Check if running in virtual environment (recommended)"""
    if hasattr(sys, 'real_prefix') or (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix):
        print("✅ Running in virtual environment")
        return True
    else:
        print("⚠️  Not running in virtual environment (recommended to use venv)")
        return False


def install_dependencies():
    """Install required dependencies"""
    print("Installing dependencies...")
    
    try:
        # Check if requirements.txt exists
        if not Path("requirements.txt").exists():
            print("❌ requirements.txt not found")
            return False
        
        # Install dependencies
        result = subprocess.run([
            sys.executable, "-m", "pip", "install", "-r", "requirements.txt"
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Dependencies installed successfully")
            return True
        else:
            print(f"❌ Failed to install dependencies: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"❌ Error installing dependencies: {e}")
        return False


def check_dependencies():
    """Check if all required dependencies are installed"""
    print("Checking dependencies...")
    
    required_packages = [
        'flask',
        'flask_sqlalchemy',
        'flask_jwt_extended',
        'flask_cors',
        'hyperon',
        'werkzeug',
        'dotenv'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print(f"❌ Missing packages: {', '.join(missing_packages)}")
        return False
    else:
        print("✅ All required dependencies are installed")
        return True


def check_environment_file():
    """Check if .env file exists and create from template if needed"""
    print("Checking environment configuration...")
    
    env_file = Path(".env")
    env_example = Path(".env.example")
    
    if not env_file.exists():
        if env_example.exists():
            print("Creating .env file from template...")
            try:
                with open(env_example, 'r') as src, open(env_file, 'w') as dst:
                    dst.write(src.read())
                print("✅ .env file created from template")
            except Exception as e:
                print(f"❌ Error creating .env file: {e}")
                return False
        else:
            print("❌ .env file not found and no template available")
            return False
    else:
        print("✅ .env file found")
    
    return True


def initialize_database():
    """Initialize database with tables and sample data"""
    print("Initializing database...")
    
    try:
        # Import here to avoid issues if dependencies aren't installed yet
        from init_db import main as init_db_main
        
        # Temporarily redirect stdout to capture init_db output
        import io
        from contextlib import redirect_stdout
        
        f = io.StringIO()
        with redirect_stdout(f):
            # Override sys.argv for init_db
            original_argv = sys.argv.copy()
            sys.argv = ['init_db.py', 'init']
            
            try:
                init_db_main()
                print("✅ Database initialized successfully")
                return True
            except SystemExit as e:
                if e.code == 0:
                    print("✅ Database initialized successfully")
                    return True
                else:
                    print("❌ Database initialization failed")
                    return False
            finally:
                sys.argv = original_argv
                
    except Exception as e:
        print(f"❌ Error initializing database: {e}")
        return False


def check_metta_file():
    """Check if MeTTa scheduler file exists"""
    print("Checking MeTTa scheduler file...")
    
    metta_file = Path("scheduler.metta")
    if metta_file.exists():
        print("✅ MeTTa scheduler file found")
        return True
    else:
        print("❌ scheduler.metta not found")
        return False


def start_server():
    """Start the Flask development server"""
    print("Starting Smart To-Do Scheduler API server...")
    print("=" * 50)
    
    try:
        # Import and run the Flask app
        from app import app
        
        # Get configuration from environment
        host = os.getenv('HOST', '0.0.0.0')
        port = int(os.getenv('PORT', 5000))
        debug = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
        
        print(f"Server starting on http://{host}:{port}")
        print(f"Debug mode: {debug}")
        print("Press Ctrl+C to stop the server")
        print("=" * 50)
        
        app.run(host=host, port=port, debug=debug)
        
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        return False
    
    return True


def run_tests():
    """Run the test suite"""
    print("Running test suite...")
    
    try:
        # Run pytest
        result = subprocess.run([
            sys.executable, "-m", "pytest", "test_api.py", "-v"
        ], capture_output=True, text=True)
        
        print(result.stdout)
        if result.stderr:
            print(result.stderr)
        
        if result.returncode == 0:
            print("✅ All tests passed")
            return True
        else:
            print("❌ Some tests failed")
            return False
            
    except Exception as e:
        print(f"❌ Error running tests: {e}")
        return False


def main():
    """Main startup function"""
    print("Smart To-Do Scheduler API Server")
    print("=" * 50)
    
    # Parse command line arguments
    if len(sys.argv) > 1:
        command = sys.argv[1].lower()
    else:
        command = 'start'
    
    if command == 'test':
        print("Running in test mode...")
        
        # Basic checks
        if not check_python_version():
            sys.exit(1)
        
        check_virtual_environment()
        
        if not check_dependencies():
            print("Installing dependencies...")
            if not install_dependencies():
                sys.exit(1)
        
        # Run tests
        if run_tests():
            print("🎉 All tests passed!")
        else:
            print("❌ Tests failed")
            sys.exit(1)
    
    elif command == 'install':
        print("Installing dependencies...")
        
        if not check_python_version():
            sys.exit(1)
        
        if install_dependencies():
            print("✅ Installation completed successfully")
        else:
            print("❌ Installation failed")
            sys.exit(1)
    
    elif command == 'init':
        print("Initializing project...")
        
        # Run all initialization steps
        checks = [
            ("Python version", check_python_version),
            ("Environment file", check_environment_file),
            ("Dependencies", check_dependencies),
            ("MeTTa file", check_metta_file),
            ("Database", initialize_database)
        ]
        
        for check_name, check_func in checks:
            print(f"\n--- {check_name} ---")
            if not check_func():
                print(f"❌ {check_name} check failed")
                sys.exit(1)
        
        print("\n✅ Project initialization completed successfully")
        print("Run 'python start_server.py' to start the server")
    
    elif command == 'start':
        print("Starting server...")
        
        # Run pre-flight checks
        checks = [
            check_python_version,
            check_environment_file,
            check_dependencies,
            check_metta_file
        ]
        
        for check in checks:
            if not check():
                print("\n❌ Pre-flight checks failed")
                print("Run 'python start_server.py init' to initialize the project")
                sys.exit(1)
        
        # Initialize database if needed
        initialize_database()
        
        print("\n✅ All checks passed")
        time.sleep(1)
        
        # Start the server
        start_server()
    
    else:
        print("Usage: python start_server.py [start|init|install|test]")
        print("  start   - Start the API server (default)")
        print("  init    - Initialize project (dependencies, database, etc.)")
        print("  install - Install dependencies only")
        print("  test    - Run test suite")
        sys.exit(1)


if __name__ == '__main__':
    main()
