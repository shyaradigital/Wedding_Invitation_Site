import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/rate-limit'
import { ensureJsonArray } from '@/lib/utils'
import { getAdminFromRequest } from '@/lib/admin-auth'
import { z } from 'zod'

const verifyTokenSchema = z.object({
  token: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.ip || 'unknown'
    const rateLimitResult = rateLimit(`verify-token-${ip}`, 20, 60000)
    
    if (!rateLimitResult.allowed) {
      const response = NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
      response.headers.set('Cache-Control', 'no-store, must-revalidate, max-age=0')
      return response
    }

    const body = await request.json()
    const { token } = verifyTokenSchema.parse(body)

    // Handle admin-preview token for admin users
    if (token === 'admin-preview') {
      const admin = await getAdminFromRequest()
      if (admin) {
        // Return virtual guest with all events enabled
        const response = NextResponse.json({
          guest: {
            id: 'admin-preview',
            name: 'Admin Preview',
            phone: null,
            email: null,
            eventAccess: ['mehndi', 'wedding', 'reception'],
            allowedDevices: [],
            hasPhone: false,
            hasEmail: false,
            tokenUsedFirstTime: null,
            maxDevicesAllowed: 999,
          },
        })
        response.headers.set('Cache-Control', 'no-store, must-revalidate, max-age=0')
        return response
      }
    }

    const guest = await prisma.guest.findUnique({
      where: { token },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        eventAccess: true,
        allowedDevices: true,
        tokenUsedFirstTime: true,
        tokenExpiresAfterFirstUse: true,
        maxDevicesAllowed: true,
      },
    })

    if (!guest) {
      const response = NextResponse.json(
        { error: 'Invalid token' },
        { status: 404 }
      )
      response.headers.set('Cache-Control', 'no-store, must-revalidate, max-age=0')
      return response
    }

    // Check if token has expired
    if (guest.tokenExpiresAfterFirstUse && guest.tokenUsedFirstTime) {
      const expiryTime = new Date(guest.tokenUsedFirstTime)
      expiryTime.setDate(expiryTime.getDate() + 30) // 30 days after first use
      
      if (new Date() > expiryTime) {
        const response = NextResponse.json(
          { error: 'Token has expired' },
          { status: 410 }
        )
        response.headers.set('Cache-Control', 'no-store, must-revalidate, max-age=0')
        return response
      }
    }

    const response = NextResponse.json({
      guest: {
        id: guest.id,
        name: guest.name,
        phone: guest.phone,
        email: guest.email,
        eventAccess: ensureJsonArray(guest.eventAccess),
        allowedDevices: ensureJsonArray(guest.allowedDevices),
        hasPhone: !!guest.phone,
        hasEmail: !!guest.email,
        tokenUsedFirstTime: guest.tokenUsedFirstTime,
        maxDevicesAllowed: guest.maxDevicesAllowed,
      },
    })
    response.headers.set('Cache-Control', 'no-store, must-revalidate, max-age=0')
    return response
  } catch (error) {
    if (error instanceof z.ZodError) {
      const response = NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
      response.headers.set('Cache-Control', 'no-store, must-revalidate, max-age=0')
      return response
    }

    console.error('Error verifying token:', error)
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
    response.headers.set('Cache-Control', 'no-store, must-revalidate, max-age=0')
    return response
  }
}

