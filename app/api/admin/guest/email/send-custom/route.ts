import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-auth'
import { setNoCacheHeaders } from '@/lib/utils'
import { sendTransactionalEmail } from '@/lib/brevo'
import { z } from 'zod'

const sendCustomEmailSchema = z.object({
  subject: z.string().min(1),
  htmlContent: z.string().optional(),
  textContent: z.string().optional(),
  isPlainText: z.boolean().optional().default(false),
  guestIds: z.array(z.string()).optional(),
}).refine(
  (data) => {
    // If plain text mode, require textContent, otherwise require htmlContent
    if (data.isPlainText) {
      return !!data.textContent && data.textContent.trim().length > 0
    } else {
      return !!data.htmlContent && data.htmlContent.trim().length > 0
    }
  },
  {
    message: "Content is required. Please provide htmlContent (for HTML mode) or textContent (for plain text mode).",
    path: ["content"],
  }
)

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()
    const data = sendCustomEmailSchema.parse(body)

    // Validate that only one content type is provided
    if (data.htmlContent && data.textContent) {
      const response = NextResponse.json(
        { error: 'Cannot provide both htmlContent and textContent. Please provide only one.' },
        { status: 400 }
      )
      return setNoCacheHeaders(response)
    }

    // Determine which content to use and validate
    const htmlContent = data.isPlainText ? undefined : (data.htmlContent?.trim() || undefined)
    const textContent = data.isPlainText ? (data.textContent?.trim() || undefined) : undefined
    
    // Double-check we have content (shouldn't happen due to schema validation, but be safe)
    if (!htmlContent && !textContent) {
      const response = NextResponse.json(
        { error: 'Content is required. Please provide htmlContent or textContent.' },
        { status: 400 }
      )
      return setNoCacheHeaders(response)
    }

    // Get guests - either specific IDs or all guests
    const guests = data.guestIds && data.guestIds.length > 0
      ? await prisma.guest.findMany({
          where: { id: { in: data.guestIds } },
        })
      : await prisma.guest.findMany({})

    // Filter guests with email addresses
    const guestsWithEmail = guests.filter(g => g.email && g.email.trim() !== '')

    if (guestsWithEmail.length === 0) {
      const response = NextResponse.json(
        { error: 'No guests with email addresses found' },
        { status: 400 }
      )
      return setNoCacheHeaders(response)
    }

    // Get base URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                    (request.headers.get('origin') || 'https://example.com')

    const results = {
      sent: 0,
      failed: 0,
      skipped: 0,
      errors: [] as Array<{ guestId: string; guestName: string; error: string }>,
    }

    // Send emails sequentially to avoid rate limiting issues
    for (const guest of guestsWithEmail) {
      try {
        const inviteLink = `${baseUrl}/invite/${guest.token}`

        await sendTransactionalEmail({
          to: {
            email: guest.email!,
            name: guest.name,
          },
          subject: data.subject,
          ...(htmlContent && { htmlContent }),
          ...(textContent && { textContent }),
          params: {
            guestName: guest.name,
            inviteLink,
            baseUrl,
          },
        })

        results.sent++
      } catch (error) {
        results.failed++
        results.errors.push({
          guestId: guest.id,
          guestName: guest.name,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
        console.error(`Failed to send email to ${guest.email}:`, error)
      }
    }

    results.skipped = guests.length - guestsWithEmail.length

    const response = NextResponse.json({
      success: true,
      sent: results.sent,
      failed: results.failed,
      skipped: results.skipped,
      results: {
        errors: results.errors,
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

    console.error('Error sending custom emails:', error)
    const response = NextResponse.json(
      { 
        error: 'Failed to send custom emails',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
    return setNoCacheHeaders(response)
  }
}

