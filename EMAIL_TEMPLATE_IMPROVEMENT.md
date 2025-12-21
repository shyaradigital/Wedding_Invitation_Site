# Wedding Invitation Email Template

This document contains the HTML email templates used for wedding invitations and a prompt for ChatGPT to improve the UI while maintaining email client compatibility.

## Template Types

The email template has two variations:
1. **All-Events Guests**: Guests invited to all events (Mehndi, Wedding, Reception)
2. **Reception-Only Guests**: Guests invited only to the Reception

---

## HTML Template for All-Events Guests

```html
<!DOCTYPE html>
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
              <h1 class="header-title" style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; position: relative; z-index: 1; font-family: 'Georgia', serif;">Wedding Invitation</h1>
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
                    <p class="message-text" style="margin: 0; font-size: 17px; color: #3d3d3d; line-height: 1.9; font-family: 'Georgia', serif;">The parents of Jay and Ankita request the honor of your presence at their son and daughter's wedding. You are invited to Jay and Ankita's wedding celebration! Below is your personalized invitation link to RSVP:</p>
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
</html>
```

---

## HTML Template for Reception-Only Guests

The only differences for reception-only guests are:
- **Header Title**: "Wedding Reception Invitation" (instead of "Wedding Invitation")
- **Message Text**: "The parents of Jay and Ankita request the honor of your presence at their son and daughter's wedding. You are invited to Jay and Ankita's Wedding Reception. Below is your personalized invitation link to RSVP:" (instead of the all-events message)

All other HTML structure remains the same. Simply replace:
- Line with `Wedding Invitation` → `Wedding Reception Invitation`
- Line with the message text → `You are invited to Jay and Ankita's Wedding Reception. Below is your personalized invitation link to RSVP:`

---

## Template Variables

The following variables will be replaced dynamically:
- `{{params.guestName}}` - Full name of the guest (first and last name)
- `{{params.inviteLink}}` - Personalized invitation link (e.g., https://example.com/invite/abc123xyz)
- `{{params.baseUrl}}` - Website base URL

---

## ChatGPT Prompt for UI Improvement

```
I need you to improve the UI design of this wedding invitation email template while maintaining strict email client compatibility. The email will be sent via Brevo (Sendinblue) transactional email API.

CURRENT TEMPLATE:
[Paste the HTML template for All-Events Guests here]

TEMPLATE VARIABLES THAT MUST BE PRESERVED:
- {{params.guestName}} - Guest's full name (will be replaced dynamically)
- {{params.inviteLink}} - Personalized invitation link (will be replaced dynamically)
- {{params.baseUrl}} - Website base URL (will be replaced dynamically)

CRITICAL EMAIL CLIENT CONSTRAINTS (MUST FOLLOW):
1. **Inline CSS Only**: All styles MUST be inline. Email clients (especially Outlook, Gmail, Apple Mail) strip out external stylesheets and most <style> tag content. Keep styles in the <style> tag for desktop, but ensure critical styles are duplicated inline.

2. **Table-Based Layout**: Use <table> elements for layout structure. DO NOT use:
   - CSS Grid
   - Flexbox (flex, flexbox)
   - Modern CSS layouts
   - Float-based layouts
   - CSS columns

3. **Limited CSS Support**: Avoid:
   - CSS variables (custom properties)
   - CSS Grid and Flexbox
   - Position: fixed or sticky
   - Z-index (limited support)
   - Advanced selectors (use classes sparingly)
   - Transforms and animations
   - Advanced gradients (keep simple)

4. **Web-Safe Fonts Only**: Use fonts like:
   - Arial, Helvetica, Georgia, Times New Roman, Courier New
   - Always include fallbacks: font-family: 'Georgia', 'Times New Roman', serif;

5. **Maximum Width**: Keep email body at 600px max width for compatibility.

6. **Image Handling**: 
   - Always include alt text
   - Use absolute URLs for images (not relative)
   - Keep images under 1MB
   - Consider avoiding images entirely for maximum compatibility

7. **Mobile Responsive**: Use media queries in <style> tag, but ensure the desktop version works without them.

8. **Color Format**: Use hex colors (#D4AF37, #8B4513) - avoid rgba unless necessary.

9. **Outlook-Specific**: 
   - Use mso-* properties where needed
   - Test with Outlook 2007-2016 (they use Word rendering engine)
   - Use VML for advanced effects if absolutely necessary

10. **Button Links**: Style <a> tags as buttons using table cells, not actual <button> elements.

DESIGN REQUIREMENTS:
- Wedding theme with elegant, warm colors
- Primary colors: Gold (#D4AF37) and Brown (#D4AF37 variations, #8B4513)
- Professional and celebratory tone
- Maintain the current content structure (greeting, message, button, link, RSVP deadline, signature)
- Keep the existing content text exactly as is - only improve visual presentation

CONTENT THAT MUST REMAIN UNCHANGED:
- "Dear {{params.guestName}},"
- "The parents of Jay and Ankita request the honor of your presence at their son and daughter's wedding."
- "You are invited to Jay and Ankita's wedding celebration!" (for all-events) OR "You are invited to Jay and Ankita's Wedding Reception." (for reception-only)
- "Please RSVP latest by January 10, 2026."
- "With love and warm regards,"
- "Bhavan & Nina Mehta"
- "Brijesh Kumar & Ruchira Sharma"
- "View Your Invitation" (button text)

IMPROVEMENT GOALS:
1. Enhance visual hierarchy and readability
2. Improve spacing and breathing room
3. Add subtle decorative elements (if possible within constraints)
4. Enhance button design while keeping it clickable
5. Improve color contrast for accessibility
6. Make the template feel more premium and elegant
7. Ensure it looks great on both desktop and mobile email clients
8. Maintain or improve load time (avoid heavy elements)

WHAT TO OUTPUT:
Provide the complete, improved HTML email template that:
- Follows ALL constraints above
- Maintains ALL content text exactly as specified
- Improves the visual design and user experience
- Is production-ready and can be used directly
- Includes comments explaining any significant design choices
- Works in Gmail, Outlook, Apple Mail, and other major email clients

If you make any changes that might affect email client compatibility, please explain why you believe they will work and any fallbacks you've included.
```

---

## Usage Notes

1. **Dynamic Content**: The template uses template variables that will be replaced by the Brevo API when sending emails.

2. **Two Versions**: The code generates two versions dynamically:
   - All-events version: Shows "Wedding Invitation" header and full celebration message
   - Reception-only version: Shows "Wedding Reception Invitation" header and reception-only message

3. **Testing**: Before deploying improvements, test the email template in:
   - Gmail (web and mobile)
   - Outlook (2016, 2019, web, mobile)
   - Apple Mail (macOS and iOS)
   - Yahoo Mail
   - Outlook.com

4. **Email Client Testing Tools**: Consider using tools like:
   - Litmus
   - Email on Acid
   - Mailtrap (for testing before sending)

5. **Performance**: Keep the HTML size reasonable (under 100KB recommended) to avoid email client truncation.

---

## Current Design Elements

- Gold gradient header (#D4AF37 to #C9A030)
- Decorative top and bottom borders
- Rounded corners with subtle shadows
- Call-to-action button with gradient and shadow
- Highlighted RSVP deadline box
- Elegant footer with signature
- Mobile-responsive media queries
- Table-based layout for maximum compatibility

