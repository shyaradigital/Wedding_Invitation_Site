# Wedding Invitation Website

A secure, personalized wedding invitation website built with Next.js 14, Prisma, and TypeScript.

## Features

- **Personalized Guest Links**: Each guest receives a unique, secure token-based URL
- **Phone Number Verification**: First-time visitors must verify their phone number
- **Device Fingerprinting**: Secure device-based access control
- **Event-Based Filtering**: Guests only see events they're invited to
- **Admin Panel**: Full guest and event management system
- **Responsive Design**: Beautiful, mobile-first wedding theme

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based admin authentication
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Type Safety**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Environment variables configured

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your database URL and other configuration:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/wedsite?schema=public"
JWT_SECRET="your-secret-key-here"
ADMIN_CONTACT_PHONE="your-phone-number"
```

3. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

4. Create an admin user:
```bash
npm run seed:admin
```

**Default Admin Credentials:**
- **Email:** `admin`
- **Password:** `admin123`

⚠️ Change the password after first login in production!

5. Seed initial events (optional):
```bash
npx tsx scripts/seed-events.ts
```

6. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── admin/             # Admin panel pages
│   └── invite/[token]/    # Guest invitation pages
├── components/            # React components
├── lib/                   # Utility functions
├── prisma/                # Database schema
└── scripts/               # Utility scripts
```

## Security Features

- **Token-based Access**: Long, random, non-guessable tokens
- **Phone Verification**: Required on first visit
- **Device Fingerprinting**: Prevents unauthorized device access
- **Rate Limiting**: API endpoints are rate-limited
- **JWT Authentication**: Secure admin sessions
- **Input Validation**: Zod schemas for all inputs

## Admin Panel

Access the admin panel at `/admin/login` with your admin credentials.

### Features:
- Create and manage guests
- Assign event access
- Generate and copy invitation links
- Regenerate tokens
- View device access counts
- Edit event details
- Manage content pages

## Guest Flow

1. Guest receives unique link: `/invite/[token]`
2. First visit: Enter phone number
3. Device fingerprint is generated and saved
4. Access granted to personalized invitation
5. Future visits: Automatic access if same device
6. New device: Phone verification required

## Database Schema

### Guest
- Personal information (name, phone)
- Unique token for invitation link
- Event access array
- Allowed devices (fingerprint hashes)
- Device limits and token expiry settings

### Admin
- Email and hashed password
- JWT-based session management

### Event
- Event details (date, time, venue, etc.)
- Map embeds and dress codes

## API Routes

- `POST /api/verify-token` - Verify guest token
- `POST /api/verify-phone` - Verify phone number
- `POST /api/save-device` - Save device fingerprint
- `GET /api/guest/[token]` - Get guest information
- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/guest` - List all guests
- `POST /api/admin/guest` - Create new guest
- `PATCH /api/admin/guest/[id]` - Update guest
- `GET /api/events/[slug]` - Get event details

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT token signing
- `ADMIN_CONTACT_PHONE` - Contact number for access issues
- `NEXT_PUBLIC_ADMIN_CONTACT` - Public contact number (optional)

## Development

```bash
# Run development server
npm run dev

# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Open Prisma Studio
npm run db:studio
```

## Production Deployment

See `DEPLOYMENT.md` and `PRODUCTION_SETUP.md` for detailed deployment instructions.

**Quick Steps:**
1. Update `prisma/schema.prisma` to use PostgreSQL (change from `sqlite` to `postgresql`)
2. Set up a PostgreSQL database (Supabase, Neon, Railway, or Vercel Postgres)
3. Configure environment variables (see `.env.example`)
4. Run database migrations: `npm run db:migrate:deploy`
5. Seed admin user: `npm run seed:admin` (default: admin/admin123)
6. Seed events: `npm run seed:events`
7. Deploy to Vercel, Netlify, or your preferred platform

**Admin Login:**
- Email: `admin`
- Password: `admin123`

## License

Private project for wedding invitation purposes.

