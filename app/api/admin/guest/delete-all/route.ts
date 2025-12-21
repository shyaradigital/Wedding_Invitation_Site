import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-auth'
import { setNoCacheHeaders } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    // Delete all guests from database
    const result = await prisma.guest.deleteMany({})

    const response = NextResponse.json({
      success: true,
      deletedCount: result.count,
      message: `Successfully deleted ${result.count} guest(s)`,
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

    console.error('Error deleting all guests:', error)
    const response = NextResponse.json(
      { 
        error: 'Failed to delete all guests',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
    return setNoCacheHeaders(response)
  }
}

