import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/rate-limit'
import { ensureJsonArray } from '@/lib/utils'
import { z } from 'zod'

const verifyTokenSchema = z.object({
  token: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.ip || 'unknown'
    const rateLimitResult = rateLimit(`verify-token-${ip}`, 20, 60000)
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { token } = verifyTokenSchema.parse(body)

    const guest = await prisma.guest.findUnique({
      where: { token },
      select: {
        id: true,
        name: true,
        phone: true,
        eventAccess: true,
        allowedDevices: true,
        tokenUsedFirstTime: true,
        tokenExpiresAfterFirstUse: true,
        maxDevicesAllowed: true,
      },
    })

    if (!guest) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 404 }
      )
    }

    // Check if token has expired
    if (guest.tokenExpiresAfterFirstUse && guest.tokenUsedFirstTime) {
      const expiryTime = new Date(guest.tokenUsedFirstTime)
      expiryTime.setDate(expiryTime.getDate() + 30) // 30 days after first use
      
      if (new Date() > expiryTime) {
        return NextResponse.json(
          { error: 'Token has expired' },
          { status: 410 }
        )
      }
    }

    return NextResponse.json({
      guest: {
        id: guest.id,
        name: guest.name,
        phone: guest.phone,
        eventAccess: ensureJsonArray(guest.eventAccess),
        allowedDevices: ensureJsonArray(guest.allowedDevices),
        hasPhone: !!guest.phone,
        tokenUsedFirstTime: guest.tokenUsedFirstTime,
        maxDevicesAllowed: guest.maxDevicesAllowed,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error verifying token:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

