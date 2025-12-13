import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    const event = await prisma.event.findUnique({
      where: { slug },
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    const response = NextResponse.json({ event })
    response.headers.set('Cache-Control', 'no-store, must-revalidate, max-age=0')
    return response
  } catch (error) {
    console.error('Error fetching event:', error)
    const errorResponse = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
    errorResponse.headers.set('Cache-Control', 'no-store, must-revalidate, max-age=0')
    return errorResponse
  }
}

