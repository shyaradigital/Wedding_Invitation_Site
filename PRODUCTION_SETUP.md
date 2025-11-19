# Production Setup Instructions

## Admin Credentials

**Default Admin Login:**
- **Email:** `admin`
- **Password:** `admin123`

⚠️ **Important:** Change the password after first login in production!

## Quick Start for Production

### 1. Update Database to PostgreSQL

Edit `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  // Change from "sqlite"
  url      = env("DATABASE_URL")
}
```

### 2. Set Environment Variables

Create a `.env` file or set in your hosting platform:

```env
DATABASE_URL="postgresql://user:password@host:5432/database"
JWT_SECRET="generate-a-strong-random-secret-here"
ADMIN_EMAIL="admin"
ADMIN_PASSWORD="admin123"
NEXT_PUBLIC_ADMIN_CONTACT="+1234567890"
NODE_ENV="production"
```

### 3. Generate JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Run Database Setup

```bash
# Generate Prisma Client
npm run db:generate

# Run migrations
npm run db:migrate:deploy

# Seed admin user
npm run seed:admin

# Seed events
npm run seed:events
```

### 5. Build and Deploy

```bash
npm run build
npm start
```

## Environment Variables Explained

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | - |
| `JWT_SECRET` | Secret key for JWT tokens | Yes | - |
| `ADMIN_EMAIL` | Admin login email | No | `admin` |
| `ADMIN_PASSWORD` | Admin login password | No | `admin123` |
| `NEXT_PUBLIC_ADMIN_CONTACT` | Contact phone for error messages | No | `---` |
| `NODE_ENV` | Environment mode | No | `development` |

## Security Checklist

- [ ] Change default admin password
- [ ] Use strong JWT_SECRET (32+ characters)
- [ ] Use PostgreSQL in production (not SQLite)
- [ ] Enable HTTPS/SSL
- [ ] Set secure cookie settings
- [ ] Review and update rate limiting
- [ ] Regular database backups

## Database Providers (Free Tiers)

- **Supabase**: https://supabase.com (Free PostgreSQL)
- **Neon**: https://neon.tech (Serverless PostgreSQL)
- **Railway**: https://railway.app (Free tier available)
- **Render**: https://render.com (Free PostgreSQL)

## Deployment Platforms

- **Vercel**: https://vercel.com (Recommended for Next.js)
- **Netlify**: https://netlify.com
- **Railway**: https://railway.app
- **Render**: https://render.com

See `DEPLOYMENT.md` for detailed deployment instructions.

