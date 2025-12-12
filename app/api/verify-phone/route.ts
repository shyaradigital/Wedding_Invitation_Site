import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/rate-limit'
import { normalizePhoneNumber, validatePhoneNumber, validateEmail } from '@/lib/utils'
import { z } from 'zod'

const verifyPhoneOrEmailSchema = z.object({
  token: z.string().min(1),
  phoneOrEmail: z.string().min(1),
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
    const { token, phoneOrEmail } = verifyPhoneOrEmailSchema.parse(body)

    // Determine if input is phone or email
    const isEmail = validateEmail(phoneOrEmail)
    const isPhone = validatePhoneNumber(phoneOrEmail)

    if (!isEmail && !isPhone) {
      return NextResponse.json(
        { error: 'Invalid phone number or email format' },
        { status: 400 }
      )
    }

    const guest = await prisma.guest.findUnique({
      where: { token },
    })

    if (!guest) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 404 }
      )
    }

    // Normalize the input
    const normalizedInput = isPhone ? normalizePhoneNumber(phoneOrEmail) : phoneOrEmail.trim().toLowerCase()

    // Check if this is a phone verification
    if (isPhone) {
      // First time - save phone
      if (!guest.phone) {
        await prisma.guest.update({
          where: { id: guest.id },
          data: {
            phone: normalizedInput,
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
      const normalizedGuestPhone = guest.phone ? normalizePhoneNumber(guest.phone) : null
      if (normalizedGuestPhone === normalizedInput) {
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
    }

    // Email verification
    if (isEmail) {
      // First time - save email
      if (!guest.email) {
        await prisma.guest.update({
          where: { id: guest.id },
          data: {
            email: normalizedInput,
            tokenUsedFirstTime: guest.tokenUsedFirstTime || new Date(),
          },
        })

        return NextResponse.json({
          success: true,
          isFirstTime: true,
          message: 'Email saved successfully',
        })
      }

      // Subsequent times - verify email matches
      const normalizedGuestEmail = guest.email ? guest.email.trim().toLowerCase() : null
      if (normalizedGuestEmail === normalizedInput) {
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
          message: 'Email verified',
        })
      }

      // Email doesn't match
      return NextResponse.json(
        {
          success: false,
          error: 'Email does not match',
        },
        { status: 403 }
      )
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error verifying phone or email:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

