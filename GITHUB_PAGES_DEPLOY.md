# ⚠️ GitHub Pages Deployment - Important Limitations

## 🚨 Critical Warning

**GitHub Pages only supports static websites.** This means:

### ❌ What WON'T Work:
- **API Routes** - All `/api/*` endpoints will fail
- **Database Features** - No database connections
- **Admin Panel** - Cannot login or manage guests
- **Guest Verification** - Token verification won't work
- **Phone Verification** - Cannot verify phone numbers
- **Device Fingerprinting** - Cannot save device data
- **Dynamic Content** - All server-side features disabled

### ✅ What WILL Work:
- Static pages (About, Venue, Gallery)
- Visual design and animations
- Image gallery (viewing only)
- Responsive design

---

## 📋 Setup Instructions

### Step 1: Enable GitHub Pages

1. Go to your repository: https://github.com/shyaradigital/Wedding_Invitation_Site
2. Click **Settings** → **Pages**
3. Under **Source**, select:
   - **Deploy from a branch**
   - **Branch:** `gh-pages` (or `main`)
   - **Folder:** `/ (root)`
4. Click **Save**

### Step 2: Enable GitHub Actions

1. Go to **Settings** → **Actions** → **General**
2. Under **Workflow permissions**, select:
   - **Read and write permissions**
   - ✅ **Allow GitHub Actions to create and approve pull requests**
3. Click **Save**

### Step 3: Push Configuration

The GitHub Actions workflow is already configured. Just push:

```bash
git add .
git commit -m "Configure for GitHub Pages deployment"
git push
```

### Step 4: Wait for Deployment

1. Go to **Actions** tab in your repository
2. Wait for the workflow to complete (usually 2-3 minutes)
3. Your site will be available at:
   - `https://shyaradigital.github.io/Wedding_Invitation_Site/`

---

## 🔄 Alternative: Use Vercel (Recommended)

**For a fully functional website, use Vercel instead:**

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Import your repository
4. Deploy (takes 2 minutes)
5. **Everything works** - API routes, database, admin panel, etc.

**Vercel is FREE and works perfectly with Next.js!**

---

## 📝 What You'll Need to Change

If you still want to use GitHub Pages, you'll need to:

1. **Remove all API calls** from the frontend
2. **Remove database dependencies**
3. **Convert to a pure static site**
4. **Remove admin panel**
5. **Remove guest verification**

This essentially means rebuilding the site as a static portfolio.

---

## 🎯 Recommendation

**Use Vercel instead of GitHub Pages** because:
- ✅ Free hosting
- ✅ All features work
- ✅ Automatic deployments
- ✅ Built for Next.js
- ✅ Takes 2 minutes to set up

See `QUICK_DEPLOY.md` for Vercel deployment instructions.

---

## 📞 Need Help?

- **Vercel Deployment**: See `QUICK_DEPLOY.md`
- **Full Deployment Guide**: See `DEPLOYMENT.md`
- **GitHub Actions**: Already configured in `.github/workflows/deploy.yml`

