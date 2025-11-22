# Wedding Invitation Site - Restart Development Server Script
# This script stops any running Node.js processes and restarts the dev server

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Restarting Development Server..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Stop any running Node.js processes
Write-Host "Stopping existing Node.js processes..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeProcesses | Stop-Process -Force
    Start-Sleep -Seconds 2
    Write-Host "Stopped existing processes." -ForegroundColor Green
} else {
    Write-Host "No running processes found." -ForegroundColor Gray
}
Write-Host ""

# Wait a moment for ports to be released
Start-Sleep -Seconds 1

# Start the development server
Write-Host "Starting development server..." -ForegroundColor Green
Write-Host "Server will be available at: http://localhost:3000" -ForegroundColor Green
Write-Host "Admin Panel: http://localhost:3000/admin/login" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the development server
npm run dev

