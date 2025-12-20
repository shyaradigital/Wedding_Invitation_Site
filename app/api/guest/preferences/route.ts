import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { ensureJsonArray, setNoCacheHeaders } from '@/lib/utils'

const preferencesSchema = z.object({
  token: z.string().min(1),
  rsvpStatus: z.record(z.enum(['yes', 'no'])).optional(),
  menuPreference: z.enum(['veg', 'non-veg', 'both']).optional(),
  numberOfAttendeesPerEvent: z.record(z.number().int().min(1)).optional(),
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
      const response = NextResponse.json(
        { error: 'Invalid invitation token' },
        { status: 404 }
      )
      return setNoCacheHeaders(response)
    }

    // Check if preferences already submitted
    if (guest.preferencesSubmitted) {
      const response = NextResponse.json(
        { error: 'Preferences have already been submitted for this invitation' },
        { status: 400 }
      )
      return setNoCacheHeaders(response)
    }

    // Get guest's accessible events
    const eventAccess = ensureJsonArray(guest.eventAccess) as string[]
    
    // Validate RSVP status - only allow events the guest has access to
    let rsvpStatusJson: string | null = null
    let validRsvpStatus: Record<string, 'yes' | 'no'> = {}
    
    if (data.rsvpStatus) {
      // Only include RSVP status for events the guest is invited to
      for (const [eventSlug, status] of Object.entries(data.rsvpStatus)) {
        if (eventAccess.includes(eventSlug) && (status === 'yes' || status === 'no')) {
          validRsvpStatus[eventSlug] = status
        }
      }
      
      // Ensure RSVP status is provided for all accessible events
      if (Object.keys(validRsvpStatus).length !== eventAccess.length) {
        const response = NextResponse.json(
          { error: 'RSVP status is required for all accessible events' },
          { status: 400 }
        )
        return setNoCacheHeaders(response)
      }
      
      rsvpStatusJson = JSON.stringify(validRsvpStatus)
    } else {
      const response = NextResponse.json(
        { error: 'RSVP status is required' },
        { status: 400 }
      )
      return setNoCacheHeaders(response)
    }

    // Validate and process numberOfAttendeesPerEvent
    let numberOfAttendeesPerEventJson: string | null = null
    let calculatedNumberOfAttendees = guest.numberOfAttendees || 1 // Default fallback
    
    if (data.numberOfAttendeesPerEvent) {
      const validAttendeesPerEvent: Record<string, number> = {}
      
      // Only include attendee counts for events the guest has access to and where they RSVP'd "yes"
      for (const [eventSlug, count] of Object.entries(data.numberOfAttendeesPerEvent)) {
        if (eventAccess.includes(eventSlug) && 
            validRsvpStatus[eventSlug] === 'yes' && 
            typeof count === 'number' && 
            count >= 1) {
          validAttendeesPerEvent[eventSlug] = count
        }
      }
      
      // Ensure attendee counts are provided for all events where guest is attending (excluding Mehndi)
      const attendingEvents = Object.entries(validRsvpStatus)
        .filter(([_, status]) => status === 'yes')
        .map(([eventSlug]) => eventSlug)
      
      for (const eventSlug of attendingEvents) {
        // Mehndi doesn't require attendee count
        if (eventSlug !== 'mehndi' && !validAttendeesPerEvent[eventSlug]) {
          const response = NextResponse.json(
            { error: `Number of guests attending is required for ${eventSlug}` },
            { status: 400 }
          )
          return setNoCacheHeaders(response)
        }
      }
      
      numberOfAttendeesPerEventJson = JSON.stringify(validAttendeesPerEvent)
      
      // Auto-calculate numberOfAttendees as the maximum count across all events
      // This provides backward compatibility
      calculatedNumberOfAttendees = Math.max(...Object.values(validAttendeesPerEvent), 1)
    } else {
      // If no per-event counts provided but guest is attending events, use default of 1
      const attendingEvents = Object.entries(JSON.parse(rsvpStatusJson))
        .filter(([_, status]) => status === 'yes')
        .map(([eventSlug]) => eventSlug)
      
      if (attendingEvents.length > 0) {
        const defaultAttendeesPerEvent: Record<string, number> = {}
        for (const eventSlug of attendingEvents) {
          defaultAttendeesPerEvent[eventSlug] = 1
        }
        numberOfAttendeesPerEventJson = JSON.stringify(defaultAttendeesPerEvent)
        calculatedNumberOfAttendees = 1
      }
    }

    // Update guest preferences and RSVP
    const updatedGuest = await prisma.guest.update({
      where: { id: guest.id },
      data: {
        rsvpStatus: rsvpStatusJson,
        numberOfAttendeesPerEvent: numberOfAttendeesPerEventJson,
        numberOfAttendees: calculatedNumberOfAttendees, // Auto-calculated for backward compatibility
        rsvpSubmitted: true,
        rsvpSubmittedAt: new Date(),
        menuPreference: data.menuPreference || null,
        dietaryRestrictions: null,
        additionalInfo: null,
        preferencesSubmitted: true,
      },
    })

    const response = NextResponse.json({
      success: true,
      message: 'Preferences saved successfully',
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

    console.error('Error saving preferences:', error)
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
    return setNoCacheHeaders(response)
  }
}

// GET endpoint to check if preferences have been submitted
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      const response = NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
      return setNoCacheHeaders(response)
    }

    const guest = await prisma.guest.findUnique({
      where: { token },
      select: {
        preferencesSubmitted: true,
        rsvpSubmitted: true,
        rsvpStatus: true,
        numberOfAttendeesPerEvent: true,
        rsvpSubmittedAt: true,
        menuPreference: true,
        dietaryRestrictions: true,
        additionalInfo: true,
        eventAccess: true,
      },
    })

    if (!guest) {
      const response = NextResponse.json(
        { error: 'Invalid invitation token' },
        { status: 404 }
      )
      return setNoCacheHeaders(response)
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

    let numberOfAttendeesPerEvent = null
    if (guest.numberOfAttendeesPerEvent) {
      try {
        numberOfAttendeesPerEvent = typeof guest.numberOfAttendeesPerEvent === 'string'
          ? JSON.parse(guest.numberOfAttendeesPerEvent)
          : guest.numberOfAttendeesPerEvent
      } catch {
        numberOfAttendeesPerEvent = null
      }
    }

    const response = NextResponse.json({
      preferencesSubmitted: guest.preferencesSubmitted,
      rsvpSubmitted: guest.rsvpSubmitted,
      rsvpStatus: rsvpStatus,
      numberOfAttendeesPerEvent: numberOfAttendeesPerEvent,
      rsvpSubmittedAt: guest.rsvpSubmittedAt,
      preferences: guest.preferencesSubmitted
        ? {
            menuPreference: guest.menuPreference,
            dietaryRestrictions: guest.dietaryRestrictions,
            additionalInfo: guest.additionalInfo,
          }
        : null,
    })
    return setNoCacheHeaders(response)
  } catch (error) {
    console.error('Error fetching preferences:', error)
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
    return setNoCacheHeaders(response)
  }
}

