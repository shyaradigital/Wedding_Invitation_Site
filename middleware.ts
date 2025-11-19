import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Allow public API routes
  if (request.nextUrl.pathname.startsWith('/api/verify-') ||
      request.nextUrl.pathname.startsWith('/api/guest/') ||
      request.nextUrl.pathname.startsWith('/api/events/')) {
    return NextResponse.next()
  }

  // Admin routes are protected by API route authentication
  // No need for middleware-level protection here

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}

