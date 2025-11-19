# ✅ Deployment Checklist

Use this checklist to ensure you complete every step of deployment.

## Pre-Deployment

- [ ] **Step 1.1**: Opened `prisma/schema.prisma`
- [ ] **Step 1.2**: Changed `provider = "sqlite"` to `provider = "postgresql"`
- [ ] **Step 1.3**: Committed and pushed the change to GitHub
- [ ] Verified the change is on GitHub

## Vercel Setup

- [ ] **Step 2.1**: Went to vercel.com
- [ ] **Step 2.2**: Signed up/logged in with GitHub
- [ ] **Step 3.1**: Clicked "Add New" → "Project"
- [ ] **Step 3.2**: Found and imported `shyaradigital/Wedding_Invitation_Site`
- [ ] **Step 4.1**: Went to Storage tab
- [ ] **Step 4.2**: Created PostgreSQL database
- [ ] **Step 4.3**: Selected Hobby (Free) plan
- [ ] **Step 4.4**: Waited for database creation
- [ ] **Step 4.5**: Copied connection string

## Environment Variables

- [ ] **Step 5.2**: Added `DATABASE_URL` (with connection string)
- [ ] **Step 5.3**: Generated JWT_SECRET using Node command
- [ ] **Step 5.4**: Added `JWT_SECRET` (64 character string)
- [ ] **Step 5.5**: Added `ADMIN_EMAIL` = `admin`
- [ ] **Step 5.6**: Added `ADMIN_PASSWORD` = `admin123`
- [ ] **Step 5.7**: Added `NEXT_PUBLIC_ADMIN_CONTACT` (your phone number)
- [ ] **Step 5.8**: Added `NODE_ENV` = `production` (Production only)
- [ ] **Step 5.9**: Verified all 6 variables are present

## Deployment

- [ ] **Step 6.1**: Went to Deployments tab
- [ ] **Step 6.2**: Clicked "Deploy" button
- [ ] **Step 6.3**: Waited for build to complete (2-5 minutes)
- [ ] **Step 6.4**: Build succeeded (green checkmark)
- [ ] **Step 6.5**: Copied live URL

## Database Setup

- [ ] **Step 7.1**: Installed Vercel CLI (`npm install -g vercel`)
- [ ] **Step 7.2**: Logged in to Vercel CLI (`vercel login`)
- [ ] **Step 7.3**: Linked project (`vercel link`)
- [ ] **Step 7.4**: Pulled environment variables (`vercel env pull .env.local`)
- [ ] **Step 7.5**: Created initial migration (if needed)
- [ ] **Step 7.6**: Ran migrations (`npx prisma migrate deploy` or `npx prisma db push`)
- [ ] **Step 8.1**: Seeded admin user (`npm run seed:admin`)
- [ ] **Step 8.2**: Seeded events (`npm run seed:events`)

## Testing

- [ ] **Step 9.1**: Tested admin login (admin / admin123)
- [ ] **Step 9.2**: Created a test guest in admin panel
- [ ] **Step 9.3**: Tested invitation link (phone verification works)
- [ ] **Step 9.4**: Tested About page
- [ ] **Step 9.4**: Tested Venue & Travel page
- [ ] **Step 9.4**: Tested Gallery page
- [ ] **Step 9.4**: Tested Event pages (Mehndi, Wedding, Reception)

## Post-Deployment

- [ ] **Step 10.1**: Changed admin password (or plan to)
- [ ] **Step 10.2**: Updated contact phone number in environment variables
- [ ] **Step 10.3**: Added real wedding images (or plan to)
- [ ] **Step 10.4**: Tested on mobile device
- [ ] **Step 10.4**: Tested WhatsApp sharing feature

## Final Verification

- [ ] Website loads correctly
- [ ] Admin panel is accessible
- [ ] Can create guests
- [ ] Invitation links work
- [ ] Phone verification works
- [ ] All pages display correctly
- [ ] Gallery lightbox works
- [ ] Mobile responsive
- [ ] No console errors

---

## 🎉 Deployment Complete!

Once all items are checked, your website is ready for your wedding guests!

---

## 📞 Quick Reference

**Live URL**: `https://your-project-name.vercel.app`  
**Admin Login**: `https://your-project-name.vercel.app/admin/login`  
**Credentials**: admin / admin123

**Important Commands:**
```bash
vercel login
vercel link
vercel env pull .env.local
npx prisma migrate deploy
npm run seed:admin
npm run seed:events
```

