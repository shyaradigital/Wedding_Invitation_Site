# Vercel Deployment Guide

## ✅ Configuration Complete

The Prisma schema has been updated to use PostgreSQL (required for Vercel), and the build command will automatically set up the database during deployment.

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

### 2. Prisma Schema (Already Updated ✅)

The schema has been updated to use PostgreSQL. The `prisma/schema.prisma` file now uses:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**Note:** For local development, you'll need to use PostgreSQL as well. You can:
- Use the same PostgreSQL database (Vercel Postgres)
- Set up a local PostgreSQL instance
- Use a free PostgreSQL service like [Neon](https://neon.tech) or [Supabase](https://supabase.com) for local dev

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

### 4. Database Setup (Automatic ✅)

The build command in `vercel.json` is now configured to automatically:
1. Generate Prisma client
2. Push database schema (`npx prisma db push`)
3. Seed admin user (`npm run seed:admin`)
4. Seed events (`npm run seed:events`)
5. Build the Next.js app

**This happens automatically during deployment!** No manual setup needed.

### 5. Deploy

After setting the environment variables:
1. The changes are already pushed to GitHub
2. Vercel will automatically redeploy
3. The build will set up the database automatically
4. You should be able to log in after deployment completes

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
  "buildCommand": "npx prisma generate && npx prisma db push --skip-generate && npm run seed:admin && npm run seed:events && npm run build"
}
```

This automatically sets up the database during each deployment. The database schema and seed data will be created/updated automatically.

