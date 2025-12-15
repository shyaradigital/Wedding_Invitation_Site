import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { setNoCacheHeaders } from '@/lib/utils'

export async function GET() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`
    
    // Check if tables exist
    const adminCount = await prisma.admin.count()
    const guestCount = await prisma.guest.count()
    const eventCount = await prisma.event.count()
    
    // Get admin emails (for debugging - only show in development)
    const admins = process.env.NODE_ENV === 'development'
      ? await prisma.admin.findMany({ select: { email: true } })
      : []
    
    const response = NextResponse.json({
      status: 'healthy',
      database: 'connected',
      tables: {
        admin: adminCount,
        guest: guestCount,
        event: eventCount,
      },
      env: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        hasJwtSecret: !!process.env.JWT_SECRET,
        nodeEnv: process.env.NODE_ENV,
        adminEmail: process.env.ADMIN_EMAIL || 'admin (default)',
        hasAdminPassword: !!process.env.ADMIN_PASSWORD,
      },
      ...(process.env.NODE_ENV === 'development' && {
        adminEmails: admins.map(a => a.email),
      }),
    })
    return setNoCacheHeaders(response)
  } catch (error) {
    console.error('Health check failed:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    
    const response = NextResponse.json(
      {
        status: 'unhealthy',
        error: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? errorStack : undefined,
        env: {
          hasDatabaseUrl: !!process.env.DATABASE_URL,
          hasJwtSecret: !!process.env.JWT_SECRET,
          nodeEnv: process.env.NODE_ENV,
        },
      },
      { status: 500 }
    )
    return setNoCacheHeaders(response)
  }
}

