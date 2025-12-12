import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ success: true })
  // Delete the cookie using NextResponse
  response.cookies.delete('admin_token')
  // Also set it to expire immediately
  response.cookies.set('admin_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
  return response
}

