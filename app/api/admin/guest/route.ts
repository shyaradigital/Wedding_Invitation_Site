import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-auth'
import { generateSecureToken, ensureJsonArray, setNoCacheHeaders } from '@/lib/utils'
import { z } from 'zod'

const createGuestSchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  eventAccess: z.enum(['all-events', 'reception-only']), // Only two types now
  maxDevicesAllowed: z.number().int().min(1).max(10).optional().default(1),
  numberOfAttendees: z.number().int().min(1).optional().default(1),
})

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()
    const data = createGuestSchema.parse(body)

    const token = generateSecureToken()

    // Convert eventAccess type to actual event array
    const actualEventAccess = data.eventAccess === 'all-events' 
      ? ['mehndi', 'wedding', 'reception']
      : ['reception']

    const guest = await prisma.guest.create({
      data: {
        name: data.name,
        phone: data.phone || null,
        email: data.email && data.email.trim() !== '' ? data.email.trim().toLowerCase() : null,
        token,
        eventAccess: JSON.stringify(actualEventAccess),
        maxDevicesAllowed: data.maxDevicesAllowed,
        numberOfAttendees: data.numberOfAttendees,
        allowedDevices: JSON.stringify([]),
      },
    })

    const response = NextResponse.json({
      success: true,
      guest: {
        id: guest.id,
        name: guest.name,
        token: guest.token,
        eventAccess: ensureJsonArray(guest.eventAccess),
      },
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

    if (error instanceof Error && error.message === 'Unauthorized') {
      const response = NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
      return setNoCacheHeaders(response)
    }

    console.error('Error creating guest:', error)
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
    return setNoCacheHeaders(response)
  }
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const guests = await prisma.guest.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        token: true,
        eventAccess: true,
        allowedDevices: true,
        tokenUsedFirstTime: true,
        maxDevicesAllowed: true,
        numberOfAttendees: true,
        rsvpSubmitted: true,
        rsvpStatus: true,
        rsvpSubmittedAt: true,
        preferencesSubmitted: true,
        menuPreference: true,
        dietaryRestrictions: true,
        additionalInfo: true,
        createdAt: true,
      },
    })

    const response = NextResponse.json({
      guests: guests.map((guest) => {
        let rsvpStatus = null
        if (guest.rsvpStatus) {
          try {
            rsvpStatus = typeof guest.rsvpStatus === 'string' 
              ? JSON.parse(guest.rsvpStatus) 
              : guest.rsvpStatus
          } catch {
            rsvpStatus = null
          }
        }

        return {
          ...guest,
          eventAccess: ensureJsonArray(guest.eventAccess),
          allowedDevices: ensureJsonArray(guest.allowedDevices),
          rsvpStatus,
        }
      }),
    })
    return setNoCacheHeaders(response)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      const response = NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
      return setNoCacheHeaders(response)
    }

    console.error('Error fetching guests:', error)
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
    return setNoCacheHeaders(response)
  }
}

