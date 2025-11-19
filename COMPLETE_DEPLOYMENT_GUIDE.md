# 🚀 Complete Deployment Guide - Step by Step

This guide will walk you through deploying your wedding invitation website to Vercel from scratch. Follow each step carefully.

---

## 📋 Prerequisites Checklist

Before starting, make sure you have:
- [ ] GitHub account (you already have this - your code is on GitHub)
- [ ] Email address for Vercel signup
- [ ] 15-20 minutes of time
- [ ] Your code is pushed to GitHub (✅ Already done!)

---

## Step 1: Update Database Schema for Production

### 1.1 Open the Schema File

1. Open `prisma/schema.prisma` in your code editor
2. Find line 9 that says: `provider = "sqlite"`

### 1.2 Change to PostgreSQL

Change line 9 from:
```prisma
provider = "sqlite"
```

To:
```prisma
provider = "postgresql"
```

The file should look like this:
```prisma
datasource db {
  provider = "postgresql"  // Changed from "sqlite"
  url      = env("DATABASE_URL")
}
```

### 1.3 Commit and Push the Change

Open your terminal in the project folder and run:

```bash
# Check what changed
git status

# Add the changed file
git add prisma/schema.prisma

# Commit the change
git commit -m "Update database to PostgreSQL for production"

# Push to GitHub
git push
```

**Wait for the push to complete before proceeding.**

---

## Step 2: Create Vercel Account

### 2.1 Go to Vercel

1. Open your web browser
2. Go to: **https://vercel.com**
3. Click the **"Sign Up"** button (top right)

### 2.2 Sign Up with GitHub

1. Click **"Continue with GitHub"** button
2. You'll be redirected to GitHub
3. Click **"Authorize Vercel"** to grant permissions
4. You may need to enter your GitHub password
5. Complete any 2FA if you have it enabled

**✅ You're now logged into Vercel!**

---

## Step 3: Create New Project

### 3.1 Start New Project

1. In Vercel Dashboard, click the **"Add New..."** button (top right)
2. Select **"Project"** from the dropdown

### 3.2 Import Your Repository

1. You'll see a list of your GitHub repositories
2. Find: **`shyaradigital/Wedding_Invitation_Site`**
3. Click **"Import"** next to it

**If you don't see your repository:**
- Click **"Adjust GitHub App Permissions"**
- Make sure all repositories are selected
- Click **"Save"** and refresh

### 3.3 Configure Project

You'll see a project configuration page. **Don't click Deploy yet!** We need to set up the database first.

**Leave these settings as default:**
- Framework Preset: Next.js (auto-detected)
- Root Directory: `./` (default)
- Build Command: `npm run build` (default)
- Output Directory: `.next` (default)
- Install Command: `npm install` (default)

**Click "Cancel" or navigate away for now** - we'll come back after setting up the database.

---

## Step 4: Create PostgreSQL Database

### 4.1 Go to Storage

1. In Vercel Dashboard, click **"Storage"** in the left sidebar
2. Click the **"Create Database"** button

### 4.2 Select PostgreSQL

1. You'll see database options
2. Click on **"Postgres"** (or "PostgreSQL")
3. Click **"Continue"**

### 4.3 Configure Database

1. **Database Name**: Leave default or name it `wedding-db`
2. **Region**: Choose closest to you (e.g., `US East` or `EU`)
3. **Plan**: Select **"Hobby"** (Free tier)
4. Click **"Create"**

### 4.4 Wait for Database Creation

- Wait 1-2 minutes for database to be created
- You'll see a success message when ready

### 4.5 Get Connection String

1. Click on your newly created database
2. Go to the **"Settings"** tab
3. Find **"Connection String"** section
4. Click **"Copy"** next to the connection string

**It will look like:**
```
postgres://default:xxxxx@xxxxx.postgres.vercel-storage.com:5432/verceldb
```

**⚠️ Save this somewhere safe - you'll need it in the next step!**

---

## Step 5: Set Environment Variables

### 5.1 Go Back to Your Project

1. Click **"Projects"** in left sidebar
2. Click on **`Wedding_Invitation_Site`** project
3. Go to **"Settings"** tab
4. Click **"Environment Variables"** in the left menu

### 5.2 Add DATABASE_URL

1. Click **"Add New"** button
2. **Key**: `DATABASE_URL`
3. **Value**: Paste the connection string you copied in Step 4.5
4. **Environment**: Select all three (Production, Preview, Development)
5. Click **"Save"**

### 5.3 Generate JWT_SECRET

Open your terminal and run:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Copy the long string that appears** (it will be 64 characters)

### 5.4 Add JWT_SECRET

1. Click **"Add New"** again
2. **Key**: `JWT_SECRET`
3. **Value**: Paste the generated secret from Step 5.3
4. **Environment**: Select all three
5. Click **"Save"**

### 5.5 Add ADMIN_EMAIL

1. Click **"Add New"**
2. **Key**: `ADMIN_EMAIL`
3. **Value**: `admin`
4. **Environment**: Select all three
5. Click **"Save"**

### 5.6 Add ADMIN_PASSWORD

1. Click **"Add New"**
2. **Key**: `ADMIN_PASSWORD`
3. **Value**: `admin123`
4. **Environment**: Select all three
5. Click **"Save"**

### 5.7 Add NEXT_PUBLIC_ADMIN_CONTACT

1. Click **"Add New"**
2. **Key**: `NEXT_PUBLIC_ADMIN_CONTACT`
3. **Value**: Your phone number (e.g., `+1234567890`)
4. **Environment**: Select all three
5. Click **"Save"**

### 5.8 Add NODE_ENV

1. Click **"Add New"**
2. **Key**: `NODE_ENV`
3. **Value**: `production`
4. **Environment**: Select **Production** only
5. Click **"Save"**

### 5.9 Verify All Variables

You should now have 6 environment variables:
- ✅ `DATABASE_URL`
- ✅ `JWT_SECRET`
- ✅ `ADMIN_EMAIL`
- ✅ `ADMIN_PASSWORD`
- ✅ `NEXT_PUBLIC_ADMIN_CONTACT`
- ✅ `NODE_ENV`

---

## Step 6: Deploy Your Project

### 6.1 Go to Deployments

1. Click **"Deployments"** tab (or go back to project overview)
2. You should see your project ready to deploy

### 6.2 Start Deployment

1. Click **"Deploy"** button (or if you see "Redeploy", click that)
2. Wait for the build to complete (2-5 minutes)

**You'll see build logs in real-time:**
- Installing dependencies...
- Running build command...
- Generating Prisma Client...
- Building Next.js app...

### 6.3 Check Build Status

- ✅ **Success**: You'll see "Ready" with a green checkmark
- ❌ **Failed**: Check the build logs for errors (see troubleshooting below)

### 6.4 Get Your Live URL

Once deployment succeeds:
1. Click on the deployment
2. You'll see your live URL: `https://your-project-name.vercel.app`
3. **Copy this URL** - this is your live website!

---

## Step 7: Run Database Migrations

### 7.1 Install Vercel CLI

Open your terminal and run:

```bash
npm install -g vercel
```

**Wait for installation to complete.**

### 7.2 Login to Vercel CLI

```bash
vercel login
```

1. Press Enter to open browser
2. Authorize Vercel CLI in the browser
3. Return to terminal - you should see "Success! Logged in"

### 7.3 Link to Your Project

```bash
cd s:\Wedsite
vercel link
```

1. **Set up and develop?** → Type `Y` and press Enter
2. **Which scope?** → Select your account (usually just press Enter)
3. **Link to existing project?** → Type `Y` and press Enter
4. **What's the name of your project?** → Type `Wedding_Invitation_Site` and press Enter
5. **In which directory is your code located?** → Press Enter (current directory)

### 7.4 Pull Environment Variables

```bash
vercel env pull .env.local
```

This downloads your environment variables to a local file.

### 7.5 Create Initial Migration (If Needed)

**First, check if you have migrations:**

```bash
# Check if migrations folder exists
ls prisma/migrations
```

**If migrations folder is empty or doesn't exist:**

```bash
# Create initial migration
npx prisma migrate dev --name init
```

This will:
- Create migration files in `prisma/migrations/`
- Apply them to your local database (if you have one set up)

**Then commit the migration files:**
```bash
git add prisma/migrations
git commit -m "Add initial database migration"
git push
```

### 7.6 Run Database Migrations on Production

```bash
npx prisma migrate deploy
```

**Expected output:**
```
Environment variables loaded from .env.local
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "verceldb"
Applying migration `20240101000000_init`
The following migration(s) have been applied:
  - 20240101000000_init
All migrations have been successfully applied.
```

**Alternative: If migrations don't work, use db push (for initial setup only):**
```bash
npx prisma db push
```

⚠️ **Note**: `db push` is for development. Use `migrate deploy` for production.

---

## Step 8: Seed Database

### 8.1 Seed Admin User

```bash
npm run seed:admin
```

**Expected output:**
```
Admin user created/updated: { id: '...', email: 'admin' }
Default password: admin123
Please change the password after first login!
```

### 8.2 Seed Events

```bash
npm run seed:events
```

**Expected output:**
```
Events seeded successfully!
```

---

## Step 9: Test Your Deployment

### 9.1 Test Admin Login

1. Go to your live URL: `https://your-project-name.vercel.app`
2. Navigate to: `https://your-project-name.vercel.app/admin/login`
3. Enter credentials:
   - **Email**: `admin`
   - **Password**: `admin123`
4. Click **"Login"**
5. ✅ You should be redirected to the admin dashboard

### 9.2 Create a Test Guest

1. In admin dashboard, go to **"Guest Management"** tab
2. Click **"Create New Guest"** button
3. Fill in:
   - **Name**: `Test Guest`
   - **Phone**: `1234567890` (optional)
   - **Event Access**: Check `mehndi`, `wedding`, `reception`
   - **Max Devices**: `3`
4. Click **"Create"**
5. ✅ Guest should appear in the list

### 9.3 Test Invitation Link

1. Find your test guest in the list
2. Click **"Copy"** next to the guest
3. Open the copied link in a new tab
4. ✅ You should see the phone verification form
5. Enter the phone number you set
6. Click **"Proceed"**
7. ✅ You should see the guest invitation page

### 9.4 Test Other Pages

Navigate to:
- ✅ `/invite/[token]/about` - About page
- ✅ `/invite/[token]/venue-travel` - Venue page
- ✅ `/invite/[token]/gallery` - Gallery page
- ✅ `/invite/[token]/events/mehndi` - Event page

---

## Step 10: Post-Deployment Tasks

### 10.1 Change Admin Password (Important!)

1. Login to admin panel
2. (If you have a password change feature, use it)
3. Or create a new admin with a stronger password via seed script

### 10.2 Update Contact Information

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Edit `NEXT_PUBLIC_ADMIN_CONTACT`
3. Update with your real phone number
4. Click **"Save"**
5. Redeploy (or wait for next auto-deploy)

### 10.3 Add Real Images

1. Replace placeholder images in gallery with real wedding photos
2. Update hero images on landing page
3. Add couple photos to About page

### 10.4 Test on Mobile

1. Open your site on a mobile device
2. Test all features:
   - Phone verification
   - Gallery lightbox
   - Navigation
   - WhatsApp sharing

---

## 🔧 Troubleshooting

### Build Fails

**Error: "Environment variable not found: DATABASE_URL"**
- ✅ Solution: Make sure you added `DATABASE_URL` in Vercel Settings → Environment Variables

**Error: "Prisma Client not generated"**
- ✅ Solution: The build command should include `prisma generate`. Check `package.json` - it should be: `"build": "prisma generate && next build"`

**Error: "Module not found"**
- ✅ Solution: Make sure all dependencies are in `package.json`. Run `npm install` locally to verify.

### Database Connection Fails

**Error: "Can't reach database server"**
- ✅ Solution: Check `DATABASE_URL` is correct. Make sure it's the full connection string from Vercel Storage.

**Error: "SSL required"**
- ✅ Solution: Add `?sslmode=require` to the end of your `DATABASE_URL`

### Admin Login Doesn't Work

**Error: "Invalid email or password"**
- ✅ Solution: Make sure you ran `npm run seed:admin` after deployment
- ✅ Solution: Check `JWT_SECRET` is set correctly
- ✅ Solution: Try clearing browser cookies

### Migration Fails

**Error: "No migrations found"**
- ✅ Solution: Run `npx prisma migrate dev --name init` locally first, then commit and push
- ✅ Solution: Or use `npx prisma db push` instead (for development)

---

## 📝 Quick Reference

### Your Live URLs

- **Main Site**: `https://your-project-name.vercel.app`
- **Admin Login**: `https://your-project-name.vercel.app/admin/login`

### Admin Credentials

- **Email**: `admin`
- **Password**: `admin123`

### Important Commands

```bash
# Link to Vercel project
vercel link

# Pull environment variables
vercel env pull .env.local

# Run migrations
npx prisma migrate deploy

# Seed admin
npm run seed:admin

# Seed events
npm run seed:events

# View logs
vercel logs
```

---

## ✅ Deployment Checklist

- [ ] Updated `prisma/schema.prisma` to PostgreSQL
- [ ] Committed and pushed schema change
- [ ] Created Vercel account
- [ ] Imported GitHub repository
- [ ] Created PostgreSQL database in Vercel
- [ ] Set all 6 environment variables
- [ ] Deployed project successfully
- [ ] Installed Vercel CLI
- [ ] Linked project locally
- [ ] Pulled environment variables
- [ ] Ran database migrations
- [ ] Seeded admin user
- [ ] Seeded events
- [ ] Tested admin login
- [ ] Created test guest
- [ ] Tested invitation link
- [ ] Tested all pages
- [ ] Updated contact information
- [ ] Tested on mobile

---

## 🎉 Success!

Your wedding invitation website is now live and fully functional!

**Next Steps:**
1. Share your site URL with guests
2. Create all your guest invitations in the admin panel
3. Customize content and images
4. Enjoy your beautiful wedding website! 💍

---

## 🆘 Need Help?

- **Vercel Support**: https://vercel.com/support
- **Prisma Docs**: https://www.prisma.io/docs
- **Next.js Docs**: https://nextjs.org/docs

---

**Your website is ready for your special day!** 🌸

