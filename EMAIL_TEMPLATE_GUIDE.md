# Email Template Guide for Wedding Invitations

## ChatGPT Prompt for Generating HTML Email Templates

Copy and paste this prompt to ChatGPT to generate a fully functional HTML email template:

---

**PROMPT FOR CHATGPT:**

I need you to create a beautiful, responsive HTML email template for wedding invitations. The email will be sent via Brevo (Sendinblue) transactional email API.

**Requirements:**

1. **Template Variables (MUST USE THESE):**
   - `{{params.guestName}}` - Will be replaced with the guest's actual name
   - `{{params.inviteLink}}` - Will be replaced with the personalized invitation link (e.g., https://example.com/invite/abc123xyz)
   - `{{params.baseUrl}}` - Will be replaced with the website base URL (e.g., https://example.com)

2. **Email-Safe HTML:**
   - Use inline CSS styles (email clients don't support external stylesheets)
   - Use table-based layouts for better email client compatibility
   - Avoid CSS Grid and Flexbox (use tables instead)
   - Use web-safe fonts (Arial, Helvetica, Georgia, Times New Roman, etc.)
   - Maximum width: 600px for email body
   - Use hex colors (e.g., #D4AF37 for gold, #8B4513 for brown)

3. **Design Requirements:**
   - Wedding theme with elegant, warm colors
   - Gold (#D4AF37) and rose (#D4A5A5) accents
   - Professional and celebratory tone
   - Mobile-responsive (use media queries in `<style>` tag)
   - Include a prominent call-to-action button for the invitation link

4. **Content Structure:**
   - Personalized greeting using {{params.guestName}}
   - Wedding couple names: "Jay Mehta and Ankita Sharma"
   - Clear invitation message
   - Prominent button/link to {{params.inviteLink}}
   - RSVP deadline reminder: "Please RSVP latest by January 10, 2026"
   - Warm closing message

5. **Technical Constraints:**
   - Must be valid HTML5
   - All styles must be inline or in a `<style>` tag in the `<head>`
   - Use `<table>` for layout structure
   - Images should use absolute URLs (if needed)
   - Test for email client compatibility (Gmail, Outlook, Apple Mail)

6. **Example Structure:**
   ```html
   <!DOCTYPE html>
   <html>
   <head>
     <meta charset="UTF-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <style>
       /* Email-safe CSS here */
     </style>
   </head>
   <body>
     <!-- Email content with template variables -->
   </body>
   </html>
   ```

**Please generate a complete, production-ready HTML email template that I can use directly. Make it beautiful, professional, and wedding-appropriate.**

---

## Available Template Variables

When creating your custom email template, you can use these variables:

| Variable | Description | Example Output |
|----------|-------------|----------------|
| `{{params.guestName}}` | Guest's full name | "John Doe" |
| `{{params.inviteLink}}` | Personalized invitation URL | "https://example.com/invite/abc123xyz" |
| `{{params.baseUrl}}` | Website base URL | "https://example.com" |

**Important:** These variables will be automatically replaced by Brevo when the email is sent. Each guest will receive their personalized version.

## HTML Email Best Practices

### ✅ DO:
- Use inline CSS styles
- Use table-based layouts
- Keep width under 600px
- Use web-safe fonts
- Test in multiple email clients
- Use hex color codes
- Include alt text for images
- Use semantic HTML

### ❌ DON'T:
- Use external stylesheets
- Use CSS Grid or Flexbox
- Use JavaScript
- Use complex CSS animations
- Rely on background images
- Use absolute positioning
- Use CSS variables

## Example HTML Email Template

Here's a simple example you can customize:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background-color: #D4AF37;
      color: #ffffff;
      padding: 30px;
      text-align: center;
    }
    .content {
      padding: 30px;
    }
    .button {
      display: inline-block;
      padding: 15px 30px;
      background-color: #D4AF37;
      color: #ffffff;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
    }
    .footer {
      background-color: #f5f5f5;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5;">
    <tr>
      <td align="center">
        <table class="email-container" cellpadding="0" cellspacing="0">
          <tr>
            <td class="header">
              <h1 style="margin: 0; color: #ffffff;">Wedding Invitation</h1>
            </td>
          </tr>
          <tr>
            <td class="content">
              <h2>Hi {{params.guestName}}👋</h2>
              <p>You are cordially invited to Jay Mehta and Ankita Sharma's wedding celebrations!</p>
              <p style="text-align: center;">
                <a href="{{params.inviteLink}}" class="button">View Your Invitation</a>
              </p>
              <p><strong>Please RSVP latest by January 10, 2026.</strong></p>
              <p>Looking forward to celebrating with you! 💛</p>
            </td>
          </tr>
          <tr>
            <td class="footer">
              <p>With love,<br>Jay Mehta & Ankita Sharma</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

## Testing Your Template

Before sending to all guests:
1. Use the preview feature in the admin panel
2. Test with a single guest first
3. Check how it looks in different email clients
4. Verify all template variables are replaced correctly

