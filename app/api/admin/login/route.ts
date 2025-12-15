import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, generateAdminToken } from '@/lib/auth'
import { rateLimit } from '@/lib/rate-limit'
import { setNoCacheHeaders } from '@/lib/utils'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().min(1), // Accept email or username
  password: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    // Test database connection first
    try {
      await prisma.$connect()
    } catch (dbError) {
      console.error('Database connection error:', dbError)
      const response = NextResponse.json(
        { 
          error: 'Database connection failed',
          details: process.env.NODE_ENV === 'development' 
            ? (dbError instanceof Error ? dbError.message : String(dbError))
            : undefined
        },
        { status: 500 }
      )
      return setNoCacheHeaders(response)
    }

    const ip = request.headers.get('x-forwarded-for') || request.ip || 'unknown'
    const rateLimitResult = rateLimit(`admin-login-${ip}`, 5, 60000)
    
    if (!rateLimitResult.allowed) {
      const response = NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      )
      return setNoCacheHeaders(response)
    }

    const body = await request.json()
    const { email, password } = loginSchema.parse(body)

    const admin = await prisma.admin.findUnique({
      where: { email },
    })

    if (!admin) {
      console.error(`Admin login failed: User not found for email: ${email}`)
      // Log available admins for debugging (only in development)
      if (process.env.NODE_ENV === 'development') {
        const allAdmins = await prisma.admin.findMany({
          select: { email: true },
        })
        console.log('Available admin emails:', allAdmins.map(a => a.email))
      }
      const response = NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
      return setNoCacheHeaders(response)
    }

    const isValid = await verifyPassword(password, admin.password)

    if (!isValid) {
      console.error(`Admin login failed: Invalid password for email: ${email}`)
      const response = NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
      return setNoCacheHeaders(response)
    }

    const token = generateAdminToken(admin.id)

    // Create response
    const response = NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
      },
    })

    // Set HTTP-only cookie using NextResponse
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return setNoCacheHeaders(response)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const response = NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
      return setNoCacheHeaders(response)
    }

    console.error('Error during admin login:', error)
    
    // Provide more detailed error information in development
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    const response = NextResponse.json(
      { 
        error: 'Internal server error',
        ...(isDevelopment && { details: errorMessage, stack: error instanceof Error ? error.stack : undefined })
      },
      { status: 500 }
    )
    return setNoCacheHeaders(response)
  }
}

