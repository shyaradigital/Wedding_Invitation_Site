import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const preferencesSchema = z.object({
  token: z.string().min(1),
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

    // Update guest preferences
    const updatedGuest = await prisma.guest.update({
      where: { id: guest.id },
      data: {
        menuPreference: data.menuPreference || null,
        dietaryRestrictions: data.dietaryRestrictions || null,
        additionalInfo: data.additionalInfo || null,
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
        menuPreference: true,
        dietaryRestrictions: true,
        additionalInfo: true,
      },
    })

    if (!guest) {
      return NextResponse.json(
        { error: 'Invalid invitation token' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      preferencesSubmitted: guest.preferencesSubmitted,
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

