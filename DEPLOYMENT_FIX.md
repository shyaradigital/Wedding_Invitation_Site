# Deployment Fix Instructions

## Issue 1: ESLint Error (FIXED)
The apostrophe in "Jay's" has been escaped to `&apos;` in `components/InvitationNavigation.tsx`.

## Issue 2: 500 Error on Admin Login

The 500 error is likely due to one of these issues:

### Problem: Database Configuration Mismatch

Your Prisma schema is currently set to use **SQLite** for local development, but **Vercel requires PostgreSQL** for production.

### Solution Options:

#### Option A: Use PostgreSQL for Both Development and Production (Recommended)

1. **Set up a PostgreSQL database:**
   - Use [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) (easiest)
   - Or use [Supabase](https://supabase.com), [Neon](https://neon.tech), or [Railway](https://railway.app)

2. **Update Prisma schema** (`prisma/schema.prisma`):
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. **Set DATABASE_URL in Vercel:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add `DATABASE_URL` with your PostgreSQL connection string
   - Format: `postgresql://user:password@host:port/database?sslmode=require`

4. **For local development:**
   - Create a `.env.local` file
   - Add your PostgreSQL connection string (can be the same as production or a separate local database)
   - Run: `npx prisma db push` and `npm run seed:admin`

#### Option B: Keep SQLite for Local, PostgreSQL for Production

1. **Create two schema files:**
   - `prisma/schema.prisma` - Keep as SQLite for local
   - `prisma/schema.prod.prisma` - PostgreSQL version

2. **Update build command in `vercel.json`:**
   ```json
   {
     "buildCommand": "cp prisma/schema.prod.prisma prisma/schema.prisma && npx prisma generate && npx prisma db push && npm run seed:admin && npm run seed:events && npm run build"
   }
   ```

   **Note:** This approach is more complex and not recommended.

### Quick Fix for Now:

1. **Set up Vercel Postgres:**
   - Go to your Vercel project
   - Navigate to Storage → Create Database → Postgres
   - Copy the connection string

2. **Add Environment Variable:**
   - Settings → Environment Variables
   - Add `DATABASE_URL` with the PostgreSQL connection string

3. **Update schema to PostgreSQL:**
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

4. **Commit and push:**
   ```bash
   git add prisma/schema.prisma
   git commit -m "Switch to PostgreSQL for production"
   git push
   ```

5. **Redeploy on Vercel** - The build will now use PostgreSQL

### Verify Database Connection:

After deployment, check the Vercel function logs:
- Go to Vercel Dashboard → Your Project → Deployments → Click on latest deployment → Functions tab
- Look for any database connection errors

### Additional Checks:

1. **Ensure JWT_SECRET is set** in Vercel environment variables
2. **Ensure ADMIN_CONTACT_PHONE is set** if used
3. **Check that seed scripts run successfully** during build

## Current Status:

✅ ESLint error fixed  
⚠️ Database configuration needs to be updated for production

