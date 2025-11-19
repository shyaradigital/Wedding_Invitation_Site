# Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   - Copy `.env.example` to `.env`
   - Set `DATABASE_URL` to your PostgreSQL connection string
   - Set `JWT_SECRET` to a random secure string
   - Set `ADMIN_CONTACT_PHONE` to your contact number

3. **Database Setup**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   ```

4. **Create Admin User**
   ```bash
   ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=yourpassword npm run seed:admin
   ```

5. **Seed Events (Optional)**
   ```bash
   npm run seed:events
   ```

6. **Start Development Server**
   ```bash
   npm run dev
   ```

## Database Options

### Option 1: Local PostgreSQL
Install PostgreSQL locally and use:
```
DATABASE_URL="postgresql://user:password@localhost:5432/wedsite?schema=public"
```

### Option 2: Supabase
1. Create a project at [supabase.com](https://supabase.com)
2. Get your connection string from Settings > Database
3. Use the connection string as `DATABASE_URL`

### Option 3: Vercel Postgres
1. Create a Postgres database in Vercel
2. Use the connection string provided

## First Steps After Setup

1. **Login to Admin Panel**
   - Go to `http://localhost:3000/admin/login`
   - Use the credentials you created with the seed script

2. **Create Your First Guest**
   - Go to Guest Management
   - Click "Create Guest"
   - Fill in name, phone (optional), and select events
   - Copy the generated invitation link

3. **Set Up Events**
   - Go to Event Editor
   - Edit each event (Mehndi, Wedding, Reception)
   - Add dates, times, venues, and map embeds

4. **Test the Invitation Flow**
   - Open the invitation link in a new browser/incognito window
   - Enter phone number when prompted
   - Verify access is granted

## Production Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `ADMIN_CONTACT_PHONE`
   - `NEXT_PUBLIC_ADMIN_CONTACT` (optional)
4. Deploy

### Environment Variables for Production

```env
DATABASE_URL=your_production_database_url
JWT_SECRET=generate_a_strong_random_secret
ADMIN_CONTACT_PHONE=your_phone_number
NEXT_PUBLIC_ADMIN_CONTACT=your_phone_number
NODE_ENV=production
```

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check if database is accessible
- Ensure Prisma schema matches your database

### Admin Login Not Working
- Verify admin user was created: `npm run seed:admin`
- Check `JWT_SECRET` is set
- Clear cookies and try again

### Device Fingerprinting Issues
- Ensure JavaScript is enabled
- Check browser console for errors
- Some privacy-focused browsers may block fingerprinting

### Token Not Working
- Verify token exists in database
- Check if token has expired (if expiry is enabled)
- Regenerate token from admin panel if needed

