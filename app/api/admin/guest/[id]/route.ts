import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-auth'
import { generateSecureToken, ensureJsonArray } from '@/lib/utils'
import { z } from 'zod'

const updateGuestSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional().nullable(),
  eventAccess: z.array(z.enum(['mehndi', 'wedding', 'reception'])).optional(),
  maxDevicesAllowed: z.number().int().min(1).max(10).optional(),
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
    if (data.eventAccess !== undefined) updateData.eventAccess = JSON.stringify(data.eventAccess)
    if (data.maxDevicesAllowed !== undefined) updateData.maxDevicesAllowed = data.maxDevicesAllowed

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

    return NextResponse.json({
      success: true,
      guest: {
        id: updatedGuest.id,
        name: updatedGuest.name,
        phone: updatedGuest.phone,
        token: updatedGuest.token,
        eventAccess: ensureJsonArray(updatedGuest.eventAccess),
        allowedDevices: ensureJsonArray(updatedGuest.allowedDevices),
        maxDevicesAllowed: updatedGuest.maxDevicesAllowed,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.error('Error updating guest:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
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

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.error('Error deleting guest:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

