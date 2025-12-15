import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-auth'
import { setNoCacheHeaders } from '@/lib/utils'
import { z } from 'zod'

const updateEventSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  date: z.string().datetime().optional().nullable(),
  time: z.string().optional().nullable(),
  venue: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  dressCode: z.string().optional().nullable(),
  mapEmbedUrl: z.string().optional().nullable(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()

    const { id } = params
    const body = await request.json()
    const data = updateEventSchema.parse(body)

    const updateData: any = {}
    if (data.title !== undefined) updateData.title = data.title
    if (data.description !== undefined) updateData.description = data.description
    if (data.date !== undefined)
      updateData.date = data.date ? new Date(data.date) : null
    if (data.time !== undefined) updateData.time = data.time
    if (data.venue !== undefined) updateData.venue = data.venue
    if (data.address !== undefined) updateData.address = data.address
    if (data.dressCode !== undefined) updateData.dressCode = data.dressCode
    if (data.mapEmbedUrl !== undefined) updateData.mapEmbedUrl = data.mapEmbedUrl

    const event = await prisma.event.update({
      where: { id },
      data: updateData,
    })

    const response = NextResponse.json({ success: true, event })
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

    console.error('Error updating event:', error)
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
    return setNoCacheHeaders(response)
  }
}

