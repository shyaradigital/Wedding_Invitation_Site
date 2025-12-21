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
  const headerTitle = isAllEvents ? "Wedding Invitation" : "Wedding Reception Invitation"
  const messageText = isAllEvents 
    ? "You are invited to Jay and Ankita's wedding celebration! Below is your personalized invitation link to RSVP:"
    : "You are invited to Jay and Ankita's Wedding Reception Invitation. Below is your personalized invitation link to RSVP:"
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <style>
    body {
      font-family: 'Georgia', 'Times New Roman', serif;
      line-height: 1.8;
      color: #2c2c2c;
      margin: 0;
      padding: 0;
      background-color: #faf8f5;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table {
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
      -ms-interpolation-mode: bicubic;
    }
    @media only screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
        max-width: 100% !important;
      }
      .content-cell {
        padding: 30px 20px !important;
      }
      .header-cell {
        padding: 40px 20px 30px !important;
      }
      .header-title {
        font-size: 26px !important;
      }
      .greeting-text {
        font-size: 19px !important;
      }
      .message-text {
        font-size: 15px !important;
      }
      .button-link {
        padding: 14px 32px !important;
        font-size: 15px !important;
      }
      .footer-cell {
        padding: 30px 20px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #faf8f5;">
  <!-- Main Container -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #faf8f5; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" class="email-container" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.08);">
          
          <!-- Decorative Top Border -->
          <tr>
            <td style="background: linear-gradient(90deg, #D4AF37 0%, #F5E6D3 50%, #D4AF37 100%); height: 6px;"></td>
          </tr>
          
          <!-- Header Section -->
          <tr>
            <td class="header-cell" style="background: linear-gradient(135deg, #D4AF37 0%, #C9A030 100%); padding: 50px 40px 40px; text-align: center; position: relative;">
              <!-- Decorative Pattern Background -->
              <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; opacity: 0.1; background-image: radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px); background-size: 20px 20px;"></div>
              <h1 class="header-title" style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; position: relative; z-index: 1; font-family: 'Georgia', serif;">${headerTitle}</h1>
              <div style="width: 80px; height: 2px; background-color: rgba(255,255,255,0.6); margin: 20px auto 0; position: relative; z-index: 1;"></div>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td class="content-cell" style="padding: 50px 40px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                
                <!-- Greeting -->
                <tr>
                  <td style="padding-bottom: 25px;">
                    <p class="greeting-text" style="margin: 0; font-size: 22px; color: #8B4513; font-weight: 600; font-family: 'Georgia', serif; letter-spacing: 0.5px;">Dear {{params.guestName}},</p>
                  </td>
                </tr>
                
                <!-- Main Message -->
                <tr>
                  <td style="padding-bottom: 35px;">
                    <p class="message-text" style="margin: 0; font-size: 17px; color: #3d3d3d; line-height: 1.9; font-family: 'Georgia', serif;">${messageText}</p>
                  </td>
                </tr>
                
                <!-- Button Container with Decorative Elements -->
                <tr>
                  <td style="padding-bottom: 30px; text-align: center;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
                      <tr>
                        <td style="background: linear-gradient(135deg, #D4AF37 0%, #B8941F 100%); border-radius: 50px; box-shadow: 0 6px 20px rgba(212, 175, 55, 0.35), 0 2px 8px rgba(212, 175, 55, 0.2);">
                          <a href="{{params.inviteLink}}" class="button-link" style="display: inline-block; padding: 18px 48px; color: #ffffff !important; text-decoration: none; font-weight: 700; font-size: 16px; letter-spacing: 0.5px; font-family: 'Georgia', serif; text-transform: uppercase;">View Your Invitation</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Invitation Link -->
                <tr>
                  <td style="padding-bottom: 40px; text-align: center;">
                    <p style="margin: 0; font-size: 13px; color: #888888; word-break: break-all; line-height: 1.6; font-family: Arial, sans-serif;">{{params.inviteLink}}</p>
                  </td>
                </tr>
                
                <!-- RSVP Deadline Box -->
                <tr>
                  <td style="padding-bottom: 30px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #FFF9E8 0%, #FFF4DC 100%); border-left: 6px solid #D4AF37; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
                      <tr>
                        <td style="padding: 24px 28px;">
                          <p style="margin: 0; font-size: 17px; color: #8B4513; font-weight: 700; font-family: 'Georgia', serif; line-height: 1.6;">Please RSVP latest by January 10, 2026.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
          
          <!-- Footer Section -->
          <tr>
            <td class="footer-cell" style="background: linear-gradient(180deg, #faf8f5 0%, #f5f0e8 100%); padding: 45px 40px; border-top: 1px solid #e8e0d0;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center;">
                    <!-- Decorative Separator -->
                    <div style="width: 60px; height: 1px; background: linear-gradient(90deg, transparent, #D4AF37, transparent); margin: 0 auto 30px;"></div>
                    
                    <!-- Signature -->
                    <p style="margin: 0 0 20px 0; font-size: 16px; color: #5a5a5a; line-height: 1.8; font-family: 'Georgia', serif; font-style: italic;">With love and warm regards,</p>
                    
                    <p style="margin: 0 0 8px 0; font-size: 17px; color: #8B4513; font-weight: 700; font-family: 'Georgia', serif; letter-spacing: 0.3px;">Bhavan & Nina Mehta</p>
                    
                    <p style="margin: 0; font-size: 17px; color: #8B4513; font-weight: 700; font-family: 'Georgia', serif; letter-spacing: 0.3px;">Brijesh Kumar & Ruchira Sharma</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Bottom Decorative Border -->
          <tr>
            <td style="background: linear-gradient(90deg, #D4AF37 0%, #F5E6D3 50%, #D4AF37 100%); height: 6px;"></td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

/**
 * Generates default plain text invitation template with placeholders
 * @param eventAccess - Array of event slugs the guest has access to
 */
export function getDefaultInvitationText(eventAccess: string[] = ['mehndi', 'wedding', 'reception']): string {
  const isAllEvents = isAllEventsGuest(eventAccess)
  const messageText = isAllEvents 
    ? "You are invited to Jay and Ankita's wedding celebration!"
    : "You are invited to Jay and Ankita's Wedding Reception Invitation."
  
  return `Dear {{params.guestName}},
${messageText} 
Below is your personalized invitation link to RSVP: 

{{params.inviteLink}}

Please RSVP latest by January 10, 2026.

With love and warm regards,
Bhavan & Nina Mehta
Brijesh Kumar & Ruchira Sharma`
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

