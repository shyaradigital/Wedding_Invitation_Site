# Wedding Invitation Website - Technical Documentation

## Overview

This document provides a comprehensive technical explanation of the wedding invitation website system, with a primary focus on how the system ensures guests only see the events they're invited to. This is a Next.js application built with TypeScript, Prisma ORM, and PostgreSQL.

---

## System Architecture

### Technology Stack
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (via Prisma ORM)
- **Authentication**: JWT for admin, token-based for guests
- **Security**: Device fingerprinting, phone/email verification, rate limiting

### Core Components
1. **Admin Panel** - Guest and event management
2. **Guest Portal** - Personalized invitation pages
3. **API Layer** - Token verification, device management, access control
4. **Database** - Guest records, event data, access permissions

---

## Database Schema

### Guest Model
The `Guest` model is the core of the access control system:

```prisma
model Guest {
  id                    String    @id @default(cuid())
  name                  String
  phone                 String?
  email                 String?
  token                 String    @unique  // Unique invitation token
  eventAccess           String    @default("[]")  // JSON: ["mehndi", "wedding", "reception"]
  allowedDevices        String    @default("[]")  // JSON: Array of device fingerprint hashes
  tokenUsedFirstTime    DateTime?
  tokenExpiresAfterFirstUse Boolean @default(false)
  maxDevicesAllowed     Int       @default(1)
  numberOfAttendees     Int       @default(1)
  // ... RSVP and preference fields
}
```

**Key Fields for Access Control:**
- `token`: Unique, non-guessable invitation token (cuid or secure random)
- `eventAccess`: JSON array storing which events the guest can access
- `allowedDevices`: JSON array of SHA-256 hashed device fingerprints
- `maxDevicesAllowed`: Limits how many devices can access the invitation

### Event Model
```prisma
model Event {
  id          String   @id @default(cuid())
  slug        String   @unique  // "mehndi", "wedding", "reception"
  title       String
  description String?
  date        DateTime?
  // ... venue, time, etc.
}
```

---

## How Event Access Control Works

### 1. Guest Creation (Admin Panel)

When an admin creates a guest, they assign event access:

**Two Guest Types:**
- **All Events**: `eventAccess = ["mehndi", "wedding", "reception"]`
- **Reception Only**: `eventAccess = ["reception"]`

The `eventAccess` field is stored as a JSON string in the database:
```json
["mehndi", "wedding", "reception"]  // All events
["reception"]                        // Reception only
```

### 2. Token-Based Access

Each guest receives a unique invitation link:
```
/invite/[token]
```

The token is:
- **Unique**: Database-enforced unique constraint
- **Non-guessable**: Cryptographically secure random generation
- **Long**: Typically 25+ characters
- **Stored securely**: Never exposed unnecessarily

### 3. Token Verification Flow

When a guest visits their invitation link:

#### Step 1: Token Validation (`/api/verify-token`)
```typescript
// API checks if token exists in database
const guest = await prisma.guest.findUnique({
  where: { token }
})

// Returns guest data including eventAccess array
return {
  guest: {
    id: guest.id,
    name: guest.name,
    eventAccess: ["mehndi", "wedding", "reception"],  // Parsed from JSON
    allowedDevices: [...],
    maxDevicesAllowed: 1
  }
}
```

#### Step 2: Device Verification
The system checks if the device is already registered:
- **Registered device**: Automatic access granted
- **New device**: Requires phone/email verification

#### Step 3: Access Granted
Once verified, the guest's `eventAccess` array is stored in the client-side state and used throughout the application.

### 4. Event Filtering on Pages

Every page that displays events filters based on the guest's `eventAccess`:

**Example: Save the Date Page**
```typescript
// Get guest data with eventAccess
const { guest } = useGuestAccess(token)

// Filter events based on access
const events = guest.eventAccess
  .map((slug) => eventData[slug])
  .filter(Boolean)  // Only show events guest has access to
```

**Example: Navigation Menu**
```typescript
// Only add navigation items for accessible events
if (eventAccess.includes('mehndi')) {
  navItems.push({ href: '/events/mehndi', label: 'Mehndi' })
}
if (eventAccess.includes('wedding')) {
  navItems.push({ href: '/events/wedding', label: 'Wedding' })
}
if (eventAccess.includes('reception')) {
  navItems.push({ href: '/events/reception', label: 'Reception' })
}
```

**Example: Event Detail Pages**
```typescript
// Route: /invite/[token]/events/[slug]
// Server-side check before rendering
if (!guest.eventAccess.includes(slug)) {
  // Redirect or show access denied
  return <AccessDenied />
}
```

### 5. Invitation Video Access Control

The invitation video feature demonstrates event-based content delivery:

```typescript
// Determine which video to show
const isAllEvents = 
  guest.eventAccess.includes('mehndi') &&
  guest.eventAccess.includes('wedding') &&
  guest.eventAccess.includes('reception')

const videoSrc = isAllEvents
  ? '/videos/invitation-all-events.mp4'
  : '/videos/invitation-reception-only.mp4'
```

**Result:**
- Guests with all events → See full invitation video
- Reception-only guests → See reception-specific video

---

## Security Mechanisms

### 1. Device Fingerprinting

**Purpose**: Prevent unauthorized device access and token sharing.

**How it works:**
1. **Fingerprint Generation** (`lib/device-fingerprint.ts`):
   ```typescript
   // Collects device characteristics:
   - User agent string
   - Screen resolution
   - Timezone
   - Platform
   - Canvas fingerprint (rendering characteristics)
   - LocalStorage ID
   
   // Combines and hashes with SHA-256
   const fingerprint = await hashString(combinedData)
   ```

2. **Device Registration**:
   - First access: Phone/email verification required
   - Device fingerprint is generated and sent to server
   - Server verifies phone/email matches guest record
   - If valid: Fingerprint hash stored in `allowedDevices` array
   - If invalid: Access denied

3. **Subsequent Access**:
   - System generates fingerprint on page load
   - Checks if fingerprint exists in `allowedDevices` array
   - If found: Automatic access
   - If not found: Phone/email verification required

4. **Device Limits**:
   - `maxDevicesAllowed` field limits how many devices can access
   - Default: 1 device
   - Admin can increase limit per guest
   - If limit reached: New devices are blocked

### 2. Phone/Email Verification

**Purpose**: Verify guest identity on new devices.

**Flow:**
1. Guest enters phone number or email
2. System normalizes input (removes spaces, formats phone)
3. Compares with stored guest phone/email (exact match required)
4. If match: Device fingerprint saved, access granted
5. If no match: Access denied with contact information

**API Endpoint**: `/api/verify-phone`
- Validates phone/email format
- Verifies against guest record
- Saves device fingerprint if valid

### 3. Token Security

**Token Generation**:
- Uses `cuid()` or secure random generation
- Minimum 25 characters
- Cryptographically secure
- Database-enforced uniqueness

**Token Validation**:
- Every API request validates token exists
- Checks token expiration (if enabled)
- Rate limiting prevents brute force attacks

**Token Expiration** (Optional):
- `tokenExpiresAfterFirstUse`: Boolean flag
- If enabled: Token expires 30 days after first use
- Prevents indefinite access

### 4. Rate Limiting

**Endpoints Protected**:
- `/api/verify-token`: 20 requests per minute per IP
- `/api/verify-phone`: 10 requests per minute per IP
- `/api/save-device`: 10 requests per minute per IP

**Implementation**:
- In-memory rate limiting
- IP-based tracking
- Returns 429 status if exceeded

---

## Admin Panel System

### Admin Authentication

**Login Flow**:
1. Admin navigates to `/admin/login`
2. Enters email and password
3. Server validates credentials (bcrypt password hashing)
4. JWT token generated and stored in HTTP-only cookie
5. Redirect to `/admin` dashboard

**Session Management**:
- JWT stored in HTTP-only cookie (prevents XSS)
- Token expiration: Configurable (typically 24 hours)
- Middleware checks JWT on all `/admin/*` routes

### Guest Management

**Creating Guests**:
```typescript
// Admin selects event access type
eventAccess: 'all-events' | 'reception-only'

// System converts to actual event array
const actualEventAccess = 
  eventAccess === 'all-events' 
    ? ['mehndi', 'wedding', 'reception']
    : ['reception']

// Stored as JSON string in database
eventAccess: JSON.stringify(actualEventAccess)
```

**Guest Operations**:
- **Create**: Assign name, phone, email, event access
- **Edit**: Modify any field, regenerate token
- **Delete**: Remove guest and all associated data
- **Copy Link**: Get invitation URL with token
- **Preview**: View exactly what guest sees

### Preview Mode

**Purpose**: Allow admins to see guest view without logging in as guest.

**How it works**:
1. Admin clicks "Preview" on any guest
2. Navigates to `/admin/preview/[token]`
3. System checks admin authentication
4. If authenticated: Returns virtual guest with all events enabled
5. Admin sees full guest experience

**Special Token**: `admin-preview`
- Only works when admin is authenticated
- Returns virtual guest with all events
- Allows testing all features

---

## Guest Experience Flow

### First Visit

1. **Guest receives link**: `/invite/[token]`
2. **Page loads**: Client-side hook `useGuestAccess(token)` runs
3. **Token verification**: API call to `/api/verify-token`
4. **Device check**: System generates fingerprint
5. **New device detected**: Phone/email verification form shown
6. **Verification**: Guest enters phone/email
7. **Validation**: Server verifies against guest record
8. **Device saved**: Fingerprint added to `allowedDevices`
9. **Access granted**: Guest sees personalized invitation

### Subsequent Visits (Same Device)

1. **Page loads**: `useGuestAccess(token)` runs
2. **Token verification**: API call to `/api/verify-token`
3. **Device check**: Fingerprint matches `allowedDevices`
4. **Automatic access**: No verification needed
5. **Personalized content**: Events filtered by `eventAccess`

### New Device Access

1. **Page loads**: Token verified
2. **Device check**: Fingerprint not in `allowedDevices`
3. **Verification required**: Phone/email form shown
4. **Device limit check**: If `allowedDevices.length >= maxDevicesAllowed`
   - **Limit reached**: Access denied, contact admin
   - **Limit not reached**: Proceed with verification
5. **Verification**: Phone/email must match exactly
6. **Device saved**: New fingerprint added
7. **Access granted**: Guest can use new device

---

## How Content is Filtered

### Navigation Menu

The navigation component dynamically builds menu items:

```typescript
const navItems = [
  { href: '/invite/[token]', label: 'About Jay and Ankita' },
  { href: '/invite/[token]/invitation-video', label: 'Invitation Video' }
]

// Only add events guest has access to
if (eventAccess.includes('mehndi')) {
  navItems.push({ href: '/events/mehndi', label: 'Mehndi' })
}
if (eventAccess.includes('wedding')) {
  navItems.push({ href: '/events/wedding', label: 'Wedding' })
}
if (eventAccess.includes('reception')) {
  navItems.push({ href: '/events/reception', label: 'Reception' })
}

// Always include these
navItems.push(
  { href: '/save-the-date', label: 'Save the Date' },
  { href: '/venue-travel', label: 'Travel and Venue' },
  { href: '/rsvp', label: 'RSVP' }
)
```

**Result**: Guests only see navigation items for events they're invited to.

### Event Pages

**Route**: `/invite/[token]/events/[slug]`

**Server-side protection**:
```typescript
// Get guest data
const guest = await getGuestByToken(token)

// Check access
if (!guest.eventAccess.includes(slug)) {
  // Redirect or show access denied
  redirect('/invite/[token]')
}

// Render event page
```

**Client-side protection**:
```typescript
// useGuestAccess hook provides guest data
const { guest } = useGuestAccess(token)

// Component checks access before rendering
if (!guest.eventAccess.includes(slug)) {
  return <AccessDenied />
}
```

### Save the Date Page

**Filtering logic**:
```typescript
// All available events
const eventData = {
  mehndi: { name: 'Mehndi', date: '...' },
  wedding: { name: 'Wedding', date: '...' },
  reception: { name: 'Reception', date: '...' }
}

// Filter to only accessible events
const events = guest.eventAccess
  .map((slug) => eventData[slug])
  .filter(Boolean)  // Remove undefined entries

// Display only filtered events
```

**Result**: Guest only sees dates for events they're invited to.

### RSVP Form

**Event filtering**:
```typescript
// Only show RSVP options for accessible events
const rsvpEvents = guest.eventAccess.map(slug => ({
  slug,
  name: eventNames[slug]
}))

// Guest can only RSVP to events they have access to
```

---

## API Endpoints

### Public/Guest APIs

#### `POST /api/verify-token`
**Purpose**: Verify invitation token and return guest data.

**Request**:
```json
{
  "token": "abc123..."
}
```

**Response**:
```json
{
  "guest": {
    "id": "guest-id",
    "name": "John Doe",
    "eventAccess": ["mehndi", "wedding", "reception"],
    "allowedDevices": ["hash1", "hash2"],
    "maxDevicesAllowed": 1,
    "hasPhone": true
  }
}
```

**Security**:
- Rate limited: 20 requests/minute per IP
- Returns 404 if token invalid
- Returns 410 if token expired
- No caching headers

#### `POST /api/verify-phone`
**Purpose**: Verify phone/email and return verification status.

**Request**:
```json
{
  "token": "abc123...",
  "phoneOrEmail": "+1234567890"
}
```

**Response**:
```json
{
  "success": true,
  "verified": true
}
```

**Security**:
- Rate limited: 10 requests/minute per IP
- Exact match required (normalized)
- Returns 403 if phone/email doesn't match

#### `POST /api/save-device`
**Purpose**: Save device fingerprint after verification.

**Request**:
```json
{
  "token": "abc123...",
  "phoneOrEmail": "+1234567890",
  "fingerprint": "sha256-hash"
}
```

**Response**:
```json
{
  "success": true,
  "isNewDevice": true
}
```

**Security**:
- Rate limited: 10 requests/minute per IP
- Verifies phone/email matches guest
- Checks device limit
- Returns 403 if limit reached

### Admin APIs

#### `POST /api/admin/login`
**Purpose**: Authenticate admin user.

**Request**:
```json
{
  "email": "admin@example.com",
  "password": "password"
}
```

**Response**:
```json
{
  "success": true,
  "admin": {
    "id": "admin-id",
    "email": "admin@example.com"
  }
}
```

**Security**:
- Password hashed with bcrypt
- JWT token set in HTTP-only cookie
- Session expiration: 24 hours

#### `GET /api/admin/guest`
**Purpose**: List all guests (admin only).

**Response**:
```json
{
  "guests": [
    {
      "id": "guest-id",
      "name": "John Doe",
      "eventAccess": ["mehndi", "wedding", "reception"],
      "token": "abc123..."
    }
  ]
}
```

**Security**:
- Requires admin authentication
- Returns all guest data

#### `POST /api/admin/guest`
**Purpose**: Create new guest.

**Request**:
```json
{
  "name": "John Doe",
  "phone": "+1234567890",
  "email": "john@example.com",
  "eventAccess": "all-events",  // or "reception-only"
  "maxDevicesAllowed": 1
}
```

**Response**:
```json
{
  "success": true,
  "guest": {
    "id": "guest-id",
    "token": "generated-token",
    "eventAccess": ["mehndi", "wedding", "reception"]
  }
}
```

**Security**:
- Requires admin authentication
- Validates input with Zod schema
- Generates secure token
- Converts eventAccess type to array

---

## Client-Side Access Control Hook

### `useGuestAccess(token: string)`

**Purpose**: Centralized access control logic for all guest pages.

**Returns**:
```typescript
{
  accessState: 'loading' | 'phone-required' | 'phone-verification' | 'access-denied' | 'granted',
  guest: Guest | null,
  error: string | null,
  handlePhoneSubmit: (phoneOrEmail: string) => Promise<boolean>,
  showRestrictedPopup: boolean
}
```

**Flow**:
1. **Initial Load**: `accessState = 'loading'`
2. **Token Verification**: Calls `/api/verify-token`
3. **Device Check**: Generates fingerprint, checks `allowedDevices`
4. **State Determination**:
   - Device registered → `accessState = 'granted'`
   - New device → `accessState = 'phone-verification'`
   - Invalid token → `accessState = 'access-denied'`
5. **Phone Verification**: User submits phone/email
6. **Device Save**: Calls `/api/save-device`
7. **Access Granted**: `accessState = 'granted'`

**Usage**:
```typescript
const { accessState, guest } = useGuestAccess(token)

if (accessState === 'loading') return <Loading />
if (accessState === 'phone-verification') return <PhoneForm />
if (accessState === 'access-denied') return <AccessDenied />
if (accessState === 'granted' && guest) {
  // Filter content based on guest.eventAccess
  const events = guest.eventAccess.map(...)
}
```

---

## Preventing Wrong Event Access

### Multi-Layer Protection

The system uses multiple layers to ensure guests only see their assigned events:

#### Layer 1: Database-Level
- `eventAccess` field stored in database
- Cannot be modified by client
- Single source of truth

#### Layer 2: API-Level
- All API responses include `eventAccess` array
- Server-side filtering before sending data
- Token validation ensures correct guest

#### Layer 3: Route-Level
- Server-side route protection
- Checks `eventAccess` before rendering pages
- Redirects if access denied

#### Layer 4: Component-Level
- Client-side filtering in components
- Navigation only shows accessible events
- Event lists filtered by `eventAccess`

#### Layer 5: UI-Level
- Conditional rendering based on `eventAccess`
- Hidden navigation items
- Filtered content lists

### Example: Complete Flow

**Scenario**: Guest "John" is invited to reception only.

1. **Database**: `eventAccess = ["reception"]`
2. **Token Verification**: API returns `eventAccess: ["reception"]`
3. **Navigation**: Only "Reception" link appears
4. **Save the Date**: Only shows reception date
5. **Event Pages**: 
   - `/events/reception` → Access granted
   - `/events/mehndi` → Access denied, redirect
   - `/events/wedding` → Access denied, redirect
6. **Invitation Video**: Shows reception-only video
7. **RSVP**: Only shows reception RSVP option

**Result**: John cannot see or access any event except reception, even if he tries to navigate directly to other event URLs.

---

## Edge Cases and Security Considerations

### Token Sharing Prevention

**Problem**: Guest shares invitation link with unauthorized person.

**Solution**:
1. Device fingerprinting limits access to registered devices
2. Phone/email verification required for new devices
3. Device limit (`maxDevicesAllowed`) prevents unlimited sharing
4. Rate limiting prevents automated attacks

### Direct URL Access

**Problem**: Guest tries to access `/events/mehndi` directly.

**Solution**:
1. Route-level check: Server verifies `eventAccess` includes slug
2. Component-level check: Client-side hook validates access
3. Redirect: If access denied, redirect to home page
4. UI: Navigation items hidden, so guest doesn't know URLs exist

### Token Guessing

**Problem**: Attacker tries to guess valid tokens.

**Solution**:
1. Long, random tokens (25+ characters)
2. Cryptographically secure generation
3. Rate limiting on verification endpoint
4. No enumeration: Invalid tokens return same error as expired

### Device Fingerprint Spoofing

**Problem**: Attacker tries to spoof device fingerprint.

**Solution**:
1. Multiple fingerprint components (harder to spoof all)
2. Server-side validation
3. Phone/email verification still required
4. Canvas fingerprinting (browser-specific rendering)

### Session Hijacking

**Problem**: Attacker steals session/token.

**Solution**:
1. HTTP-only cookies for admin (prevents XSS)
2. Device fingerprinting ties access to device
3. Token stored in URL (not cookie) for guests
4. New device requires verification

---

## Summary

The wedding invitation website uses a comprehensive multi-layer access control system to ensure guests only see events they're invited to:

1. **Database**: `eventAccess` field stores permitted events
2. **Token System**: Unique, non-guessable tokens identify guests
3. **Device Fingerprinting**: Prevents unauthorized device access
4. **Phone/Email Verification**: Validates guest identity
5. **Server-Side Filtering**: API and routes filter by `eventAccess`
6. **Client-Side Filtering**: Components conditionally render based on access
7. **Rate Limiting**: Prevents brute force attacks
8. **Device Limits**: Restricts number of devices per guest

**Key Takeaway**: Even if a guest knows the URL structure, they cannot access events they're not invited to because:
- Server-side route protection checks `eventAccess`
- Client-side components filter content
- Navigation only shows accessible events
- Direct URL access is blocked at route level

The system is designed to be secure, user-friendly, and prevent any unauthorized access to event information.

