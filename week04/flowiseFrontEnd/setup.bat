@echo off
setlocal enabledelayedexpansion

echo 🚀 FlowiseAI Frontend Docker Setup
echo ==================================

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker first.
    pause
    exit /b 1
)

REM Check if docker-compose is available
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ docker-compose is not installed. Please install docker-compose first.
    pause
    exit /b 1
)

REM Create .env if it doesn't exist
if not exist .env (
    echo 📋 Creating .env file...
    copy .env.example .env
    
    echo ⚠️  Please edit .env with your configuration:
    echo    - VITE_FLOWISE_BASE_URL: Your FlowiseAI instance URL
    echo    - VITE_FLOWISE_CHATFLOW_ID: Your chatflow ID
    echo    - VITE_BASE_PATH: Your nginx base path
    echo    - VITE_FLOWISE_API_KEY: Your API key ^(if needed^)
    echo.
    pause
)

REM Build and start the container
echo 🔨 Building Docker container...
docker-compose build

echo 🚀 Starting container...
docker-compose up -d

echo.
echo ✅ Container started successfully!
echo 📁 App: http://localhost:3002/projectui/
echo 🔍 Health: http://localhost:3002/health
echo.
echo Use 'docker-compose logs -f' to view logs
echo Use 'docker-compose down' to stop the container

REM Check if container is running
timeout /t 5 /nobreak >nul
docker-compose --env-file .env.docker ps | find "Up" >nul
if %errorlevel% equ 0 (
    echo ✅ Container started successfully!
    
    REM Try to read base path from .env.docker
    set "BASE_PATH=/projectui"
    for /f "tokens=2 delims==" %%a in ('findstr "^BASE_PATH=" .env.docker 2^>nul') do set "BASE_PATH=%%a"
    
    echo.
    echo 🌐 Application URLs:
    echo    Local: http://localhost:8080!BASE_PATH!/
    echo    Health: http://localhost:8080/health
    echo.
    echo 📋 Useful commands:
    echo    View logs: docker-compose logs -f
    echo    Stop: docker-compose down
    echo    Restart: docker-compose restart
    echo.
    
    REM Test health endpoint
    echo 🏥 Testing health endpoint...
    curl -f -s http://localhost:8080/health >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ Health check passed!
    ) else (
        echo ⚠️  Health check failed. Check container logs.
    )
) else (
    echo ❌ Container failed to start. Check logs with: docker-compose logs
    pause
    exit /b 1
)

echo.
echo 🎉 Setup complete! Your FlowiseAI frontend is ready.
pause