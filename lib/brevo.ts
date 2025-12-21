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
 * Determines if guest has all events access
 */
function isAllEventsGuest(eventAccess: string[]): boolean {
  return eventAccess.length === 3 && 
    eventAccess.includes('mehndi') && 
    eventAccess.includes('wedding') && 
    eventAccess.includes('reception')
}

/**
 * Generates default HTML invitation template with placeholders
 * @param eventAccess - Array of event slugs the guest has access to
 */
export function getDefaultInvitationHTML(eventAccess: string[] = ['mehndi', 'wedding', 'reception']): string {
  const isAllEvents = isAllEventsGuest(eventAccess)
  
  // Different opening text based on guest type
  const openingText = isAllEvents
    ? "You are invited to Jay and Ankita's wedding celebration! Below is your personalized invitation link to RSVP:"
    : "You are invited to Jay and Ankita's wedding reception! Below is your personalized invitation link to RSVP:"
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: Georgia, 'Times New Roman', serif;
      line-height: 1.8;
      color: #2c2c2c;
      max-width: 600px;
      margin: 0 auto;
      padding: 0;
      background: linear-gradient(135deg, #f5f0e8 0%, #fff8f0 100%);
    }
    .email-wrapper {
      background-color: #ffffff;
      margin: 20px auto;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #D4AF37 0%, #B8941F 100%);
      padding: 30px 30px 25px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 28px;
      font-weight: 600;
      letter-spacing: 1px;
      text-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    .content {
      padding: 35px 30px;
    }
    .greeting {
      font-size: 20px;
      color: #8B4513;
      margin-bottom: 20px;
      font-weight: 500;
    }
    .message {
      font-size: 16px;
      color: #2c2c2c;
      margin-bottom: 25px;
      line-height: 1.8;
    }
    .invite-button-wrapper {
      text-align: center;
      margin: 30px 0;
    }
    .invite-link {
      display: inline-block;
      padding: 16px 40px;
      background: linear-gradient(135deg, #D4AF37 0%, #B8941F 100%);
      color: #ffffff;
      text-decoration: none;
      border-radius: 50px;
      font-weight: 600;
      font-size: 16px;
      box-shadow: 0 4px 15px rgba(212, 175, 55, 0.4);
      transition: all 0.3s ease;
    }
    .invite-link:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(212, 175, 55, 0.5);
    }
    .link-text {
      text-align: center;
      word-break: break-all;
      color: #666;
      font-size: 12px;
      margin-top: 15px;
      padding: 0 20px;
    }
    .rsvp-note {
      background: linear-gradient(135deg, #FFFEF7 0%, #FFF9E6 100%);
      border-left: 5px solid #D4AF37;
      padding: 20px;
      margin: 30px 0;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }
    .rsvp-note strong {
      color: #8B4513;
      font-size: 16px;
    }
    .footer {
      background: linear-gradient(135deg, #f8f6f2 0%, #f5f0e8 100%);
      padding: 30px;
      border-top: 2px solid #e8e0d0;
    }
    .signature {
      text-align: center;
      color: #2c2c2c;
      font-size: 15px;
      line-height: 2;
      margin-bottom: 20px;
    }
    .signature-name {
      font-weight: 600;
      color: #8B4513;
      margin-top: 5px;
    }
    .contact-info {
      text-align: center;
      color: #666;
      font-size: 13px;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
    }
    .contact-info a {
      color: #D4AF37;
      text-decoration: none;
      font-weight: 500;
    }
    .contact-info a:hover {
      text-decoration: underline;
    }
    @media only screen and (max-width: 600px) {
      .content {
        padding: 25px 20px;
      }
      .header {
        padding: 25px 20px 20px;
      }
      .header h1 {
        font-size: 24px;
      }
      .greeting {
        font-size: 18px;
      }
      .message {
        font-size: 15px;
      }
      .invite-link {
        padding: 14px 30px;
        font-size: 15px;
      }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header">
      <h1>Wedding Invitation</h1>
    </div>
    <div class="content">
      <div class="greeting">Hi {{params.guestName}}👋</div>
      <div class="message">${openingText}</div>
      <div class="invite-button-wrapper">
        <a href="{{params.inviteLink}}" class="invite-link">View Your Invitation</a>
      </div>
      <div class="link-text">{{params.inviteLink}}</div>
      <div class="rsvp-note">
        <strong>Please RSVP latest by January 10, 2026.</strong>
      </div>
      <div class="footer">
        <div class="signature">
          With love and warm regards,<br>
          <span class="signature-name">Bhavan & Nina Mehta</span><br>
          <span class="signature-name">Brijesh Kumar & Ruchira Sharma</span>
        </div>
        <div class="contact-info">
          Please contact <a href="mailto:mehtabv@gmail.com">Bhavan Mehta at mehtabv@gmail.com</a> if you have any questions.
        </div>
      </div>
    </div>
  </div>
</body>
</html>`
}

/**
 * Generates default plain text invitation template with placeholders
 * @param eventAccess - Array of event slugs the guest has access to
 */
export function getDefaultInvitationText(eventAccess: string[] = ['mehndi', 'wedding', 'reception']): string {
  const isAllEvents = isAllEventsGuest(eventAccess)
  
  // Different opening text based on guest type
  const openingText = isAllEvents
    ? "You are invited to Jay and Ankita's wedding celebration! Below is your personalized invitation link to RSVP:"
    : "You are invited to Jay and Ankita's wedding reception! Below is your personalized invitation link to RSVP:"
  
  return `Hi {{params.guestName}}👋

${openingText}
{{params.inviteLink}}

Please RSVP latest by January 10, 2026.

With love and warm regards,
Bhavan & Nina Mehta
Brijesh Kumar & Ruchira Sharma

Please contact Bhavan Mehta at mehtabv@gmail.com if you have any questions.`
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

