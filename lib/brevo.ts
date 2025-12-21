/**
 * Brevo (Sendinblue) Transactional Email API Client
 */

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email'

export interface SendEmailParams {
  to: {
    email: string
    name?: string
  }
  subject: string
  htmlContent?: string
  textContent?: string
  params?: {
    guestName?: string
    inviteLink?: string
    baseUrl?: string
    [key: string]: any
  }
}

export interface SendEmailResult {
  messageId: string
}

export interface BrevoError {
  code: string
  message: string
}

/**
 * Sends a transactional email via Brevo API
 */
export async function sendTransactionalEmail(
  params: SendEmailParams
): Promise<SendEmailResult> {
  const apiKey = process.env.BREVO_API_KEY

  if (!apiKey) {
    throw new Error('BREVO_API_KEY environment variable is not set')
  }

  // Validate that either htmlContent or textContent is provided, but not both
  if (!params.htmlContent && !params.textContent) {
    throw new Error('Either htmlContent or textContent must be provided')
  }

  if (params.htmlContent && params.textContent) {
    throw new Error('Cannot provide both htmlContent and textContent. Please provide only one.')
  }

  // Get sender email from environment or use a default
  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'noreply@example.com'
  const senderName = process.env.BREVO_SENDER_NAME || 'From Bhavan Mehta'

  const payload: any = {
    sender: {
      name: senderName,
      email: senderEmail,
    },
    to: [
      {
        email: params.to.email,
        ...(params.to.name && { name: params.to.name }),
      },
    ],
    subject: params.subject,
    ...(params.htmlContent && { htmlContent: params.htmlContent }),
    ...(params.textContent && { textContent: params.textContent }),
    ...(params.params && { params: params.params }),
  }

  try {
    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (!response.ok) {
      const error: BrevoError = {
        code: data.code || 'UNKNOWN_ERROR',
        message: data.message || `Brevo API error: ${response.status} ${response.statusText}`,
      }
      throw new Error(`Brevo API Error: ${error.message} (Code: ${error.code})`)
    }

    return {
      messageId: data.messageId || 'unknown',
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Unknown error occurred while sending email')
  }
}

/**
 * Generates default HTML invitation template with placeholders
 */
export function getDefaultInvitationHTML(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h2 {
      color: #8B4513;
      margin-top: 0;
    }
    .invite-link {
      display: inline-block;
      padding: 12px 24px;
      background-color: #D4AF37;
      color: #ffffff;
      text-decoration: none;
      border-radius: 4px;
      margin: 20px 0;
      font-weight: bold;
    }
    .invite-link:hover {
      background-color: #B8941F;
    }
    .rsvp-note {
      background-color: #FFFEF7;
      border-left: 4px solid #D4AF37;
      padding: 15px;
      margin: 20px 0;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      color: #666;
      font-size: 14px;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>Hi {{params.guestName}}👋</h2>
    <p>You are invited to Jay Mehta and Ankita Sharma's wedding celebrations!</p>
    <p>Below is your personalized event(s) invitation link:</p>
    <p style="text-align: center;">
      <a href="{{params.inviteLink}}" class="invite-link">View Your Invitation</a>
    </p>
    <p style="text-align: center; word-break: break-all; color: #666; font-size: 14px;">
      {{params.inviteLink}}
    </p>
    <div class="rsvp-note">
      <strong>Please RSVP latest by January 10, 2026.</strong>
    </div>
    <p>Looking forward to celebrating with you! 💛</p>
    <div class="footer">
      <p>With love,<br>Jay Mehta & Ankita Sharma</p>
    </div>
  </div>
</body>
</html>`
}

/**
 * Generates default plain text invitation template with placeholders
 */
export function getDefaultInvitationText(): string {
  return `Hi {{params.guestName}}👋

You are invited to Jay Mehta and Ankita Sharma's wedding celebrations!

Below is your personalized event(s) invitation link:
{{params.inviteLink}}

Please RSVP latest by January 10, 2026.

Looking forward to celebrating with you! 💛

With love,
Jay Mehta & Ankita Sharma`
}

/**
 * Replaces template variables in content with actual values
 * Used for preview purposes (Brevo will handle actual replacement)
 */
export function replaceTemplateVariables(
  content: string,
  variables: {
    guestName?: string
    inviteLink?: string
    baseUrl?: string
  }
): string {
  if (!content || typeof content !== 'string') {
    return ''
  }
  
  let result = content
  
  // Use safe defaults if variables are not provided
  const guestName = variables.guestName || 'John Doe'
  const inviteLink = variables.inviteLink || 'https://example.com/invite/sample-token'
  const baseUrl = variables.baseUrl || 'https://example.com'
  
  // Replace template variables (case-sensitive, exact match required)
  // Note: We use global replace (/g) to replace all occurrences
  result = result.replace(/\{\{params\.guestName\}\}/g, guestName)
  result = result.replace(/\{\{params\.inviteLink\}\}/g, inviteLink)
  result = result.replace(/\{\{params\.baseUrl\}\}/g, baseUrl)
  
  return result
}

