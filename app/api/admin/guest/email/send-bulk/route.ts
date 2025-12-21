import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-auth'
import { setNoCacheHeaders, ensureJsonArray } from '@/lib/utils'
import { sendTransactionalEmail, getDefaultInvitationHTML, getDefaultInvitationText } from '@/lib/brevo'
import { z } from 'zod'

const sendBulkEmailSchema = z.object({
  guestIds: z.array(z.string()).optional(),
  customMessage: z.string().optional(),
  customSubject: z.string().optional(),
  isPlainText: z.boolean().optional().default(false),
})

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()
    const data = sendBulkEmailSchema.parse(body)

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

    // Use custom message or default template
    const subject = data.customSubject || "Jay and Ankita's Wedding Invitation"

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

        // Parse eventAccess from JSON string
        const eventAccess = ensureJsonArray(guest.eventAccess) as string[]
        
        let htmlContent: string | undefined
        let textContent: string | undefined

        if (data.customMessage) {
          if (data.isPlainText) {
            textContent = data.customMessage
          } else {
            htmlContent = data.customMessage
          }
        } else {
          // Use default template with eventAccess
          if (data.isPlainText) {
            textContent = getDefaultInvitationText(eventAccess)
          } else {
            htmlContent = getDefaultInvitationHTML(eventAccess)
          }
        }

        await sendTransactionalEmail({
          to: {
            email: guest.email!,
            name: guest.name,
          },
          subject,
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

    console.error('Error sending bulk emails:', error)
    const response = NextResponse.json(
      { 
        error: 'Failed to send bulk emails',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
    return setNoCacheHeaders(response)
  }
}

