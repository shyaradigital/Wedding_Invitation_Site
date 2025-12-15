import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-auth'
import { hashPassword } from '@/lib/auth'
import { setNoCacheHeaders } from '@/lib/utils'
import { z } from 'zod'

const changePasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()
    const { id } = params

    const body = await request.json()
    const data = changePasswordSchema.parse(body)

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

    // Hash new password
    const hashedPassword = await hashPassword(data.password)

    // Update password
    await prisma.admin.update({
      where: { id },
      data: {
        password: hashedPassword,
      },
    })

    const response = NextResponse.json({
      success: true,
      message: 'Password updated successfully',
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

    console.error('Error changing password:', error)
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
    return setNoCacheHeaders(response)
  }
}

