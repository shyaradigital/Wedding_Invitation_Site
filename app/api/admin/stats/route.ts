import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-auth'
import { ensureJsonArray, setNoCacheHeaders } from '@/lib/utils'

const EVENT_SLUGS = ['mehndi', 'wedding', 'reception'] as const

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    // Fetch all guests with necessary fields
    const guests = await prisma.guest.findMany({
      select: {
        id: true,
        eventAccess: true,
        numberOfAttendees: true,
        numberOfAttendeesPerEvent: true,
        rsvpSubmitted: true,
        rsvpStatus: true,
        menuPreference: true,
      },
    })

    // Initialize stats structure
    const stats = {
      totalInviteLinks: guests.length,
      totalAttendeesInviteBased: 0, // Total unique attendees (each guest counted once)
      inviteBased: {
        mehndi: 0,
        wedding: 0,
        reception: 0,
      },
      rsvpBased: {
        mehndi: {
          totalAttendees: 0,
          veg: 0,
          nonVeg: 0,
        },
        wedding: {
          totalAttendees: 0,
          veg: 0,
          nonVeg: 0,
        },
        reception: {
          totalAttendees: 0,
          veg: 0,
          nonVeg: 0,
        },
      },
    }

    // Process each guest
    for (const guest of guests) {
      const eventAccess = ensureJsonArray(guest.eventAccess) as string[]
      
      // Parse numberOfAttendeesPerEvent
      let numberOfAttendeesPerEvent: Record<string, number> | null = null
      if (guest.numberOfAttendeesPerEvent) {
        try {
          numberOfAttendeesPerEvent = typeof guest.numberOfAttendeesPerEvent === 'string'
            ? JSON.parse(guest.numberOfAttendeesPerEvent)
            : guest.numberOfAttendeesPerEvent
        } catch {
          numberOfAttendeesPerEvent = null
        }
      }
      
      // For invite-based stats, use numberOfAttendeesPerEvent if available, otherwise fallback to numberOfAttendees
      const defaultAttendeeCount = guest.numberOfAttendees || 1
      
      // Calculate total unique attendees (each guest counted once)
      // Use max from per-event counts if available, otherwise use default
      let totalAttendeeCount = defaultAttendeeCount
      if (numberOfAttendeesPerEvent && Object.keys(numberOfAttendeesPerEvent).length > 0) {
        totalAttendeeCount = Math.max(...Object.values(numberOfAttendeesPerEvent), defaultAttendeeCount)
      }
      stats.totalAttendeesInviteBased += totalAttendeeCount

      // Calculate invite-based stats per event (count for events they're invited to)
      for (const eventSlug of EVENT_SLUGS) {
        if (eventAccess.includes(eventSlug)) {
          // Use per-event count if available, otherwise use default
          const eventAttendeeCount = numberOfAttendeesPerEvent?.[eventSlug] || defaultAttendeeCount
          stats.inviteBased[eventSlug] += eventAttendeeCount
        }
      }

      // Calculate RSVP-based stats (only if RSVP submitted)
      if (guest.rsvpSubmitted && guest.rsvpStatus) {
        let rsvpStatus: Record<string, 'yes' | 'no' | 'pending'> = {}
        
        try {
          rsvpStatus = typeof guest.rsvpStatus === 'string'
            ? JSON.parse(guest.rsvpStatus)
            : guest.rsvpStatus
        } catch {
          // Invalid JSON, skip this guest's RSVP data
          continue
        }

        // Process each event
        for (const eventSlug of EVENT_SLUGS) {
          // Only process if guest is invited to this event and RSVP'd yes
          if (eventAccess.includes(eventSlug) && rsvpStatus[eventSlug] === 'yes') {
            const eventStats = stats.rsvpBased[eventSlug]
            
            // For Mehndi, count only the number of guests (invite count), not total attendees
            // For other events, use per-event attendee count from RSVP data
            if (eventSlug === 'mehndi') {
              // Mehndi: Count 1 per guest (invite count only)
              eventStats.totalAttendees += 1
            } else {
              // Other events: Use per-event attendee count from RSVP data
              // If numberOfAttendeesPerEvent exists and has the event, use it; otherwise default to 1
              const eventAttendeeCount = numberOfAttendeesPerEvent?.[eventSlug] || 1
              eventStats.totalAttendees += eventAttendeeCount

              // Only count menu preferences for Reception event
              // Menu preference is only collected for Reception in the RSVP form
              if (eventSlug === 'reception') {
                // Calculate menu preferences
                // Guests with "both" are counted in both categories
                if (guest.menuPreference === 'veg' || guest.menuPreference === 'both') {
                  eventStats.veg += eventAttendeeCount
                }
                if (guest.menuPreference === 'non-veg' || guest.menuPreference === 'both') {
                  eventStats.nonVeg += eventAttendeeCount
                }
              }
            }
          }
        }
      }
    }

    const response = NextResponse.json({ stats })
    return setNoCacheHeaders(response)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      const response = NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
      return setNoCacheHeaders(response)
    }

    console.error('Error fetching stats:', error)
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
    return setNoCacheHeaders(response)
  }
}

