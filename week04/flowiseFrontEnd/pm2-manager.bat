@echo off
setlocal

:menu
cls
echo.
echo ================================
echo    FlowiseAI Frontend Manager
echo ================================
echo.
echo 1. Deploy (First time)
echo 2. Restart Application
echo 3. Stop Application
echo 4. View Status
echo 5. View Logs (live)
echo 6. View Logs (last 50 lines)
echo 7. Monitor (CPU/Memory)
echo 8. Update & Restart
echo 9. Delete from PM2
echo 0. Exit
echo.
set /p choice="Choose an option (0-9): "

if "%choice%"=="1" goto deploy
if "%choice%"=="2" goto restart
if "%choice%"=="3" goto stop
if "%choice%"=="4" goto status
if "%choice%"=="5" goto logs_live
if "%choice%"=="6" goto logs_history
if "%choice%"=="7" goto monitor
if "%choice%"=="8" goto update
if "%choice%"=="9" goto delete
if "%choice%"=="0" goto exit
echo Invalid choice. Please try again.
pause
goto menu

:deploy
echo.
echo 🚀 Deploying FlowiseAI Frontend...
call deploy.bat
pause
goto menu

:restart
echo.
echo 🔄 Restarting flowise-frontend...
pm2 restart flowise-frontend
echo.
pm2 status flowise-frontend
pause
goto menu

:stop
echo.
echo ⏹️ Stopping flowise-frontend...
pm2 stop flowise-frontend
echo.
pm2 status flowise-frontend
pause
goto menu

:status
echo.
echo 📊 Application Status:
pm2 status flowise-frontend
echo.
echo 🌐 App URL: http://localhost:3002/projectui/
pause
goto menu

:logs_live
echo.
echo 📋 Live Logs (Press Ctrl+C to stop):
pm2 logs flowise-frontend
pause
goto menu

:logs_history
echo.
echo 📋 Last 50 log lines:
pm2 logs flowise-frontend --lines 50
pause
goto menu

:monitor
echo.
echo 📈 Starting PM2 Monitor (Press Ctrl+C to stop):
pm2 monit
pause
goto menu

:update
echo.
echo 🔄 Updating and restarting...
echo.
echo 📦 Installing dependencies...
npm install
echo.
echo 🔨 Building application...
npm run build
echo.
echo 🔄 Restarting PM2 process...
pm2 restart flowise-frontend
echo.
echo ✅ Update complete!
pm2 status flowise-frontend
pause
goto menu

:delete
echo.
echo ⚠️ WARNING: This will remove flowise-frontend from PM2
set /p confirm="Are you sure? (y/N): "
if /i "%confirm%"=="y" (
    pm2 delete flowise-frontend
    echo ✅ flowise-frontend removed from PM2
) else (
    echo ❌ Operation cancelled
)
pause
goto menu

:exit
echo.
echo 👋 Goodbye!
exit /b 0