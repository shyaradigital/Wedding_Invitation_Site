# Local Development Setup Guide

This guide will help you set up and run the Wedding Invitation Website locally.

## Prerequisites

- **Node.js 18+** and npm (or yarn/pnpm)
- **Git** (if cloning from repository)

## Quick Start

### Option 1: Automated Setup (Recommended for Windows)

1. **Run the startup script:**
   ```powershell
   .\start-dev.ps1
   ```
   
   Or using batch file:
   ```cmd
   start-dev.bat
   ```

   This script will:
   - Install dependencies if needed
   - Set up the database automatically
   - Seed admin user and events
   - Start the development server

### Option 2: Manual Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   
   Create a `.env` file in the root directory with the following:
   ```env
   # Database (SQLite for local development)
   DATABASE_URL="file:./prisma/dev.db"
   
   # JWT Secret (change in production)
   JWT_SECRET="change-me-in-production"
   
   # Admin credentials (optional - defaults shown)
   ADMIN_EMAIL="admin"
   ADMIN_PASSWORD="admin123"
   
   # Contact information
   NEXT_PUBLIC_ADMIN_CONTACT="+1234567890"
   ```

3. **Set up the database:**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push database schema
   npm run db:push
   
   # Create admin user
   npm run seed:admin
   
   # Seed initial events (optional)
   npm run seed:events
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

## Access URLs

Once the server is running:

- **Main Site**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin/login
  - **Email**: `admin`
  - **Password**: `admin123`

⚠️ **Important**: Change the admin password after first login in production!

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push database schema changes |
| `npm run db:studio` | Open Prisma Studio (database GUI) |
| `npm run db:migrate` | Create a new migration |
| `npm run seed:admin` | Create/update admin user |
| `npm run seed:events` | Seed initial events |

## Database

### Local Development (SQLite)

The project uses SQLite for local development by default. The database file is located at:
```
prisma/dev.db
```

### Viewing the Database

You can view and edit the database using Prisma Studio:
```bash
npm run db:studio
```

This will open a web interface at http://localhost:5555 where you can:
- View all tables (Guest, Admin, Event, Content)
- Edit records directly
- Add new records
- Delete records

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── admin/             # Admin panel pages
│   └── invite/[token]/    # Guest invitation pages
├── components/            # React components
├── lib/                   # Utility functions
├── prisma/                # Database schema and migrations
│   ├── schema.prisma      # Database schema
│   └── dev.db            # SQLite database (local)
├── public/                # Static assets
│   ├── icons/            # Event icons
│   └── images/           # Images (Ganesh, etc.)
├── scripts/               # Utility scripts
└── .env                   # Environment variables (create this)
```

## Troubleshooting

### Port 3000 Already in Use

If port 3000 is already in use, you can change it:
```bash
PORT=3001 npm run dev
```

### Database Issues

If you encounter database errors:

1. **Reset the database:**
   ```bash
   # Delete the database file
   rm prisma/dev.db
   
   # Recreate it
   npm run db:push
   npm run seed:admin
   npm run seed:events
   ```

2. **Regenerate Prisma client:**
   ```bash
   npm run db:generate
   ```

### Dependencies Issues

If you have issues with dependencies:

1. **Clear node_modules and reinstall:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Clear Next.js cache:**
   ```bash
   rm -rf .next
   npm run dev
   ```

### Admin Login Not Working

1. **Verify admin user exists:**
   ```bash
   npm run db:studio
   ```
   Check the `Admin` table for the admin user.

2. **Recreate admin user:**
   ```bash
   npm run seed:admin
   ```

### Images Not Loading

Make sure the image files are in the correct locations:
- Icons: `public/icons/` (mehndi-icon.png, wedding-icon.png, reception-icon.png)
- Images: `public/images/` (ganesh.png)
- Couple photo: `public/about-jay-ankita.jpeg`

## Development Tips

1. **Hot Reload**: The development server automatically reloads when you make changes to files.

2. **Database Changes**: After modifying `prisma/schema.prisma`, run:
   ```bash
   npm run db:push
   ```

3. **Type Safety**: TypeScript will catch type errors. Make sure your editor is configured for TypeScript.

4. **Linting**: Run the linter before committing:
   ```bash
   npm run lint
   ```

## Next Steps

After setting up locally:

1. ✅ Verify the admin panel works
2. ✅ Create a test guest in the admin panel
3. ✅ Test the guest invitation flow
4. ✅ Verify all icons and images load correctly
5. ✅ Test the preview functionality in admin panel

## Support

If you encounter any issues not covered here, check:
- The main README.md for general information
- QUICK_START.md for quick reference
- SETUP_DATABASE.md for database-specific setup

