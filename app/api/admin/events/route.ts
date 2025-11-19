import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-auth'
import { z } from 'zod'

const createEventSchema = z.object({
  slug: z.enum(['mehndi', 'wedding', 'reception']),
  title: z.string().min(1),
  description: z.string().optional(),
  date: z.string().datetime().optional().nullable(),
  time: z.string().optional().nullable(),
  venue: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  dressCode: z.string().optional().nullable(),
  mapEmbedUrl: z.string().optional().nullable(),
})

export async function GET() {
  try {
    await requireAdmin()

    const events = await prisma.event.findMany({
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({ events })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()
    const data = createEventSchema.parse(body)

    const event = await prisma.event.create({
      data: {
        slug: data.slug,
        title: data.title,
        description: data.description || null,
        date: data.date ? new Date(data.date) : null,
        time: data.time || null,
        venue: data.venue || null,
        address: data.address || null,
        dressCode: data.dressCode || null,
        mapEmbedUrl: data.mapEmbedUrl || null,
      },
    })

    return NextResponse.json({ success: true, event })
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

    console.error('Error creating event:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
