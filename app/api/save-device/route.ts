import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/rate-limit'
import { normalizePhoneNumber, validatePhoneNumber, ensureJsonArray } from '@/lib/utils'
import { z } from 'zod'

const saveDeviceSchema = z.object({
  token: z.string().min(1),
  phone: z.string().min(1),
  fingerprint: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.ip || 'unknown'
    const rateLimitResult = rateLimit(`save-device-${ip}`, 10, 60000)
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { token, phone, fingerprint } = saveDeviceSchema.parse(body)

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

    // Verify phone matches
    if (guest.phone !== normalizedPhone) {
      return NextResponse.json(
        { error: 'Phone number does not match' },
        { status: 403 }
      )
    }

    // Get current allowed devices
    const allowedDevices = ensureJsonArray(guest.allowedDevices) as string[]

    // Check if device already exists
    if (allowedDevices.includes(fingerprint)) {
      return NextResponse.json({
        success: true,
        message: 'Device already registered',
        isNewDevice: false,
      })
    }

    // Check device limit
    const maxDevices = guest.maxDevicesAllowed || 1
    if (allowedDevices.length >= maxDevices) {
      return NextResponse.json(
        {
          error: 'Device limit reached',
          message: 'Please open from your original device.',
        },
        { status: 403 }
      )
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

    return NextResponse.json({
      success: true,
      message: 'Device registered successfully',
      isNewDevice: true,
      deviceCount: updatedDevices.length,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error saving device:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

