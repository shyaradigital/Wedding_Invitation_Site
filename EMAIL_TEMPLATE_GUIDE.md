# Email Template Guide for Wedding Invitations

## Overview

This guide provides specifications and requirements for creating HTML email templates for wedding invitation emails. Templates are sent via the Brevo (Sendinblue) transactional email API and must adhere to email client compatibility standards.

## Template Variables

The following template variables are available for dynamic content replacement:

| Variable | Description | Example Output |
|----------|-------------|----------------|
| `{{params.guestName}}` | Guest's full name | "John Doe" |
| `{{params.inviteLink}}` | Personalized invitation URL | "https://example.com/invite/abc123xyz" |
| `{{params.baseUrl}}` | Website base URL | "https://example.com" |

**Note:** These variables are automatically replaced by Brevo during email delivery. Each guest receives a personalized version of the email.

## Technical Requirements

### HTML Structure

- **Document Type:** Valid HTML5
- **Character Encoding:** UTF-8
- **Viewport:** Responsive meta tag required
- **Maximum Width:** 600px for email body container
- **Layout Method:** Table-based layouts (required for email client compatibility)

### CSS Styling

- **Inline Styles:** All styles must be inline or within a `<style>` tag in the `<head>`
- **External Stylesheets:** Not supported by email clients
- **CSS Grid/Flexbox:** Not supported; use tables instead
- **Web-Safe Fonts:** Arial, Helvetica, Georgia, Times New Roman, or similar
- **Color Format:** Hex color codes (e.g., #D4AF37 for gold, #8B4513 for brown)
- **Media Queries:** Supported in `<style>` tag for responsive design

### Design Specifications

- **Theme:** Wedding celebration with elegant, warm aesthetic
- **Primary Colors:** 
  - Gold: #D4AF37
  - Rose: #D4A5A5
  - Brown: #8B4513
- **Tone:** Professional and celebratory
- **Mobile Responsive:** Required with appropriate media queries
- **Call-to-Action:** Prominent button or link for invitation access

## Content Requirements

### Required Elements

1. **Personalized Greeting**
   - Use `{{params.guestName}}` variable
   - Format: "Hi {{params.guestName}}👋"

2. **Invitation Message**
   - Wedding couple names: "Jay Mehta and Ankita Sharma"
   - Clear invitation statement
   - Event-specific messaging based on guest type

3. **Invitation Link**
   - Use `{{params.inviteLink}}` variable
   - Prominent call-to-action button
   - Fallback text link for accessibility

4. **RSVP Information**
   - Deadline: "Please RSVP latest by January 10, 2026"
   - Clearly visible and emphasized

5. **Closing Signature**
   - "With love and warm regards"
   - "Bhavan & Nina Mehta"
   - "Brijesh Kumar & Ruchira Sharma"

6. **Contact Information**
   - "Please contact Bhavan Mehta at mehtabv@gmail.com if you have any questions."

## Email Client Compatibility

Templates must be tested and compatible with:
- Gmail (web and mobile)
- Outlook (desktop and web)
- Apple Mail
- Yahoo Mail
- Common mobile email clients

## Template Structure Example

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    /* Email-safe CSS styles */
    body {
      font-family: Georgia, 'Times New Roman', serif;
      line-height: 1.8;
      color: #2c2c2c;
      max-width: 600px;
      margin: 0 auto;
      padding: 0;
      background: linear-gradient(135deg, #f5f0e8 0%, #fff8f0 100%);
    }
    /* Additional styles... */
  </style>
</head>
<body>
  <!-- Email content with template variables -->
  <div class="email-wrapper">
    <!-- Header, content, and footer sections -->
  </div>
</body>
</html>
```

## Best Practices

### ✅ Recommended Approaches

- Use inline CSS styles for critical styling
- Implement table-based layouts for structure
- Keep container width under 600px
- Use web-safe font families
- Test across multiple email clients
- Use hex color codes consistently
- Include alt text for all images
- Use semantic HTML elements
- Implement responsive design with media queries

### ❌ Avoid

- External stylesheets
- CSS Grid or Flexbox layouts
- JavaScript functionality
- Complex CSS animations
- Background images (unreliable support)
- Absolute positioning
- CSS custom properties (variables)
- Modern CSS features with limited email support

## Example Template

The following example demonstrates a complete, production-ready template structure:

```html
<!DOCTYPE html>
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
    }
    .rsvp-note {
      background: linear-gradient(135deg, #FFFEF7 0%, #FFF9E6 100%);
      border-left: 5px solid #D4AF37;
      padding: 20px;
      margin: 30px 0;
      border-radius: 8px;
    }
    .footer {
      background: linear-gradient(135deg, #f8f6f2 0%, #f5f0e8 100%);
      padding: 30px;
      border-top: 2px solid #e8e0d0;
    }
    @media only screen and (max-width: 600px) {
      .content {
        padding: 25px 20px;
      }
      .header {
        padding: 25px 20px 20px;
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
      <div class="message">You are invited to Jay and Ankita's wedding celebration! Below is your personalized invitation link to RSVP:</div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{params.inviteLink}}" class="invite-link">View Your Invitation</a>
      </div>
      <div class="rsvp-note">
        <strong>Please RSVP latest by January 10, 2026.</strong>
      </div>
      <div class="footer">
        <div style="text-align: center; color: #2c2c2c; font-size: 15px; line-height: 2; margin-bottom: 20px;">
          With love and warm regards,<br>
          <span style="font-weight: 600; color: #8B4513;">Bhavan & Nina Mehta</span><br>
          <span style="font-weight: 600; color: #8B4513;">Brijesh Kumar & Ruchira Sharma</span>
        </div>
        <div style="text-align: center; color: #666; font-size: 13px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
          Please contact <a href="mailto:mehtabv@gmail.com" style="color: #D4AF37; text-decoration: none; font-weight: 500;">Bhavan Mehta at mehtabv@gmail.com</a> if you have any questions.
        </div>
      </div>
    </div>
  </div>
</body>
</html>
```

## Testing and Validation

Before deploying templates to production:

1. **Preview Testing:** Use the preview feature in the admin panel to verify template rendering
2. **Single Guest Test:** Send a test email to a single guest to verify functionality
3. **Multi-Client Testing:** Test rendering across different email clients
4. **Variable Verification:** Confirm all template variables are replaced correctly
5. **Responsive Testing:** Verify mobile and desktop rendering
6. **Link Validation:** Ensure all links function correctly

## Additional Resources

For questions or assistance with template development, please refer to:
- Brevo API Documentation
- Email client compatibility guides
- HTML email best practices documentation
