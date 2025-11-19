# Database Setup for Vercel Deployment

The 500 error you're seeing is likely because the database hasn't been set up yet. Follow these steps:

## Step 1: Set Up Database Schema

You need to push the Prisma schema to your PostgreSQL database. You can do this in two ways:

### Option A: Using Vercel CLI (Recommended)

1. Install Vercel CLI if you haven't already:
   ```bash
   npm install -g vercel
   ```

2. Link your project:
   ```bash
   vercel link
   ```

3. Pull environment variables:
   ```bash
   vercel env pull .env.local
   ```

4. Push the database schema:
   ```bash
   npx prisma db push
   ```

5. Seed the admin user and events:
   ```bash
   npm run seed:admin
   npm run seed:events
   ```

### Option B: Add as Build Step (Alternative)

You can also add database setup as part of the build process by modifying the build command in Vercel:

1. Go to your Vercel project settings
2. Go to "Settings" → "General" → "Build & Development Settings"
3. Change the "Build Command" to:
   ```
   npx prisma generate && npx prisma db push && npm run build
   ```

**Note:** This will run `db push` on every build, which is fine for development but not ideal for production. Option A is better.

## Step 2: Verify Environment Variables

Make sure these environment variables are set in Vercel:

1. Go to your Vercel project → "Settings" → "Environment Variables"
2. Verify these are set:
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `JWT_SECRET` - A random secret for JWT tokens
   - `ADMIN_EMAIL` - Admin username (default: `admin`)
   - `ADMIN_PASSWORD` - Admin password (default: `admin123`)
   - `NEXT_PUBLIC_ADMIN_CONTACT` - Your contact phone number

## Step 3: Test the Login

After setting up the database:

1. Go to your deployed site: `https://your-site.vercel.app/admin/login`
2. Try logging in with:
   - Email: `admin` (or whatever you set in `ADMIN_EMAIL`)
   - Password: `admin123` (or whatever you set in `ADMIN_PASSWORD`)

## Troubleshooting

If you still get a 500 error:

1. Check Vercel function logs:
   - Go to your Vercel project → "Deployments" → Click on the latest deployment → "Functions" tab
   - Look for error messages in the logs

2. Common issues:
   - **Database connection failed**: Check that `DATABASE_URL` is correct
   - **Tables don't exist**: Run `npx prisma db push` again
   - **Admin user doesn't exist**: Run `npm run seed:admin` again
   - **JWT_SECRET not set**: Make sure it's set in Vercel environment variables

3. Test database connection locally:
   ```bash
   npx prisma studio
   ```
   This should open Prisma Studio and show your database tables.

