import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, getAdminFromRequest } from '@/lib/admin-auth'
import { setNoCacheHeaders } from '@/lib/utils'
import { z } from 'zod'

const updateAdminSchema = z.object({
  email: z.string().email('Invalid email format').optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentAdmin = await requireAdmin()
    const { id } = params

    const body = await request.json()
    const data = updateAdminSchema.parse(body)

    // Check if admin exists
    const admin = await prisma.admin.findUnique({
      where: { id },
    })

    if (!admin) {
      return NextResponse.json(
        { error: 'Admin not found' },
        { status: 404 }
      )
    }

    // If updating email, check if it's already taken
    if (data.email) {
      const existingAdmin = await prisma.admin.findUnique({
        where: { email: data.email.toLowerCase().trim() },
      })

      if (existingAdmin && existingAdmin.id !== id) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 400 }
        )
      }
    }

    // Update admin
    const updatedAdmin = await prisma.admin.update({
      where: { id },
      data: {
        ...(data.email && { email: data.email.toLowerCase().trim() }),
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    })

    const response = NextResponse.json({
      success: true,
      admin: updatedAdmin,
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

    console.error('Error updating admin:', error)
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
    const currentAdmin = await requireAdmin()
    const { id } = params

    // Prevent self-deletion
    if (currentAdmin.id === id) {
      return NextResponse.json(
        { error: 'You cannot delete your own account' },
        { status: 400 }
      )
    }

    // Check if admin exists
    const admin = await prisma.admin.findUnique({
      where: { id },
    })

    if (!admin) {
      return NextResponse.json(
        { error: 'Admin not found' },
        { status: 404 }
      )
    }

    // Check if this is the last admin
    const adminCount = await prisma.admin.count()
    if (adminCount <= 1) {
      return NextResponse.json(
        { error: 'Cannot delete the last admin' },
        { status: 400 }
      )
    }

    // Delete admin
    await prisma.admin.delete({
      where: { id },
    })

    const response = NextResponse.json({
      success: true,
      message: 'Admin deleted successfully',
    })
    return setNoCacheHeaders(response)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      const response = NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
      return setNoCacheHeaders(response)
    }

    console.error('Error deleting admin:', error)
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
    return setNoCacheHeaders(response)
  }
}

