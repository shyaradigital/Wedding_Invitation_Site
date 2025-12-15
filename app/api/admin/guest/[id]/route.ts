import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-auth'
import { generateSecureToken, ensureJsonArray, setNoCacheHeaders } from '@/lib/utils'
import { z } from 'zod'

const updateGuestSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal('')),
  eventAccess: z.enum(['all-events', 'reception-only']).optional(), // Only two types now
  maxDevicesAllowed: z.number().int().min(1).max(10).optional(),
  numberOfAttendees: z.number().int().min(1).optional(),
  regenerateToken: z.boolean().optional(),
  removeDevice: z.string().optional(),
  allowedDevices: z.string().optional(), // For clearing all devices
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()

    const { id } = params
    const body = await request.json()
    const data = updateGuestSchema.parse(body)

    const guest = await prisma.guest.findUnique({
      where: { id },
    })

    if (!guest) {
      return NextResponse.json(
        { error: 'Guest not found' },
        { status: 404 }
      )
    }

    const updateData: any = {}

    if (data.name !== undefined) updateData.name = data.name
    if (data.phone !== undefined) updateData.phone = data.phone
    if (data.email !== undefined) {
      updateData.email = data.email && data.email.trim() !== '' ? data.email.trim().toLowerCase() : null
    }
    if (data.eventAccess !== undefined) {
      // Convert eventAccess type to actual event array
      const actualEventAccess = data.eventAccess === 'all-events' 
        ? ['mehndi', 'wedding', 'reception']
        : ['reception']
      updateData.eventAccess = JSON.stringify(actualEventAccess)
    }
    if (data.maxDevicesAllowed !== undefined) updateData.maxDevicesAllowed = data.maxDevicesAllowed
    if (data.numberOfAttendees !== undefined) updateData.numberOfAttendees = data.numberOfAttendees

    if (data.regenerateToken) {
      updateData.token = generateSecureToken()
      updateData.allowedDevices = JSON.stringify([]) // Reset devices when token is regenerated
      updateData.tokenUsedFirstTime = null
    }

    if (data.removeDevice) {
      const allowedDevices = ensureJsonArray(guest.allowedDevices) as string[]
      updateData.allowedDevices = JSON.stringify(
        allowedDevices.filter((d) => d !== data.removeDevice)
      )
    }

    if (data.allowedDevices !== undefined) {
      // Allow clearing all devices by passing empty array as string
      updateData.allowedDevices = data.allowedDevices
    }

    const updatedGuest = await prisma.guest.update({
      where: { id },
      data: updateData,
    })

    let rsvpStatus = null
    if (updatedGuest.rsvpStatus) {
      try {
        rsvpStatus = typeof updatedGuest.rsvpStatus === 'string' 
          ? JSON.parse(updatedGuest.rsvpStatus) 
          : updatedGuest.rsvpStatus
      } catch {
        rsvpStatus = null
      }
    }

    const response = NextResponse.json({
      success: true,
      guest: {
        id: updatedGuest.id,
        name: updatedGuest.name,
        phone: updatedGuest.phone,
        email: updatedGuest.email,
        token: updatedGuest.token,
        eventAccess: ensureJsonArray(updatedGuest.eventAccess),
        allowedDevices: ensureJsonArray(updatedGuest.allowedDevices),
        maxDevicesAllowed: updatedGuest.maxDevicesAllowed,
        numberOfAttendees: updatedGuest.numberOfAttendees,
        rsvpSubmitted: updatedGuest.rsvpSubmitted,
        rsvpStatus,
        rsvpSubmittedAt: updatedGuest.rsvpSubmittedAt,
        preferencesSubmitted: updatedGuest.preferencesSubmitted,
        menuPreference: updatedGuest.menuPreference,
        dietaryRestrictions: updatedGuest.dietaryRestrictions,
        additionalInfo: updatedGuest.additionalInfo,
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

    console.error('Error updating guest:', error)
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
    return setNoCacheHeaders(response)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()

    const { id } = params

    await prisma.guest.delete({
      where: { id },
    })

    const response = NextResponse.json({ success: true })
    return setNoCacheHeaders(response)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      const response = NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
      return setNoCacheHeaders(response)
    }

    console.error('Error deleting guest:', error)
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
    return setNoCacheHeaders(response)
  }
}

