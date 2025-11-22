@echo off
REM Wedding Invitation Site - Development Server Startup Script (Windows Batch)
echo ========================================
echo Wedding Invitation Site - Dev Server
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo.
)

REM Check if database exists, if not create it
if not exist "prisma\dev.db" (
    echo Setting up database...
    call npx prisma db push
    echo.
    
    echo Seeding admin user...
    call npm run seed:admin
    echo.
    
    echo Seeding events...
    call npm run seed:events
    echo.
)

echo Starting development server...
echo Server will be available at: http://localhost:3000
echo Admin Panel: http://localhost:3000/admin/login
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the development server
call npm run dev

