import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-auth'
import { setNoCacheHeaders } from '@/lib/utils'
import { z } from 'zod'

const resetRsvpSchema = z.object({
  guestIds: z.array(z.string()).min(1),
})

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()
    const data = resetRsvpSchema.parse(body)

    // Reset RSVP for all specified guests
    const result = await prisma.guest.updateMany({
      where: {
        id: {
          in: data.guestIds,
        },
      },
      data: {
        preferencesSubmitted: false,
        rsvpSubmitted: false,
        rsvpStatus: null,
        numberOfAttendeesPerEvent: null,
        menuPreference: null,
        dietaryRestrictions: null,
        additionalInfo: null,
        rsvpSubmittedAt: null,
        numberOfAttendees: 1, // Reset to default
      },
    })

    const response = NextResponse.json({
      success: true,
      message: `RSVP reset successfully for ${result.count} guest(s)`,
      resetCount: result.count,
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

    console.error('Error resetting RSVP:', error)
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
    return setNoCacheHeaders(response)
  }
}

