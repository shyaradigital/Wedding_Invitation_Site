import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/rate-limit'
import { normalizePhoneNumber, validatePhoneNumber, validateEmail, ensureJsonArray, setNoCacheHeaders } from '@/lib/utils'
import { z } from 'zod'

const saveDeviceSchema = z.object({
  token: z.string().min(1),
  phoneOrEmail: z.string().min(1),
  fingerprint: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.ip || 'unknown'
    const rateLimitResult = rateLimit(`save-device-${ip}`, 10, 60000)
    
    if (!rateLimitResult.allowed) {
      const response = NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
      return setNoCacheHeaders(response)
    }

    const body = await request.json()
    const { token, phoneOrEmail, fingerprint } = saveDeviceSchema.parse(body)

    // Determine if input is phone or email
    const isEmail = validateEmail(phoneOrEmail)
    const isPhone = validatePhoneNumber(phoneOrEmail)

    if (!isEmail && !isPhone) {
      const response = NextResponse.json(
        { error: 'Invalid phone number or email format' },
        { status: 400 }
      )
      return setNoCacheHeaders(response)
    }

    const guest = await prisma.guest.findUnique({
      where: { token },
    })

    if (!guest) {
      const response = NextResponse.json(
        { error: 'Invalid token' },
        { status: 404 }
      )
      return setNoCacheHeaders(response)
    }

    // Verify phone or email matches
    if (isPhone) {
      const normalizedPhone = normalizePhoneNumber(phoneOrEmail)
      const normalizedGuestPhone = guest.phone ? normalizePhoneNumber(guest.phone) : null
      if (normalizedGuestPhone !== normalizedPhone) {
        const response = NextResponse.json(
          { error: 'Phone number does not match' },
          { status: 403 }
        )
        return setNoCacheHeaders(response)
      }
    } else if (isEmail) {
      const normalizedEmail = phoneOrEmail.trim().toLowerCase()
      const normalizedGuestEmail = guest.email ? guest.email.trim().toLowerCase() : null
      if (normalizedGuestEmail !== normalizedEmail) {
        const response = NextResponse.json(
          { error: 'Email does not match' },
          { status: 403 }
        )
        return setNoCacheHeaders(response)
      }
    }

    // Get current allowed devices
    const allowedDevices = ensureJsonArray(guest.allowedDevices) as string[]

    // Check if device already exists
    if (allowedDevices.includes(fingerprint)) {
      const response = NextResponse.json({
        success: true,
        message: 'Device already registered',
        isNewDevice: false,
      })
      return setNoCacheHeaders(response)
    }

    // Check device limit
    const maxDevices = guest.maxDevicesAllowed || 1
    if (allowedDevices.length >= maxDevices) {
      const response = NextResponse.json(
        {
          error: 'Device limit reached',
          message: 'Please open from your original device.',
        },
        { status: 403 }
      )
      return setNoCacheHeaders(response)
    }

    // Add new device
    const updatedDevices = [...allowedDevices, fingerprint]

    // Set tokenUsedFirstTime if not already set (first time accessing)
    const updateData: any = {
      allowedDevices: JSON.stringify(updatedDevices),
    }
    if (!guest.tokenUsedFirstTime) {
      updateData.tokenUsedFirstTime = new Date()
    }

    await prisma.guest.update({
      where: { id: guest.id },
      data: updateData,
    })

    const response = NextResponse.json({
      success: true,
      message: 'Device registered successfully',
      isNewDevice: true,
      deviceCount: updatedDevices.length,
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

    console.error('Error saving device:', error)
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
    return setNoCacheHeaders(response)
  }
}

