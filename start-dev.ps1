# Wedding Invitation Site - Development Server Startup Script
# This script starts the Next.js development server

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Wedding Invitation Site - Dev Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "ERROR: .env file not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please create a .env file with the following content:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "DATABASE_URL=`"postgresql://user:password@localhost:5432/wedsite?schema=public`"" -ForegroundColor Cyan
    Write-Host "JWT_SECRET=`"your-secret-key-here`"" -ForegroundColor Cyan
    Write-Host "ADMIN_CONTACT_PHONE=`"`"" -ForegroundColor Cyan
    Write-Host "NODE_ENV=`"development`"" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Update DATABASE_URL with your PostgreSQL connection details." -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

# Check if database exists, if not create it
if (-not (Test-Path "prisma\dev.db")) {
    Write-Host "Setting up database..." -ForegroundColor Yellow
    npx prisma db push
    Write-Host ""
    
    Write-Host "Seeding admin user..." -ForegroundColor Yellow
    npm run seed:admin
    Write-Host ""
    
    Write-Host "Seeding events..." -ForegroundColor Yellow
    npm run seed:events
    Write-Host ""
} else {
    # Apply any pending schema changes
    Write-Host "Applying database schema changes..." -ForegroundColor Yellow
    npx prisma db push --accept-data-loss
    Write-Host ""
}

Write-Host "Starting development server..." -ForegroundColor Green
Write-Host "Server will be available at: http://localhost:3000" -ForegroundColor Green
Write-Host "Admin Panel: http://localhost:3000/admin/login" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the development server
npm run dev

