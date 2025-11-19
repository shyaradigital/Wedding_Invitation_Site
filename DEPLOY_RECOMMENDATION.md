# 🚀 Recommended Deployment: Vercel

## Why Vercel?

✅ **Perfect for Next.js** - Built by the Next.js team  
✅ **100% Free** - No credit card required  
✅ **All Features Work** - API routes, database, admin panel  
✅ **Auto Deployments** - Deploys on every git push  
✅ **2 Minutes Setup** - Super easy  
✅ **Custom Domain** - Add your own domain later  

---

## 📋 Quick Deployment Steps

### Step 1: Update Database Schema (Required)

Edit `prisma/schema.prisma` - Change line 9:

```prisma
// Change from:
provider = "sqlite"

// To:
provider = "postgresql"
```

Then commit:
```bash
git add prisma/schema.prisma
git commit -m "Update to PostgreSQL for production"
git push
```

### Step 2: Deploy to Vercel

1. **Go to Vercel**: https://vercel.com
2. **Sign up/Login** with your GitHub account
3. **Click "New Project"**
4. **Import Repository**: Select `shyaradigital/Wedding_Invitation_Site`
5. **Click "Import"**

### Step 3: Add Database

1. In Vercel Dashboard, go to **Storage** tab
2. Click **"Create Database"** → Select **Postgres**
3. Create database (free tier available)
4. Copy the **Connection String**

### Step 4: Set Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

```
DATABASE_URL=postgresql://[your-connection-string-from-step-3]
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

1. Click **"Deploy"** (or it auto-deploys)
2. Wait 2-3 minutes for build to complete
3. Your site is live! 🎉

### Step 6: Setup Database

After deployment, run these commands (via Vercel CLI):

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link to your project
vercel link

# Pull environment variables
vercel env pull .env.local

# Run migrations
npx prisma migrate deploy

# Seed admin user
npm run seed:admin

# Seed events
npm run seed:events
```

**Or use Vercel's built-in terminal** (if available in dashboard).

---

## 🎯 Your Site Will Be Live At:

`https://your-project-name.vercel.app`

You can add a custom domain later in Vercel settings.

---

## ✅ After Deployment Checklist

- [ ] Test admin login (admin / admin123)
- [ ] Create a test guest
- [ ] Test invitation link
- [ ] Test phone verification
- [ ] Test gallery
- [ ] Update contact phone number
- [ ] Change admin password (important!)

---

## 🆘 Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **Quick Deploy Guide**: See `QUICK_DEPLOY.md`
- **Full Guide**: See `DEPLOYMENT.md`

---

## 🎉 That's It!

Your wedding invitation website will be fully functional on Vercel with all features working!

