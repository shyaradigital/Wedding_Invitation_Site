# Wedding Invitation Website - Complete Documentation

## Table of Contents
1. [Purpose & Overview](#purpose--overview)
2. [Technology Stack](#technology-stack)
3. [Core Features](#core-features)
4. [Architecture & Project Structure](#architecture--project-structure)
5. [Database Schema](#database-schema)
6. [API Routes](#api-routes)
7. [User Flows](#user-flows)
8. [Security Features](#security-features)
9. [Content Pages & Sections](#content-pages--sections)
10. [Admin Panel Features](#admin-panel-features)
11. [Design & Styling](#design--styling)
12. [Deployment Configuration](#deployment-configuration)
13. [Current State & Known Limitations](#current-state--known-limitations)
14. [Areas for Improvement](#areas-for-improvement)

---

## Purpose & Overview

This is a **secure, personalized wedding invitation website** for **Ankita Brijesh Sharma & Jay Bhavan Mehta's wedding** scheduled for **March 20-21, 2026**. The website provides a private, token-based invitation system where each guest receives a unique link to access personalized wedding information.

### Key Objectives:
- Provide secure, personalized access to wedding details
- Allow guests to view event-specific information based on their invitation
- Collect guest preferences (menu choices, dietary restrictions)
- Enable admin management of guests
- Create a beautiful, mobile-first wedding experience

---

## Technology Stack

### Frontend
- **Framework**: Next.js 14.2.5 (App Router)
- **Language**: TypeScript 5.5.4
- **UI Library**: React 18.3.1
- **Styling**: Tailwind CSS 3.4.7
- **Animations**: Framer Motion 11.3.19
- **Fonts**: 
  - Playfair Display (display/headings)
  - Dancing Script (script/elegant text)
  - Georgia (serif body text)

### Backend
- **Runtime**: Node.js (Next.js API Routes)
- **Database**: SQLite (development) / PostgreSQL (production-ready)
- **ORM**: Prisma 5.19.1
- **Authentication**: JWT (jsonwebtoken 9.0.2)
- **Password Hashing**: bcryptjs 2.4.3

### Utilities & Libraries
- **Validation**: Zod 3.23.8
- **Excel Import**: xlsx 0.18.5
- **Utilities**: clsx, tailwind-merge
- **Type Definitions**: @types/node, @types/react, @types/react-dom

### Development Tools
- **Package Manager**: npm
- **Script Runner**: tsx 4.16.2
- **Linting**: ESLint with Next.js config

---

## Core Features

### 1. Personalized Guest Access
- **Unique Token System**: Each guest receives a unique, secure token (long random string)
- **Token-based URLs**: `/invite/[token]` - personalized invitation link
- **Phone Verification**: Required on first visit to verify identity
- **Device Fingerprinting**: Tracks allowed devices to prevent unauthorized access
- **Device Limits**: Configurable maximum devices per guest (default: 1)

### 2. Event-Based Access Control
- **Event Types**:
  - `mehndi` - Mehndi & Pithi ceremony
  - `wedding` - Hindu Wedding ceremony
  - `reception` - Wedding Reception
- **Access Levels**:
  - **All Events**: Full access to all three ceremonies
  - **Reception Only**: Access only to reception event
- **Dynamic Content**: Guests only see events they're invited to

### 3. Guest Preferences Collection
- **Menu Preferences**: Vegetarian, Non-Vegetarian, or Both
- **Dietary Restrictions**: Free text for allergies and special requirements
- **Additional Information**: Optional notes from guests
- **One-time Submission**: Preferences can only be submitted once
- **Admin View**: All preferences visible in admin dashboard

### 4. Admin Panel
- **Secure Login**: JWT-based authentication
- **Guest Management**:
  - Create, edit, delete guests
  - Assign event access (all-events or reception-only)
  - Generate and copy invitation links
  - Regenerate tokens
  - View device access counts
  - Import guests from Excel/CSV
  - Export guest list to CSV
  - Search and filter guests
  - Clear device access for guests
- **Preview Mode**: Admins can preview guest views using tokens

### 5. Security Features
- **Token Security**: Long, random, non-guessable tokens
- **Phone Verification**: Required for first-time access
- **Device Fingerprinting**: SHA-256 hash of browser characteristics
  - User agent
  - Screen resolution
  - Timezone
  - Platform
  - Canvas fingerprint
  - LocalStorage ID
- **Rate Limiting**: API endpoints protected against abuse
- **JWT Sessions**: Secure admin authentication
- **Input Validation**: Zod schemas for all API inputs
- **Access Control**: Middleware and route-level protection

### 6. Mobile-First Design
- **Responsive Layout**: Optimized for all screen sizes
- **Touch-Friendly**: Minimum 44px touch targets
- **Mobile Navigation**: Slide-in menu for mobile devices
- **Performance**: Optimized images and lazy loading
- **Accessibility**: ARIA labels, keyboard navigation, focus states

### 7. Animations & UX
- **Page Transitions**: Smooth transitions between pages
- **Floating Petals**: Decorative animation on pages
- **Loading States**: Spinners and skeleton screens
- **Error Handling**: User-friendly error messages
- **Form Validation**: Real-time validation feedback

---

## Architecture & Project Structure

```
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── admin/                # Admin API endpoints
│   │   │   ├── guest/            # Guest CRUD operations
│   │   │   ├── login/            # Admin authentication
│   │   │   └── logout/           # Admin logout
│   │   ├── events/               # Public event endpoints
│   │   ├── guest/                # Guest-related endpoints
│   │   ├── verify-token/         # Token verification
│   │   ├── verify-phone/         # Phone verification
│   │   ├── save-device/          # Device fingerprint saving
│   │   └── health/               # Health check
│   ├── admin/                    # Admin panel pages
│   │   ├── login/                # Admin login page
│   │   ├── page.tsx              # Admin dashboard
│   │   └── preview/[token]/      # Admin preview mode
│   ├── invite/[token]/           # Guest invitation pages
│   │   ├── page.tsx              # Home/landing page
│   │   ├── about/                # About the couple
│   │   ├── about-ankita/         # About Ankita page
│   │   ├── about-jay/            # About Jay page
│   │   ├── venue-travel/         # Venue & travel info
│   │   ├── save-the-date/        # Save the date page
│   │   ├── gallery/              # Photo gallery
│   │   └── events/[slug]/        # Individual event pages
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Public landing page
│   └── globals.css               # Global styles
├── components/                   # React components
│   ├── AdminDashboard.tsx        # Main admin interface
│   ├── GuestEditor.tsx           # Guest management UI
│   ├── GuestInviteLayout.tsx     # Guest invitation layout
│   ├── InvitationNavigation.tsx  # Navigation component
│   ├── InvitationPageLayout.tsx  # Page wrapper for guest pages
│   ├── PhoneVerificationForm.tsx # Phone verification UI
│   ├── GuestPreferencesForm.tsx  # Preferences collection form
│   ├── EventCard.tsx             # Event display card
│   ├── FloatingPetals.tsx        # Decorative animation
│   ├── PageTransition.tsx        # Page transition wrapper
│   ├── AccessRestrictedPopup.tsx # Access denied popup
│   ├── WhatsAppShare.tsx         # WhatsApp sharing (if implemented)
│   └── Preview*.tsx              # Preview components for admin
├── lib/                          # Utility libraries
│   ├── prisma.ts                 # Prisma client instance
│   ├── auth.ts                   # Authentication utilities
│   ├── admin-auth.ts             # Admin authentication
│   ├── device-fingerprint.ts     # Device fingerprinting
│   ├── rate-limit.ts             # Rate limiting
│   └── utils.ts                  # General utilities
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── dev.db                    # SQLite database (dev)
├── scripts/                      # Utility scripts
│   ├── seed-admin.ts             # Create admin user
│   └── seed-events.ts            # Seed initial events
├── middleware.ts                 # Next.js middleware
├── next.config.js                # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Dependencies and scripts
└── vercel.json                   # Vercel deployment config
```

---

## Database Schema

### Guest Model
```prisma
model Guest {
  id                    String    @id @default(cuid())
  name                  String
  phone                 String?
  token                 String    @unique
  eventAccess           String    @default("[]") // JSON array: ["mehndi", "wedding", "reception"]
  allowedDevices        String    @default("[]") // JSON array: array of fingerprint hashes
  tokenUsedFirstTime    DateTime?
  tokenExpiresAfterFirstUse Boolean @default(false)
  maxDevicesAllowed     Int       @default(1)
  numberOfAttendees     Int       @default(1)
  // Guest preferences
  preferencesSubmitted  Boolean   @default(false)
  menuPreference        String?   // "veg", "non-veg", "both"
  dietaryRestrictions   String?
  additionalInfo        String?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
}
```

**Key Fields:**
- `token`: Unique secure token for invitation link
- `eventAccess`: JSON array of event slugs the guest can access
- `allowedDevices`: JSON array of device fingerprint hashes
- `maxDevicesAllowed`: Maximum number of devices (default: 1)
- `preferencesSubmitted`: Tracks if guest has submitted preferences

### Admin Model
```prisma
model Admin {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String   // hashed with bcrypt
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Event Model
```prisma
model Event {
  id          String   @id @default(cuid())
  slug        String   @unique // "mehndi", "wedding", "reception"
  title       String
  description String?
  date        DateTime?
  time        String?
  venue       String?
  address     String?
  dressCode   String?
  mapEmbedUrl String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```


---

## API Routes

### Public/Guest APIs

#### `POST /api/verify-token`
- **Purpose**: Verify if a token is valid
- **Request Body**: `{ token: string }`
- **Response**: `{ guest: GuestData }` or error
- **Status Codes**: 200 (valid), 404 (not found), 410 (expired)

#### `POST /api/verify-phone`
- **Purpose**: Verify phone number matches guest record
- **Request Body**: `{ token: string, phone: string }`
- **Response**: `{ success: boolean, isFirstTime: boolean }`
- **Status Codes**: 200 (verified), 403 (wrong phone)

#### `POST /api/save-device`
- **Purpose**: Save device fingerprint after phone verification
- **Request Body**: `{ token: string, phone: string, fingerprint: string }`
- **Response**: `{ success: boolean }`
- **Status Codes**: 200 (saved), 403 (device limit reached)

#### `GET /api/guest/[token]`
- **Purpose**: Get guest information
- **Response**: `{ guest: GuestData }`
- **Status Codes**: 200, 404

#### `GET /api/guest/preferences?token=...`
- **Purpose**: Check if preferences have been submitted
- **Response**: `{ preferencesSubmitted: boolean }`

#### `POST /api/guest/preferences`
- **Purpose**: Submit guest preferences
- **Request Body**: 
  ```json
  {
    token: string,
    menuPreference: "veg" | "non-veg" | "both",
    dietaryRestrictions?: string,
    additionalInfo?: string
  }
  ```
- **Response**: `{ success: boolean }`

#### `GET /api/events/[slug]`
- **Purpose**: Get event details by slug
- **Response**: `{ event: EventData }`
- **Status Codes**: 200, 404

#### `GET /api/health`
- **Purpose**: Health check endpoint
- **Response**: `{ status: "ok" }`

### Admin APIs

#### `POST /api/admin/login`
- **Purpose**: Admin authentication
- **Request Body**: `{ email: string, password: string }`
- **Response**: `{ token: string }` (JWT cookie set)
- **Status Codes**: 200, 401

#### `POST /api/admin/logout`
- **Purpose**: Admin logout
- **Response**: `{ success: boolean }` (clears JWT cookie)

#### `GET /api/admin/guest`
- **Purpose**: List all guests (admin only)
- **Response**: `{ guests: Guest[] }`
- **Requires**: Admin authentication

#### `POST /api/admin/guest`
- **Purpose**: Create new guest
- **Request Body**:
  ```json
  {
    name: string,
    phone?: string,
    eventAccess: "all-events" | "reception-only",
    maxDevicesAllowed?: number,
    numberOfAttendees?: number
  }
  ```
- **Response**: `{ success: boolean, guest: GuestData }`
- **Requires**: Admin authentication

#### `PATCH /api/admin/guest/[id]`
- **Purpose**: Update guest
- **Request Body**: Partial guest data
- **Response**: `{ success: boolean, guest: GuestData }`
- **Requires**: Admin authentication

#### `DELETE /api/admin/guest/[id]`
- **Purpose**: Delete guest
- **Response**: `{ success: boolean }`
- **Requires**: Admin authentication

#### `POST /api/admin/guest/import`
- **Purpose**: Import guests from Excel/CSV
- **Request**: Multipart form data with file
- **Response**: `{ success: boolean, imported: number }`
- **Requires**: Admin authentication

**Note**: Event management API routes exist (`/api/admin/events/*`) but are not currently used in the admin UI. Events are managed through database seeding scripts.

---

## User Flows

### Guest Flow

1. **Receive Invitation Link**
   - Guest receives unique link: `https://website.com/invite/[token]`

2. **First Visit - Token Verification**
   - System verifies token exists and is valid
   - If invalid/expired: Show access denied page

3. **Phone Number Entry**
   - If guest has no phone on record: Show phone input form
   - If guest has phone: Proceed to device check

4. **Device Fingerprinting**
   - System generates device fingerprint
   - Checks if device is in `allowedDevices` array
   - If device is allowed: Grant access
   - If new device: Require phone verification

5. **Phone Verification (New Device)**
   - Guest enters phone number
   - System verifies phone matches guest record
   - If correct: Save device fingerprint
   - If incorrect: Show access restricted popup
   - Check device limit (maxDevicesAllowed)

6. **Access Granted**
   - Show preferences form (if not submitted)
   - Display personalized invitation homepage
   - Guest can navigate all accessible pages

7. **Subsequent Visits**
   - Same device: Automatic access
   - New device: Phone verification required again

### Admin Flow

1. **Login**
   - Navigate to `/admin/login`
   - Enter email and password
   - System validates and sets JWT cookie
   - Redirect to `/admin` dashboard

2. **Dashboard Navigation**
   - Guest Management tab for managing all guest-related operations

3. **Guest Management**
   - View all guests in table
   - Create new guest (with event access assignment)
   - Edit guest details
   - Delete guests
   - Copy invitation links
   - Regenerate tokens
   - Import from Excel/CSV
   - Export to CSV
   - Search and filter

4. **Preview Mode**
   - Use any guest token to preview their view
   - Navigate to `/admin/preview/[token]`
   - See exactly what guest sees

---

## Security Features

### Token Security
- **Generation**: Long random strings (cuid-based or custom secure generation)
- **Uniqueness**: Database-enforced unique constraint
- **Non-guessable**: Cryptographically secure random generation
- **Storage**: Stored in database, never exposed in URLs unnecessarily

### Phone Verification
- **First-time Requirement**: Must verify phone on first access
- **Device Linking**: Phone verification links device to guest
- **Verification Logic**: Exact match required (no fuzzy matching)

### Device Fingerprinting
- **Components**:
  - User agent string
  - Screen resolution
  - Timezone
  - Platform
  - Canvas fingerprint (rendering characteristics)
  - LocalStorage ID (persistent identifier)
- **Hashing**: SHA-256 hash of combined fingerprint data
- **Storage**: Array of hashes in `allowedDevices` field
- **Limits**: Configurable `maxDevicesAllowed` per guest

### Authentication
- **Admin**: JWT tokens stored in HTTP-only cookies
- **Password Hashing**: bcrypt with salt rounds
- **Session Management**: JWT expiration and validation

### Rate Limiting
- **API Protection**: Rate limiting on sensitive endpoints
- **Prevents Abuse**: Limits brute force and scraping attempts

### Input Validation
- **Zod Schemas**: All API inputs validated with Zod
- **Type Safety**: TypeScript for compile-time safety
- **Sanitization**: Prevents injection attacks

### Access Control
- **Middleware**: Route-level protection
- **Admin Routes**: Require valid JWT
- **Guest Routes**: Token-based access verification
- **Event Filtering**: Server-side filtering of accessible events

---

## Content Pages & Sections

### Guest-Facing Pages

#### 1. Home Page (`/invite/[token]`)
- **Hero Section**: Couple names, wedding dates (March 20-21, 2026)
- **Welcome Message**: Personalized greeting
- **Event Cards**: Display events guest is invited to
  - Mehndi & Pithi (if invited)
  - Hindu Wedding (if invited)
  - Reception (if invited)
- **Navigation**: Links to all other sections

#### 2. About Ankita (`/invite/[token]/about-ankita`)
- **Content**: Information about the bride
- **Layout**: Elegant card-based design
- **Navigation**: Accessible from main nav

#### 3. About Jay (`/invite/[token]/about-jay`)
- **Content**: Information about the groom
- **Layout**: Elegant card-based design
- **Navigation**: Accessible from main nav

#### 4. Venue & Travel (`/invite/[token]/venue-travel`)
- **Content**: 
  - Venue information
  - Travel directions
  - Accommodation suggestions
  - Map embeds
- **Layout**: Information cards with maps

#### 5. Save the Date (`/invite/[token]/save-the-date`)
- **Content**: 
  - All event dates and times
  - Quick reference calendar
  - Event icons and details
- **Filtering**: Shows only events guest is invited to

#### 6. Gallery (`/invite/[token]/gallery`)
- **Content**: Photo gallery (placeholder currently)
- **Layout**: Grid-based image display

#### 7. Event Detail Pages (`/invite/[token]/events/[slug]`)
- **Slugs**: `mehndi`, `wedding`, `reception`
- **Content**:
  - Event title and description
  - Date and time
  - Venue name and address
  - Dress code
  - Map embed (if available)
- **Access Control**: Only visible if guest has access to that event

### Navigation Structure
- **Desktop**: Horizontal navigation bar with icons
- **Mobile**: Hamburger menu with slide-in drawer
- **Active State**: Highlights current page
- **Guest Name**: Shows personalized greeting in nav

---

## Admin Panel Features

### Dashboard Layout
- **Header**: Title, logout button
- **Tab**: 
  - 👥 Guest Management

### Guest Management Tab
- **Guest List Table**:
  - Name
  - Phone
  - Token (truncated)
  - Event Access
  - Device Count
  - Preferences Status
  - Actions (View, Edit, Delete, Copy Link)
- **Create Guest Form**:
  - Name (required)
  - Phone (required)
  - Event Access: "All Events" or "Reception Only"
  - Max Devices Allowed (default: 1)
  - Number of Attendees (default: 1)
- **Edit Guest**:
  - Modify all fields
  - Regenerate token option
  - Clear devices option
- **Bulk Operations**:
  - Import from Excel/CSV
  - Export to CSV
- **Search & Filter**:
  - Search by name, phone, token
  - Filter by event access

### Preview Mode
- **Access**: `/admin/preview/[token]`
- **Purpose**: See exactly what a guest sees
- **Features**: Full guest experience with admin context

---

## Design & Styling

### Color Palette
```css
Wedding Gold: #D4AF37
Gold Light: #E8D5A3
Rose: #E8B4B8
Rose Light: #F5D7DA
Rose Pastel: #F8E8E9
Cream: #F5F5DC
Cream Light: #FAF9F6
Burgundy: #800020
Burgundy Light: #A64D4D
Navy: #1A1A2E
Navy Light: #2D2D4A
Ivory: #FFFEF7
Blush: #F4E4E6
```

### Typography
- **Display Font**: Playfair Display (headings)
- **Script Font**: Dancing Script (elegant text)
- **Body Font**: Georgia (serif, readable)

### Design Elements
- **Gradients**: 
  - Wedding gradient: `linear-gradient(135deg, #F8E8E9 0%, #FAF9F6 50%, #F5D7DA 100%)`
  - Gold gradient: `linear-gradient(135deg, #D4AF37 0%, #E8D5A3 100%)`
- **Cards**: White with backdrop blur, gold borders
- **Dividers**: Gradient lines with gold/rose colors
- **Shadows**: Soft, elegant shadows
- **Animations**: Floating petals, page transitions

### Responsive Breakpoints
- **Mobile**: < 640px (default, mobile-first)
- **Tablet**: 640px - 768px
- **Desktop**: > 768px

### Mobile Optimizations
- **Touch Targets**: Minimum 44px height/width
- **Font Sizes**: 16px base (prevents iOS zoom)
- **Safe Areas**: Support for notched devices
- **Scroll Behavior**: Smooth scrolling, no horizontal overflow
- **Menu**: Full-screen slide-in menu on mobile

### Accessibility
- **ARIA Labels**: On interactive elements
- **Keyboard Navigation**: Full keyboard support
- **Focus States**: Visible focus indicators
- **Color Contrast**: WCAG compliant
- **Screen Readers**: Semantic HTML

---

## Deployment Configuration

### Vercel Configuration (`vercel.json`)
```json
{
  "buildCommand": "npx prisma generate && npx prisma db push && npm run seed:admin && npm run seed:events && npm run build",
  "installCommand": "npm install"
}
```

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string (production)
- `JWT_SECRET`: Secret key for JWT signing
- `ADMIN_CONTACT_PHONE`: Contact number for access issues
- `NEXT_PUBLIC_ADMIN_CONTACT`: Public contact number (optional)

### Database
- **Development**: SQLite (`prisma/dev.db`)
- **Production**: PostgreSQL (via `DATABASE_URL`)

### Build Process
1. Generate Prisma client
2. Push database schema
3. Seed admin user (if needed)
4. Seed events (if needed)
5. Build Next.js application

### Scripts
- `npm run dev`: Development server
- `npm run build`: Production build
- `npm run start`: Production server
- `npm run db:push`: Push schema to database
- `npm run db:studio`: Open Prisma Studio
- `npm run seed:admin`: Create admin user
- `npm run seed:events`: Seed initial events

---

## Current State & Known Limitations

### Implemented Features ✅
- Token-based guest access system
- Phone verification
- Device fingerprinting
- Guest preferences collection
- Admin panel with guest management
- Event-based access control
- Mobile-responsive design
- Beautiful wedding-themed UI
- Guest import/export (CSV/Excel)
- Admin preview mode
- Search and filter guests

### Partially Implemented ⚠️
- **Gallery**: Page exists but content is placeholder
- **About Pages**: Static content, not editable via admin
- **Event Management**: API routes exist but no admin UI for managing events

### Not Implemented ❌
- **RSVP System**: No RSVP functionality
- **Email Notifications**: No email sending
- **SMS Notifications**: No SMS sending
- **WhatsApp Integration**: Component exists but not fully integrated
- **Image Upload**: No image upload functionality
- **Content Editor**: No rich text editor for content pages
- **Analytics**: No visitor analytics
- **Multi-language Support**: English only
- **Guest Messaging**: No way for guests to send messages
- **Event Reminders**: No reminder system

### Known Issues
- Content pages (About, Venue & Travel) are hardcoded, not editable
- Gallery page is placeholder
- No image management system
- Admin must manually copy invitation links (no bulk send)
- No way to track if guests have viewed their invitation
- Preferences form shows on every visit until submitted (could be improved)

---

## Areas for Improvement

### Admin Features
1. **Event Management UI**: Add admin interface for creating and editing events (API routes exist but no UI)
2. **Content Management System**: Implement admin interface for editing About pages, Venue & Travel content
3. **Rich Text Editor**: Implement WYSIWYG editor for content pages
4. **Image Upload**: Add image upload and management
5. **Gallery Management**: Allow admin to upload/manage gallery photos

### User Experience
1. **RSVP System**: Add RSVP functionality with confirmation
2. **Email Notifications**: Send invitation emails automatically
3. **SMS Reminders**: Send event reminders via SMS
4. **WhatsApp Integration**: Share invitation via WhatsApp
5. **Guest Dashboard**: Show guest their RSVP status, preferences
6. **Event Calendar**: iCal/Google Calendar export
7. **Directions Integration**: Better map/directions integration

### Additional Admin Features
1. **Bulk Actions**: Send invitations to multiple guests
2. **Analytics Dashboard**: Track views, preferences, RSVPs
3. **Guest Communication**: Send messages to guests
4. **Event Templates**: Pre-configured event templates
5. **Guest Groups**: Organize guests into groups
6. **Export Reports**: Detailed reports (RSVPs, preferences, etc.)

### Technical Improvements
1. **Database Migration**: Proper Prisma migrations (not just push)
2. **Error Logging**: Comprehensive error logging system
3. **Performance**: Image optimization, caching
4. **SEO**: Meta tags, Open Graph, structured data
5. **PWA**: Progressive Web App capabilities
6. **Offline Support**: Service workers for offline access
7. **Testing**: Unit tests, integration tests
8. **CI/CD**: Automated testing and deployment

### Security Enhancements
1. **Rate Limiting**: More granular rate limiting
2. **CSRF Protection**: CSRF tokens for forms
3. **Content Security Policy**: CSP headers
4. **Audit Logging**: Log admin actions
5. **Two-Factor Auth**: 2FA for admin accounts

### Design Improvements
1. **Theme Customization**: Allow admin to customize colors/fonts
2. **Template Selection**: Multiple design templates
3. **Animation Options**: Toggle animations on/off
4. **Dark Mode**: Optional dark mode
5. **Print Styles**: Better print stylesheets

### Content Improvements
1. **Story Section**: "Our Story" timeline
2. **Wedding Party**: Introduce wedding party members
3. **Registry**: Gift registry integration
4. **Live Updates**: Real-time updates during events
5. **Photo Sharing**: Allow guests to upload photos
6. **Guest Book**: Digital guest book

---

## Additional Notes

### Wedding Details
- **Couple**: Ankita Brijesh Sharma & Jay Bhavan Mehta
- **Dates**: March 20-21, 2026
- **Events**: 
  - Mehndi & Pithi (March 20, 2026)
  - Hindu Wedding (March 21, 2026)
  - Reception (March 21, 2026)

### Default Admin Credentials
- **Email**: `admin`
- **Password**: `admin123`
- ⚠️ **Must be changed in production!**

### Development Setup
- See `QUICK_START.md` for quick start guide
- See `SETUP_DATABASE.md` for database setup
- See `README.md` for full documentation

---

## Conclusion

This is a comprehensive, secure wedding invitation website with personalized access, event management, and guest preference collection. The codebase is well-structured using modern technologies (Next.js, TypeScript, Prisma) and follows best practices for security and user experience.

The main areas for improvement are:
1. **Event Management UI**: Add admin interface for managing events
2. **RSVP Functionality**: Add RSVP system
3. **Communication**: Email/SMS notifications
4. **Image Management**: Upload and manage images
5. **Analytics**: Track engagement and usage
6. **Content Management**: Make content pages editable via admin

The foundation is solid and ready for these enhancements.

