import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-auth'
import { hashPassword } from '@/lib/auth'
import { setNoCacheHeaders } from '@/lib/utils'
import { z } from 'zod'

const createAdminSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    const response = NextResponse.json({ admins })
    return setNoCacheHeaders(response)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      const response = NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
      return setNoCacheHeaders(response)
    }

    console.error('Error fetching admins:', error)
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
    return setNoCacheHeaders(response)
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()
    const data = createAdminSchema.parse(body)

    // Check if admin with this email already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    })

    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Admin with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password)

    // Create admin
    const admin = await prisma.admin.create({
      data: {
        email: data.email.toLowerCase().trim(),
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    })

    const response = NextResponse.json({
      success: true,
      admin,
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

    console.error('Error creating admin:', error)
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
    return setNoCacheHeaders(response)
  }
}

