import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-auth'
import { setNoCacheHeaders, ensureJsonArray } from '@/lib/utils'
import { sendTransactionalEmail, getDefaultInvitationHTML, getDefaultInvitationText } from '@/lib/brevo'
import { z } from 'zod'

const sendEmailSchema = z.object({
  guestId: z.string().min(1),
  customMessage: z.string().optional(),
  customSubject: z.string().optional(),
  isPlainText: z.boolean().optional().default(false),
})

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()
    const data = sendEmailSchema.parse(body)

    // Get guest from database
    const guest = await prisma.guest.findUnique({
      where: { id: data.guestId },
      select: {
        id: true,
        name: true,
        email: true,
        token: true,
        eventAccess: true,
      },
    })

    if (!guest) {
      const response = NextResponse.json(
        { error: 'Guest not found' },
        { status: 404 }
      )
      return setNoCacheHeaders(response)
    }

    if (!guest.email) {
      const response = NextResponse.json(
        { error: 'Guest does not have an email address' },
        { status: 400 }
      )
      return setNoCacheHeaders(response)
    }

    // Get base URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                    (request.headers.get('origin') || 'https://example.com')
    const inviteLink = `${baseUrl}/invite/${guest.token}`

    // Use custom message or default template
    const subject = data.customSubject || "Jay and Ankita's Wedding Invitation"
    
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

    // Send email via Brevo
    const result = await sendTransactionalEmail({
      to: {
        email: guest.email,
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

    const response = NextResponse.json({
      success: true,
      messageId: result.messageId,
      sentTo: guest.email,
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

    console.error('Error sending email:', error)
    const response = NextResponse.json(
      { 
        error: 'Failed to send email',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
    return setNoCacheHeaders(response)
  }
}

