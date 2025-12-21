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
    ? "The parents of Jay and Ankita request the honor of your presence at their son and daughter's wedding. Below is your personalized invitation link to RSVP:"
    : "You are invited to Jay and Ankita's Wedding Reception. Below is your personalized invitation link to RSVP:"
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="color-scheme" content="light" />
  <style>
    html, body {
      color-scheme: light;
      -webkit-font-smoothing: antialiased;
    }
    @media (prefers-color-scheme: dark) {
      body, table, td, div, p, span {
        background-color: inherit !important;
        color: inherit !important;
      }
      table[role="presentation"] {
        background-color: #120a1a !important;
      }
      table[role="presentation"] table[role="presentation"] {
        background-color: #fbf7ef !important;
      }
      td[style*="background-color:#fbf7ef"] {
        background-color: #fbf7ef !important;
      }
      td[style*="background-color:#f3eee3"] {
        background-color: #f3eee3 !important;
      }
      td[style*="background-color:#ffffff"] {
        background-color: #ffffff !important;
      }
      td[style*="background-color:#2a133d"] {
        background-color: #2a133d !important;
      }
      td[style*="background-color:#120a1a"] {
        background-color: #120a1a !important;
      }
      p[style*="color:#2a133d"] {
        color: #2a133d !important;
      }
      p[style*="color:#2b2430"] {
        color: #2b2430 !important;
      }
      p[style*="color:#514a57"] {
        color: #514a57 !important;
      }
      p[style*="color:#6c6473"] {
        color: #6c6473 !important;
      }
      div[style*="color:#f7e7b6"] {
        color: #f7e7b6 !important;
      }
      a[style*="color:#f7e7b6"] {
        color: #f7e7b6 !important;
      }
      td[style*="color:#1f1a22"] {
        color: #1f1a22 !important;
      }
    }
    @media only screen and (max-width:600px){
      .container{width:100% !important;}
      .px{padding-left:18px !important; padding-right:18px !important;}
      .h1{font-size:26px !important; letter-spacing:1px !important;}
      .btn a{padding:14px 26px !important; font-size:14px !important;}
      .cardpad{padding:30px 18px !important;}
    }
  </style>
</head>

<body style="margin:0;padding:0;background-color:#120a1a !important;color-scheme:light;">
  <!-- Background -->
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
         style="background-color:#120a1a !important;padding:38px 12px;color-scheme:light;">
    <tr>
      <td align="center">

        <!-- Container -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="container"
               style="max-width:600px;width:600px;">

          <!-- Outer glow block (safe look via padding + bg) -->
          <tr>
            <td style="background-color:#120a1a !important;padding:0;">
              <!-- Card shell -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
                     style="background-color:#fbf7ef !important;border-radius:18px;overflow:hidden;
                            border:1px solid #d8c08b; box-shadow:0 14px 36px rgba(0,0,0,0.35);color-scheme:light;">

                <!-- Top band -->
                <tr>
                  <td style="background-color:#2a133d !important;height:10px;line-height:10px;font-size:0;"></td>
                </tr>

                <!-- Header -->
                <tr>
                  <td align="center" class="px"
                      style="background-color:#2a133d !important;padding:44px 40px 30px;">
                    <div class="h1"
                         style="font-family:Georgia,'Times New Roman',serif;font-size:30px;font-weight:700;
                                letter-spacing:2px;text-transform:uppercase;color:#f7e7b6;margin:0;">
                      ${headerTitle}
                    </div>

                    <!-- Decorative lines (no extra text characters) -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="160"
                           style="margin:18px auto 0;">
                      <tr>
                        <td style="height:1px;background-color:#d8c08b;line-height:1px;font-size:0;"></td>
                      </tr>
                      <tr>
                        <td style="height:10px;line-height:10px;font-size:0;"></td>
                      </tr>
                      <tr>
                        <td style="height:1px;background-color:#d8c08b;line-height:1px;font-size:0;"></td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td class="cardpad px"
                      style="padding:46px 44px 26px;color:#1f1a22 !important;background-color:#fbf7ef !important;
                             font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.9;">

                    <p style="margin:0 0 20px;font-size:20px;font-weight:700;color:#2a133d !important;">
                      Dear {{params.guestName}},
                    </p>

                    <p style="margin:0 0 28px;color:#2b2430 !important;">
                      ${messageText}
                    </p>

                    <!-- CTA -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:18px auto 16px;">
                      <tr>
                        <td style="border-radius:999px;background-color:#2a133d !important;border:1px solid #d8c08b;"
                            class="btn">
                          <a href="{{params.inviteLink}}"
                             style="display:inline-block;padding:16px 42px;
                                    font-family:Arial,Helvetica,sans-serif;font-size:15px;
                                    letter-spacing:0.6px;text-decoration:none;
                                    color:#f7e7b6 !important;font-weight:700;">
                            View Your Invitation
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:0 0 28px;text-align:center;font-family:Arial,Helvetica,sans-serif;
                              font-size:12px;line-height:1.6;color:#6c6473 !important;word-break:break-all;">
                      {{params.inviteLink}}
                    </p>

                    <!-- RSVP strip -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
                           style="background-color:#ffffff !important;border:1px solid #e5d7b4;border-radius:12px;">
                      <tr>
                        <td style="padding:16px 18px;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                            <tr>
                              <td style="width:8px;background-color:#2a133d !important;border-radius:8px;font-size:0;line-height:0;">&nbsp;</td>
                              <td style="padding-left:12px;font-weight:700;color:#2a133d !important;">
                                Please RSVP latest by January 10, 2026.
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td align="center" class="px"
                      style="padding:28px 44px 42px;background-color:#f3eee3 !important;border-top:1px solid #eadfc7;">
                    <p style="margin:0 0 14px;font-style:italic;color:#514a57 !important;
                              font-family:Georgia,'Times New Roman',serif;font-size:15px;">
                      With love and warm regards,
                    </p>

                    <p style="margin:0 0 6px;font-weight:700;color:#2a133d !important;font-size:16px;">
                      Bhavan & Nina Mehta
                    </p>

                    <p style="margin:0;font-weight:700;color:#2a133d !important;font-size:16px;">
                      Brijesh Kumar & Ruchira Sharma
                    </p>
                  </td>
                </tr>

                <!-- Bottom band -->
                <tr>
                  <td style="background-color:#2a133d !important;height:10px;line-height:10px;font-size:0;"></td>
                </tr>

              </table>
            </td>
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
    : "You are invited to Jay and Ankita's Wedding Reception."
  
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

