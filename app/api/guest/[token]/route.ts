import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ensureJsonArray } from '@/lib/utils'

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params

    const guest = await prisma.guest.findUnique({
      where: { token },
      select: {
        id: true,
        name: true,
        phone: true,
        eventAccess: true,
        allowedDevices: true,
        tokenUsedFirstTime: true,
        tokenExpiresAfterFirstUse: true,
        maxDevicesAllowed: true,
      },
    })

    if (!guest) {
      return NextResponse.json(
        { error: 'Guest not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      guest: {
        ...guest,
        eventAccess: ensureJsonArray(guest.eventAccess),
        allowedDevices: ensureJsonArray(guest.allowedDevices),
      },
    })
  } catch (error) {
    console.error('Error fetching guest:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

