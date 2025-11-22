# Wedding Invitation Site - Development Server Startup Script
# This script starts the Next.js development server

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Wedding Invitation Site - Dev Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

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
}

Write-Host "Starting development server..." -ForegroundColor Green
Write-Host "Server will be available at: http://localhost:3000" -ForegroundColor Green
Write-Host "Admin Panel: http://localhost:3000/admin/login" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the development server
npm run dev

