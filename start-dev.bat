@echo off
REM Wedding Invitation Site - Development Server Startup Script (Windows Batch)
echo ========================================
echo Wedding Invitation Site - Dev Server
echo ========================================
echo.

REM Check if .env file exists
if not exist ".env" (
    echo ERROR: .env file not found!
    echo.
    echo Please create a .env file with the following content:
    echo.
    echo DATABASE_URL="postgresql://user:password@localhost:5432/wedsite?schema=public"
    echo JWT_SECRET="your-secret-key-here"
    echo ADMIN_CONTACT_PHONE=""
    echo NODE_ENV="development"
    echo.
    echo Update DATABASE_URL with your PostgreSQL connection details.
    echo.
    exit /b 1
)

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
) else (
    REM Apply any pending schema changes
    echo Applying database schema changes...
    call npx prisma db push --accept-data-loss
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

