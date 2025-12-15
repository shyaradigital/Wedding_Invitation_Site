import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Add no-cache headers for all pages (except static assets)
  if (!request.nextUrl.pathname.startsWith('/_next/')) {
    response.headers.set('Cache-Control', 'no-store, must-revalidate, max-age=0')
  }
  
  // Allow public API routes
  if (request.nextUrl.pathname.startsWith('/api/verify-') ||
      request.nextUrl.pathname.startsWith('/api/guest/') ||
      request.nextUrl.pathname.startsWith('/api/events/')) {
    return response
  }

  // Admin routes are protected by API route authentication
  // No need for middleware-level protection here

  return response
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

