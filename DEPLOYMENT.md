# Deployment Guide

This guide will help you deploy the wedding invitation website to production.

## Prerequisites

- Node.js 18+ installed
- A hosting platform account (Vercel, Netlify, Railway, etc.)
- A PostgreSQL database (for production - SQLite is only for local development)

## Quick Deploy to Vercel (Recommended)

### 1. Prepare Your Repository

```bash
# Make sure all changes are committed
git add .
git commit -m "Ready for deployment"
git push
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "New Project"
3. Import your Git repository
4. Configure environment variables (see below)
5. Click "Deploy"

### 3. Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

```
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your-strong-random-secret-key-here
ADMIN_EMAIL=admin
ADMIN_PASSWORD=admin123
NEXT_PUBLIC_ADMIN_CONTACT=+1234567890
NODE_ENV=production
```

**Generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Database Setup

#### Option A: Vercel Postgres (Easiest)

1. In Vercel Dashboard, go to Storage
2. Create a new Postgres database
3. Copy the connection string to `DATABASE_URL`

#### Option B: External PostgreSQL

Use services like:
- [Supabase](https://supabase.com) (Free tier available)
- [Neon](https://neon.tech) (Free tier available)
- [Railway](https://railway.app) (Free tier available)
- [Render](https://render.com) (Free tier available)

### 5. Update Prisma Schema for Production

Before deploying, update `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  // Change from "sqlite"
  url      = env("DATABASE_URL")
}
```

### 6. Run Database Migrations

After deployment, run migrations:

```bash
# In Vercel, add a build command:
npx prisma generate && npx prisma migrate deploy && npm run build

# Or manually via Vercel CLI:
vercel env pull
npx prisma migrate deploy
```

### 7. Seed Initial Data

After first deployment, seed admin and events:

```bash
# Via Vercel CLI or SSH into your deployment
npm run seed:admin
npm run seed:events
```

## Deployment Checklist

- [ ] Update `prisma/schema.prisma` to use PostgreSQL
- [ ] Set all environment variables in hosting platform
- [ ] Create production database
- [ ] Run database migrations
- [ ] Seed admin user (email: admin, password: admin123)
- [ ] Seed events
- [ ] Test admin login
- [ ] Test guest invitation flow
- [ ] Update `NEXT_PUBLIC_ADMIN_CONTACT` with real phone number
- [ ] Test WhatsApp sharing
- [ ] Verify all pages load correctly
- [ ] Test on mobile devices

## Post-Deployment

1. **Change Admin Password**: After first login, consider changing the admin password
2. **Add Real Images**: Replace placeholder images in gallery with actual wedding photos
3. **Update Contact Info**: Update `NEXT_PUBLIC_ADMIN_CONTACT` with real contact number
4. **Test Everything**: Go through the entire guest flow to ensure everything works

## Alternative Deployment Platforms

### Netlify

1. Connect your Git repository
2. Build command: `npm run build`
3. Publish directory: `.next`
4. Add environment variables in Site settings
5. Use Netlify Functions for API routes (may need adjustments)

### Railway

1. Connect your Git repository
2. Railway auto-detects Next.js
3. Add PostgreSQL service
4. Set environment variables
5. Deploy

### Self-Hosted (VPS)

1. Install Node.js and PostgreSQL on your server
2. Clone repository
3. Install dependencies: `npm install`
4. Set environment variables
5. Run migrations: `npx prisma migrate deploy`
6. Build: `npm run build`
7. Start: `npm start` (or use PM2 for process management)

## Troubleshooting

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Check database is accessible from hosting platform
- Ensure SSL is enabled if required

### Build Errors

- Check Node.js version (requires 18+)
- Verify all environment variables are set
- Check Prisma client is generated: `npx prisma generate`

### Admin Login Not Working

- Verify admin user is seeded: `npm run seed:admin`
- Check JWT_SECRET is set correctly
- Clear browser cookies and try again

## Support

For issues, check:
- Next.js documentation: https://nextjs.org/docs
- Prisma documentation: https://www.prisma.io/docs
- Vercel documentation: https://vercel.com/docs

