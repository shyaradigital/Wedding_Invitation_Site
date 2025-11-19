# Quick Deployment Guide

Your code is now on GitHub: https://github.com/shyaradigital/Wedding_Invitation_Site.git

## 🚀 Deploy to Vercel (Recommended - 5 minutes)

### Step 1: Connect to Vercel
1. Go to [vercel.com](https://vercel.com) and sign up/login with GitHub
2. Click **"New Project"**
3. Import your repository: `shyaradigital/Wedding_Invitation_Site`
4. Click **"Import"**

### Step 2: Set Up Database
1. In Vercel Dashboard, go to **Storage** tab
2. Click **"Create Database"** → Select **Postgres**
3. Create database (free tier available)
4. Copy the **Connection String** (looks like: `postgresql://...`)

### Step 3: Update Prisma Schema
Before deploying, update `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  // Change from "sqlite"
  url      = env("DATABASE_URL")
}
```

Then commit and push:
```bash
git add prisma/schema.prisma
git commit -m "Update to PostgreSQL for production"
git push
```

### Step 4: Configure Environment Variables
In Vercel Dashboard → Settings → Environment Variables, add:

```
DATABASE_URL=postgresql://[your-connection-string-from-step-2]
JWT_SECRET=[generate-using-command-below]
ADMIN_EMAIL=admin
ADMIN_PASSWORD=admin123
NEXT_PUBLIC_ADMIN_CONTACT=+1234567890
NODE_ENV=production
```

**Generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 5: Deploy
1. Go to **Deployments** tab
2. Click **"Redeploy"** (or it will auto-deploy after you push)
3. Wait for build to complete

### Step 6: Run Database Setup
After deployment, you need to run migrations and seed data:

**Option A: Via Vercel CLI**
```bash
npm i -g vercel
vercel login
vercel link
vercel env pull .env.local
npx prisma migrate deploy
npm run seed:admin
npm run seed:events
```

**Option B: Via Vercel Dashboard**
1. Go to your deployment
2. Click **"View Function Logs"**
3. Or use Vercel's built-in terminal (if available)

**Option C: Add to Build Command**
Update `vercel.json` build command to include migrations (see below)

### Step 7: Test
1. Visit your deployed URL (e.g., `https://your-site.vercel.app`)
2. Go to `/admin/login`
3. Login with:
   - **Email:** `admin`
   - **Password:** `admin123`
4. Create a test guest
5. Test the invitation link

---

## 🗄️ Alternative: Deploy to Railway (Also Easy)

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Select your repository
5. Add PostgreSQL service
6. Set environment variables (same as Vercel)
7. Railway auto-deploys!

---

## 📋 Pre-Deployment Checklist

- [x] Code pushed to GitHub
- [ ] Update `prisma/schema.prisma` to PostgreSQL
- [ ] Set up PostgreSQL database
- [ ] Configure all environment variables
- [ ] Deploy to hosting platform
- [ ] Run database migrations
- [ ] Seed admin user
- [ ] Seed events
- [ ] Test admin login
- [ ] Test guest invitation flow
- [ ] Update contact phone number

---

## 🔧 Quick Fixes

### If Build Fails:
1. Check environment variables are set
2. Verify `DATABASE_URL` is correct
3. Check build logs in Vercel dashboard

### If Database Connection Fails:
1. Verify `DATABASE_URL` format
2. Check database is accessible
3. Ensure SSL is enabled if required

### If Admin Login Doesn't Work:
1. Run: `npm run seed:admin` (after deployment)
2. Verify JWT_SECRET is set
3. Clear browser cookies

---

## 📞 Support

- Vercel Docs: https://vercel.com/docs
- Prisma Docs: https://www.prisma.io/docs
- Your Repository: https://github.com/shyaradigital/Wedding_Invitation_Site

---

## 🎉 After Deployment

1. **Change Admin Password** (important!)
2. **Add Real Images** to gallery
3. **Update Contact Info** with real phone number
4. **Test Everything** on mobile devices
5. **Share with Guests!**

