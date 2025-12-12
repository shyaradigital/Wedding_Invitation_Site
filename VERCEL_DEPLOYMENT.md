# Vercel Deployment Guide

## Current Build Configuration

The build command has been updated to only generate Prisma client and build the Next.js app. Database setup needs to be done separately.

## Required Steps for Deployment

### 1. Set Up PostgreSQL Database

Vercel requires PostgreSQL for production (SQLite is only for local development).

**Option A: Use Vercel Postgres (Recommended)**
1. Go to your Vercel project dashboard
2. Navigate to **Storage** → **Create Database** → **Postgres**
3. Create a new Postgres database
4. Copy the connection string (it will be automatically added as `POSTGRES_URL`)

**Option B: Use External PostgreSQL**
- Use services like [Supabase](https://supabase.com), [Neon](https://neon.tech), or [Railway](https://railway.app)
- Get your PostgreSQL connection string

### 2. Update Prisma Schema for Production

The schema needs to support PostgreSQL. Update `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  // Change from "sqlite" to "postgresql"
  url      = env("DATABASE_URL")
}
```

**Note:** For local development, you can keep using SQLite by having a separate `.env.local` file with:
```
DATABASE_URL="file:./prisma/dev.db"
```

### 3. Set Environment Variables in Vercel

Go to **Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables** and add:

1. **DATABASE_URL** (Required)
   - If using Vercel Postgres: Use `POSTGRES_PRISMA_URL` or `POSTGRES_URL_NON_POOLING`
   - Format: `postgresql://user:password@host:port/database?sslmode=require`

2. **JWT_SECRET** (Required)
   - Generate a random secret: `openssl rand -base64 32`
   - Or use any long random string

3. **ADMIN_EMAIL** (Optional - defaults to "admin")
   - Admin login email/username

4. **ADMIN_PASSWORD** (Optional - defaults to "admin123")
   - Admin login password

5. **NEXT_PUBLIC_ADMIN_CONTACT** (Optional)
   - Contact phone number for guests

### 4. Set Up Database Schema

After setting the DATABASE_URL, you need to push the schema and seed data:

**Option A: Using Vercel CLI (Recommended)**
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Link your project
vercel link

# Pull environment variables
vercel env pull .env.local

# Push database schema
npx prisma db push

# Seed admin user
npm run seed:admin

# Seed events
npm run seed:events
```

**Option B: Using Vercel Dashboard**
1. Go to your project → **Settings** → **Functions**
2. You can create a one-time API route to run setup, or use Vercel's database console

**Option C: Add to Build Command (Not Recommended)**
You can add database setup back to `vercel.json`, but this runs on every build:
```json
{
  "buildCommand": "npx prisma generate && npx prisma db push && npm run seed:admin && npm run seed:events && npm run build"
}
```

### 5. Deploy

After setting up the database and environment variables:
1. Commit and push your changes
2. Vercel will automatically redeploy
3. The build should now succeed

## Troubleshooting

### Build Fails with "DATABASE_URL must start with file:"
- **Cause:** DATABASE_URL is not set or is invalid
- **Fix:** Set DATABASE_URL in Vercel environment variables with a valid PostgreSQL connection string

### Build Fails with "Connection refused"
- **Cause:** Database URL is incorrect or database is not accessible
- **Fix:** Verify the connection string and ensure the database is running

### Admin Login Doesn't Work
- **Cause:** Admin user not seeded
- **Fix:** Run `npm run seed:admin` after setting up the database

### Database Tables Don't Exist
- **Cause:** Schema not pushed to database
- **Fix:** Run `npx prisma db push` after setting DATABASE_URL

## Current Build Command

The build command in `vercel.json` is now:
```json
{
  "buildCommand": "npx prisma generate && npm run build"
}
```

This only generates the Prisma client and builds the app. Database setup must be done separately as described above.

