@echo off
echo 🚀 Initializing ContentForge...

:: Kill existing processes on ports 5000 and 3000
echo 🧹 Cleaning up ports 5000 and 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000 ^| findstr LISTENING') do (
    echo Killing process %%a on port 5000...
    taskkill /f /pid %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    echo Killing process %%a on port 3000...
    taskkill /f /pid %%a >nul 2>&1
)

:: Check if node_modules exist, if not, warn the user
if not exist "backend\node_modules\" (
    echo ⚠️ Backend dependencies not found. Please run 'cd backend && npm install' first.
)
if not exist "frontend\node_modules\" (
    echo ⚠️ Frontend dependencies not found. Please run 'cd frontend && npm install' first.
)


echo 🛠️  Starting Backend on port 5000...
start /B "Backend" cmd /c "cd backend && npm run dev"

echo 🎨 Starting Frontend on port 3000...
start /B "Frontend" cmd /c "cd frontend && npm start"

:: Keep the window open and handle CTRL+C
echo.
echo 💡 Press CTRL+C twice to stop both services.
echo.

:loop
timeout /t 1 >nul
goto loop
