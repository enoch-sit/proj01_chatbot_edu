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
echo 10. Scan All PM2 Processes
echo 11. Clean All PM2 Processes
echo 12. Check Port Usage
echo 0. Exit
echo.
set /p choice="Choose an option (0-12): "

if "%choice%"=="1" goto deploy
if "%choice%"=="2" goto restart
if "%choice%"=="3" goto stop
if "%choice%"=="4" goto status
if "%choice%"=="5" goto logs_live
if "%choice%"=="6" goto logs_history
if "%choice%"=="7" goto monitor
if "%choice%"=="8" goto update
if "%choice%"=="9" goto delete
if "%choice%"=="10" goto scan_all
if "%choice%"=="11" goto clean_all
if "%choice%"=="12" goto check_port
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

:scan_all
echo.
echo 🔍 Scanning all PM2 processes...
echo.
echo === PM2 Process List ===
pm2 list
echo.
echo === Detailed Status ===
pm2 status
echo.
echo === Resource Usage ===
pm2 show flowise-frontend 2>nul || echo flowise-frontend not found
pause
goto menu

:clean_all
echo.
echo 🧹 PM2 Cleanup Options:
echo.
echo 1. Stop all PM2 processes
echo 2. Delete all PM2 processes  
echo 3. Kill PM2 daemon (nuclear reset)
echo 4. Clear PM2 logs
echo 5. Back to main menu
echo.
set /p clean_choice="Choose cleanup option (1-5): "

if "%clean_choice%"=="1" (
    echo Stopping all PM2 processes...
    pm2 stop all
    echo ✅ All processes stopped
)
if "%clean_choice%"=="2" (
    echo ⚠️ WARNING: This will delete ALL PM2 processes
    set /p confirm="Are you sure? (y/N): "
    if /i "%confirm%"=="y" (
        pm2 delete all
        echo ✅ All processes deleted
    )
)
if "%clean_choice%"=="3" (
    echo ⚠️ WARNING: This will kill the PM2 daemon
    set /p confirm="Are you sure? (y/N): "
    if /i "%confirm%"=="y" (
        pm2 kill
        echo ✅ PM2 daemon killed
    )
)
if "%clean_choice%"=="4" (
    pm2 flush
    echo ✅ All logs cleared
)
if "%clean_choice%"=="5" goto menu

pause
goto menu

:check_port
echo.
echo 🔌 Checking port usage...
echo.
echo === Port 3002 Usage ===
netstat -ano | findstr :3002
if %errorlevel% neq 0 (
    echo ✅ Port 3002 is available
) else (
    echo ⚠️ Port 3002 is in use
    echo.
    echo To kill process using port 3002:
    echo 1. Find PID from above output (last column)
    echo 2. Run: taskkill /PID ^<PID_NUMBER^> /F
)
echo.
echo === All PM2 Processes ===
pm2 list
pause
goto menu

:exit
echo.
echo 👋 Goodbye!
exit /b 0