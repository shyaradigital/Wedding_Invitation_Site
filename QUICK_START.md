# Quick Start Guide - Wedding Invitation Site

## 🚀 Starting the Development Server

### Option 1: Using PowerShell Script (Recommended)
```powershell
.\start-dev.ps1
```

### Option 2: Using Batch File (Windows)
```cmd
start-dev.bat
```

### Option 3: Using npm directly
```bash
npm run dev
```

## 🔄 Restarting the Server

### Option 1: Using PowerShell Script
```powershell
.\restart-dev.ps1
```

### Option 2: Using Batch File
```cmd
restart-dev.bat
```

## 📍 Access URLs

- **Main Site**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin/login
  - **Email**: `admin`
  - **Password**: `admin123`

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push database schema
- `npm run db:studio` - Open Prisma Studio
- `npm run seed:admin` - Create admin user
- `npm run seed:events` - Seed initial events

## ✨ New Features Available

The admin panel now includes:

1. **Edit Guests** - Click "Edit" button to modify guest information
2. **Delete Guests** - Click "Delete" button to remove guests
3. **View Details** - Click "View" to see full guest information
4. **Search & Filter** - Search by name/phone/token, filter by event
5. **Export CSV** - Export guest list to CSV file
6. **Clear Devices** - Clear all device access for a guest
7. **Better Notifications** - Success/error messages instead of alerts

## 📝 Notes

- The server runs on port 3000 by default
- Database is SQLite (local development)
- All changes are hot-reloaded automatically
- Press `Ctrl+C` to stop the server

