@echo off
REM Wedding Invitation Site - Restart Development Server Script (Windows Batch)
echo ========================================
echo Restarting Development Server...
echo ========================================
echo.

REM Stop any running Node.js processes
echo Stopping existing Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo.

REM Start the development server
echo Starting development server...
echo Server will be available at: http://localhost:3000
echo Admin Panel: http://localhost:3000/admin/login
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the development server
call npm run dev

