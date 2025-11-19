# 🚀 Vercel Setup - Step by Step (You're Here!)

You're at the project configuration screen. Follow these steps:

---

## ⚠️ IMPORTANT: Don't Deploy Yet!

**First, we need to set up the database and environment variables.**

---

## Step 1: Set Project Name (Already Done ✅)

You have: `wedding-invitation-site` - This is perfect! Leave it as is.

---

## Step 2: Verify Build Settings

Check these settings match:

- **Framework Preset**: `Next.js` ✅
- **Root Directory**: `./` ✅
- **Build Command**: `npx prisma generate && npm run build` ✅
- **Output Directory**: `Next.js default` ✅
- **Install Command**: `npm install` ✅

**All look good!** ✅

---

## Step 3: Create Database First (BEFORE Adding Environment Variables)

### 3.1 Go to Storage

1. **Don't click "Deploy" yet!**
2. In the Vercel dashboard (left sidebar), click **"Storage"**
3. Click **"Create Database"** button

### 3.2 Create PostgreSQL Database

1. Select **"Postgres"** (or "PostgreSQL")
2. Click **"Continue"**
3. **Database Name**: `wedding-db` (or leave default)
4. **Region**: Choose closest to you
5. **Plan**: Select **"Hobby"** (Free tier)
6. Click **"Create"**

### 3.3 Wait for Database

- Wait 1-2 minutes for database creation
- You'll see "Database created successfully"

### 3.4 Get Connection String

1. Click on your newly created database
2. Go to **"Settings"** tab
3. Find **"Connection String"** section
4. Click **"Copy"** button next to the connection string

**Save this connection string - you'll need it in the next step!**

It looks like:
```
postgres://default:xxxxx@xxxxx.postgres.vercel-storage.com:5432/verceldb
```

---

## Step 4: Go Back to Project Setup

1. Click **"Projects"** in left sidebar
2. You should see your project `wedding-invitation-site`
3. Click on it (or go back to the import screen)

---

## Step 5: Add Environment Variables

On the project setup screen, you'll see the "Environment Variables" section.

### 5.1 Add DATABASE_URL

1. Click **"Add"** or the **"+"** button
2. **Key**: `DATABASE_URL`
3. **Value**: Paste the connection string you copied in Step 3.4
4. **Environment**: Select all three checkboxes:
   - ✅ Production
   - ✅ Preview  
   - ✅ Development
5. Click **"Add"** or **"Save"**

### 5.2 Generate JWT_SECRET

Open your terminal and run:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Copy the 64-character string that appears**

### 5.3 Add JWT_SECRET

1. Click **"Add"** again
2. **Key**: `JWT_SECRET`
3. **Value**: Paste the generated secret (64 characters)
4. **Environment**: Select all three (Production, Preview, Development)
5. Click **"Add"**

### 5.4 Add ADMIN_EMAIL

1. Click **"Add"**
2. **Key**: `ADMIN_EMAIL`
3. **Value**: `admin`
4. **Environment**: Select all three
5. Click **"Add"**

### 5.5 Add ADMIN_PASSWORD

1. Click **"Add"**
2. **Key**: `ADMIN_PASSWORD`
3. **Value**: `admin123`
4. **Environment**: Select all three
5. Click **"Add"**

### 5.6 Add NEXT_PUBLIC_ADMIN_CONTACT

1. Click **"Add"**
2. **Key**: `NEXT_PUBLIC_ADMIN_CONTACT`
3. **Value**: Your phone number (e.g., `+1234567890`)
4. **Environment**: Select all three
5. Click **"Add"**

### 5.7 Add NODE_ENV

1. Click **"Add"**
2. **Key**: `NODE_ENV`
3. **Value**: `production`
4. **Environment**: Select **Production** only (uncheck Preview and Development)
5. Click **"Add"**

### 5.8 Verify All Variables

You should now see 6 environment variables:
- ✅ `DATABASE_URL`
- ✅ `JWT_SECRET`
- ✅ `ADMIN_EMAIL`
- ✅ `ADMIN_PASSWORD`
- ✅ `NEXT_PUBLIC_ADMIN_CONTACT`
- ✅ `NODE_ENV`

---

## Step 6: Deploy!

1. Scroll down to the bottom of the page
2. Click the **"Deploy"** button
3. Wait 2-5 minutes for the build to complete

**You'll see build progress:**
- Installing dependencies...
- Running build command...
- Generating Prisma Client...
- Building Next.js app...

---

## Step 7: After Deployment

Once deployment succeeds:

1. **Get your live URL**: `https://wedding-invitation-site.vercel.app` (or similar)
2. **Copy this URL** - this is your live website!

---

## Step 8: Setup Database (After First Deployment)

After deployment, you need to run migrations and seed data. See `COMPLETE_DEPLOYMENT_GUIDE.md` Step 7-8 for detailed instructions.

**Quick version:**
```bash
npm install -g vercel
vercel login
vercel link
vercel env pull .env.local
npx prisma migrate deploy
npm run seed:admin
npm run seed:events
```

---

## ✅ Summary

1. ✅ Project name set: `wedding-invitation-site`
2. ✅ Build settings verified
3. ⏳ Create PostgreSQL database (Step 3)
4. ⏳ Add 6 environment variables (Step 5)
5. ⏳ Click Deploy (Step 6)
6. ⏳ Setup database after deployment (Step 8)

---

## 🆘 Need Help?

If you get stuck:
- See `COMPLETE_DEPLOYMENT_GUIDE.md` for detailed steps
- Check troubleshooting section in the guide
- Make sure all environment variables are added before deploying

**You're doing great! Follow the steps above.** 🚀

