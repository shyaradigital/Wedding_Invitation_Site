import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/rate-limit'
import { normalizePhoneNumber, validatePhoneNumber } from '@/lib/utils'
import { z } from 'zod'

const verifyPhoneSchema = z.object({
  token: z.string().min(1),
  phone: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.ip || 'unknown'
    const rateLimitResult = rateLimit(`verify-phone-${ip}`, 5, 60000)
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { token, phone } = verifyPhoneSchema.parse(body)

    if (!validatePhoneNumber(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      )
    }

    const normalizedPhone = normalizePhoneNumber(phone)

    const guest = await prisma.guest.findUnique({
      where: { token },
    })

    if (!guest) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 404 }
      )
    }

    // First time - save phone
    if (!guest.phone) {
      await prisma.guest.update({
        where: { id: guest.id },
        data: {
          phone: normalizedPhone,
          tokenUsedFirstTime: guest.tokenUsedFirstTime || new Date(),
        },
      })

      return NextResponse.json({
        success: true,
        isFirstTime: true,
        message: 'Phone number saved successfully',
      })
    }

    // Subsequent times - verify phone matches
    if (guest.phone === normalizedPhone) {
      // If tokenUsedFirstTime is not set yet, set it now (first time accessing)
      if (!guest.tokenUsedFirstTime) {
        await prisma.guest.update({
          where: { id: guest.id },
          data: {
            tokenUsedFirstTime: new Date(),
          },
        })
      }

      return NextResponse.json({
        success: true,
        isFirstTime: !guest.tokenUsedFirstTime,
        message: 'Phone number verified',
      })
    }

    // Phone doesn't match
    return NextResponse.json(
      {
        success: false,
        error: 'Phone number does not match',
      },
      { status: 403 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error verifying phone:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

