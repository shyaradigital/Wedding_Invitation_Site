import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-auth'
import { ensureJsonArray } from '@/lib/utils'

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
      const numberOfAttendees = guest.numberOfAttendees || 0

      // Calculate total unique attendees (each guest counted once)
      stats.totalAttendeesInviteBased += numberOfAttendees

      // Calculate invite-based stats per event (count for events they're invited to)
      for (const eventSlug of EVENT_SLUGS) {
        if (eventAccess.includes(eventSlug)) {
          stats.inviteBased[eventSlug] += numberOfAttendees
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
            eventStats.totalAttendees += numberOfAttendees

            // Calculate menu preferences
            // Guests with "both" are counted in both categories
            if (guest.menuPreference === 'veg' || guest.menuPreference === 'both') {
              eventStats.veg += numberOfAttendees
            }
            if (guest.menuPreference === 'non-veg' || guest.menuPreference === 'both') {
              eventStats.nonVeg += numberOfAttendees
            }
          }
        }
      }
    }

    return NextResponse.json({ stats })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

