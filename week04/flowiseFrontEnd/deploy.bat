@echo off
echo 🚀 Deploying FlowiseAI Frontend with PM2...
echo.

echo 🔍 Scanning existing PM2 processes...
pm2 list
echo.

echo 🧹 Cleaning up conflicting processes...
echo Stopping any existing flowise-frontend process...
pm2 stop flowise-frontend 2>nul || echo No existing flowise-frontend process found
pm2 delete flowise-frontend 2>nul || echo No existing flowise-frontend process to delete

echo.
echo 🔌 Checking port 3002...
netstat -ano | findstr :3002 >nul
if %errorlevel% equ 0 (
    echo ⚠️  Port 3002 is in use. You may need to stop the conflicting process.
    netstat -ano | findstr :3002
    echo.
    set /p continue="Continue anyway? (y/N): "
    if /i not "%continue%"=="y" (
        echo ❌ Deployment cancelled
        pause
        exit /b 1
    )
) else (
    echo ✅ Port 3002 is available
)

echo.
echo 📦 Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo 🔨 Building application...
npm run build
if %errorlevel% neq 0 (
    echo ❌ Failed to build application
    pause
    exit /b 1
)

echo.
echo 📁 Creating logs directory...
if not exist logs mkdir logs

echo.
echo 🎯 Starting with PM2...
pm2 start ecosystem.config.cjs --env production
if %errorlevel% neq 0 (
    echo ❌ Failed to start with PM2
    echo 💡 Make sure PM2 is installed: npm install -g pm2
    pause
    exit /b 1
)

echo.
echo 💾 Saving PM2 configuration...
pm2 save

echo.
echo ✅ Deployment complete!
echo.
echo 🌐 Access your app at: http://localhost:3002/projectui/
echo 📊 Monitor with: pm2 monit
echo 📋 View logs with: pm2 logs flowise-frontend
echo 📋 View status with: pm2 status
echo.
echo Press any key to continue...
pause >nul