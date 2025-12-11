import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { ensureJsonArray } from '@/lib/utils'

const preferencesSchema = z.object({
  token: z.string().min(1),
  rsvpStatus: z.record(z.enum(['yes', 'no', 'pending'])).optional(),
  menuPreference: z.enum(['veg', 'non-veg', 'both']).optional(),
  dietaryRestrictions: z.string().optional(),
  additionalInfo: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = preferencesSchema.parse(body)

    // Find guest by token
    const guest = await prisma.guest.findUnique({
      where: { token: data.token },
    })

    if (!guest) {
      return NextResponse.json(
        { error: 'Invalid invitation token' },
        { status: 404 }
      )
    }

    // Check if preferences already submitted
    if (guest.preferencesSubmitted) {
      return NextResponse.json(
        { error: 'Preferences have already been submitted for this invitation' },
        { status: 400 }
      )
    }

    // Get guest's accessible events
    const eventAccess = ensureJsonArray(guest.eventAccess) as string[]
    
    // Validate RSVP status - only allow events the guest has access to
    let rsvpStatusJson: string | null = null
    if (data.rsvpStatus) {
      const validRsvpStatus: Record<string, 'yes' | 'no' | 'pending'> = {}
      
      // Only include RSVP status for events the guest is invited to
      for (const [eventSlug, status] of Object.entries(data.rsvpStatus)) {
        if (eventAccess.includes(eventSlug)) {
          validRsvpStatus[eventSlug] = status
        }
      }
      
      // Ensure RSVP status is provided for all accessible events
      if (Object.keys(validRsvpStatus).length !== eventAccess.length) {
        return NextResponse.json(
          { error: 'RSVP status is required for all accessible events' },
          { status: 400 }
        )
      }
      
      rsvpStatusJson = JSON.stringify(validRsvpStatus)
    } else {
      return NextResponse.json(
        { error: 'RSVP status is required' },
        { status: 400 }
      )
    }

    // Update guest preferences and RSVP
    const updatedGuest = await prisma.guest.update({
      where: { id: guest.id },
      data: {
        rsvpStatus: rsvpStatusJson,
        rsvpSubmitted: true,
        rsvpSubmittedAt: new Date(),
        menuPreference: data.menuPreference || null,
        dietaryRestrictions: null,
        additionalInfo: null,
        preferencesSubmitted: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Preferences saved successfully',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error saving preferences:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to check if preferences have been submitted
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    const guest = await prisma.guest.findUnique({
      where: { token },
      select: {
        preferencesSubmitted: true,
        rsvpSubmitted: true,
        rsvpStatus: true,
        rsvpSubmittedAt: true,
        menuPreference: true,
        dietaryRestrictions: true,
        additionalInfo: true,
        eventAccess: true,
      },
    })

    if (!guest) {
      return NextResponse.json(
        { error: 'Invalid invitation token' },
        { status: 404 }
      )
    }

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

    return NextResponse.json({
      preferencesSubmitted: guest.preferencesSubmitted,
      rsvpSubmitted: guest.rsvpSubmitted,
      rsvpStatus: rsvpStatus,
      rsvpSubmittedAt: guest.rsvpSubmittedAt,
      preferences: guest.preferencesSubmitted
        ? {
            menuPreference: guest.menuPreference,
            dietaryRestrictions: guest.dietaryRestrictions,
            additionalInfo: guest.additionalInfo,
          }
        : null,
    })
  } catch (error) {
    console.error('Error fetching preferences:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

