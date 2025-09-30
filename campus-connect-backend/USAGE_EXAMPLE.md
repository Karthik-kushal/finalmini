# Email Notification System - Usage Example

## Quick Start

### 1. Set Up Environment Variables

Create a `.env` file in the `campus-connect-backend` directory:

```env
MONGO_URI=mongodb://localhost:27017/campus-connect
PORT=5000

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### 2. Test Email Configuration

```bash
cd campus-connect-backend
npm run test:email
```

This will:
- Verify your email credentials
- Send a test email to TEST_EMAIL (or test@example.com)
- Display the results in the console

### 3. Start the Server

```bash
npm run dev
```

Look for these messages:
```
✅ MongoDB connected
🚀 Server running on http://localhost:5000
✅ Email service configured and ready
```

## How It Works

### Automatic Email Flow

1. **Admin Creates Event**
   ```bash
   POST http://localhost:5000/api/events
   Content-Type: application/json

   {
     "title": "Campus Hackathon 2024",
     "description": "48-hour coding marathon",
     "detailedDescription": "Join us for an exciting...",
     "date": "2024-12-15T09:00:00Z",
     "location": "CS Building, Room 101",
     "category": "Tech",
     "tags": ["coding", "competition"],
     "createdBy": "507f1f77bcf86cd799439011"
   }
   ```

2. **Server Response (Immediate)**
   ```json
   {
     "_id": "507f...",
     "title": "Campus Hackathon 2024",
     "date": "2024-12-15T09:00:00.000Z",
     "rsvpCount": 0,
     "createdBy": {
       "_id": "507f...",
       "fullName": "Dr. Johnson",
       "email": "johnson@university.edu"
     }
   }
   ```

3. **Background Process (Asynchronous)**
   - System fetches all users with `role: 'student'`
   - Generates personalized HTML emails
   - Sends emails to all students in parallel
   - Logs results to console

### Console Output Example

```
📧 Sending event notifications to 150 students...
✅ Email sent successfully to john.doe@university.edu
✅ Email sent successfully to jane.smith@university.edu
✅ Email sent successfully to mike.wilson@university.edu
... (147 more)
📧 Email notification result: {
  success: true,
  message: 'Emails sent: 148/150',
  sent: 148,
  failed: 2,
  total: 150
}
```

## Email Content Preview

### Subject
```
🎉 New Event: Campus Hackathon 2024
```

### HTML Email (Responsive, Styled)

```
┌────────────────────────────────────────┐
│     🎉 New Event Alert!                │
│         [Tech Badge]                   │
├────────────────────────────────────────┤
│                                        │
│  Campus Hackathon 2024                 │
│                                        │
│  📅 Date: Friday, December 15, 2024    │
│  ⏰ Time: 9:00 AM                      │
│  📍 Location: CS Building, Room 101    │
│  👤 Hosted by: Dr. Johnson             │
│  🏷️ Tags: #coding, #competition        │
│                                        │
│  ╔══════════════════════════════════╗ │
│  ║ About This Event                 ║ │
│  ║                                  ║ │
│  ║ Join us for an exciting...       ║ │
│  ╚══════════════════════════════════╝ │
│                                        │
│    [View Event Details & RSVP]         │
│                                        │
│  Don't miss out on this exciting       │
│  event! Click the button above to      │
│  RSVP.                                 │
└────────────────────────────────────────┘
```

### Plain Text Version (Fallback)
```
New Event Alert: Campus Hackathon 2024

Category: Tech
Date: Friday, December 15, 2024
Time: 9:00 AM
Location: CS Building, Room 101
Hosted by: Dr. Johnson

Join us for an exciting...

View full event details and RSVP at:
http://localhost:5173/event/507f...
```

## API Endpoints

### Test Email Configuration
```bash
GET http://localhost:5000/api/test-email-config
```

**Response:**
```json
{
  "configured": true,
  "message": "Email service is ready"
}
```

### Create Event (Triggers Email)
```bash
POST http://localhost:5000/api/events
Content-Type: application/json

{
  "title": "Event Title",
  "date": "2024-12-20T18:00:00Z",
  "location": "Campus Hall",
  "description": "Short description",
  "detailedDescription": "Long description...",
  "category": "Tech",
  "tags": ["tag1", "tag2"],
  "createdBy": "admin_user_id"
}
```

## Testing Scenarios

### Test 1: Verify Email Configuration
```bash
npm run test:email
```

**Expected Output:**
```
🧪 Testing Email Notification System

Step 1: Verifying email configuration...
Configuration result: { configured: true, message: 'Email service is ready' }

✅ Email configuration verified!

Step 2: Sending test notification email...
Test event: Campus Tech Meetup 2024
Recipients: test@example.com

Sending...

✅ Email sent successfully to test@example.com

📊 Test Results:
----------------
Success: true
Message: Emails sent: 1/1
Emails sent: 1
Emails failed: 0
Total recipients: 1

✅ Test completed successfully!
📧 Check the inbox for: test@example.com
```

### Test 2: Create Event via API
```bash
curl -X POST http://localhost:5000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Event",
    "date": "2024-12-25T10:00:00Z",
    "location": "Test Location",
    "category": "Tech",
    "createdBy": "your_admin_id"
  }'
```

### Test 3: Check Backend Console
Monitor the backend console for:
- Email sending confirmation
- Success/failure counts
- Individual email status

## Troubleshooting

### Problem: Emails Not Sending

**Solution 1: Check Environment Variables**
```bash
# In campus-connect-backend directory
cat .env

# Should contain:
# EMAIL_USER=...
# EMAIL_PASSWORD=...
```

**Solution 2: Test Configuration**
```bash
npm run test:email
```

**Solution 3: Verify Gmail Settings**
- Enable 2-Factor Authentication
- Generate App Password
- Use app password, not regular password

### Problem: "Invalid login" Error

**Cause:** Wrong credentials or app password not generated

**Solution:**
1. Go to Google Account → Security → 2-Step Verification
2. Generate App Password for "Mail"
3. Use 16-character password in .env

### Problem: Emails Going to Spam

**Solutions:**
- Use a verified email domain
- Add SPF/DKIM records (production)
- Use transactional email service (SendGrid, AWS SES)
- Ask users to whitelist your sender address

## Production Deployment

### Recommended Services

**SendGrid (Recommended)**
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASSWORD=your_sendgrid_api_key
```

**AWS SES**
```env
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_aws_access_key
EMAIL_PASSWORD=your_aws_secret_key
```

**Mailgun**
```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=postmaster@your-domain.com
EMAIL_PASSWORD=your_mailgun_password
```

### Environment Variables (Production)
```env
# Use environment variables in your hosting platform
# Never commit .env to version control

EMAIL_SERVICE=gmail
EMAIL_USER=${EMAIL_USER}
EMAIL_PASSWORD=${EMAIL_PASSWORD}
FRONTEND_URL=https://your-domain.com
```

## Advanced Usage

### Custom Email Service
```javascript
// services/emailService.js
const transporter = nodemailer.createTransport({
  host: 'smtp.example.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false
  }
});
```

### Email with Attachments
```javascript
const mailOptions = {
  from: `"Campus Connect" <${process.env.EMAIL_USER}>`,
  to: user.email,
  subject: 'Event Details',
  html: emailHTML,
  attachments: [
    {
      filename: 'event-details.pdf',
      path: '/path/to/pdf'
    }
  ]
};
```

### Rate Limiting
```javascript
// Add delay between emails
for (const user of users) {
  await sendEmail(user);
  await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay
}
```

## Monitoring & Logging

### Add Detailed Logging
```javascript
// In emailService.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'emails.log' })
  ]
});

// Log each email
logger.info('Email sent', {
  to: user.email,
  eventId: event._id,
  timestamp: new Date()
});
```

### Database Tracking (Optional)
```javascript
// Create EmailLog model
const emailLog = new EmailLog({
  eventId: event._id,
  recipientEmail: user.email,
  status: 'sent',
  sentAt: new Date()
});
await emailLog.save();
```

## Support & Resources

- **Nodemailer Docs:** https://nodemailer.com/
- **Gmail Setup:** https://support.google.com/accounts/answer/185833
- **SendGrid Guide:** https://sendgrid.com/docs/
- **AWS SES Guide:** https://docs.aws.amazon.com/ses/

## FAQ

**Q: How many emails can I send?**
- Gmail: 500/day (free), 2000/day (Google Workspace)
- SendGrid: 100/day (free), unlimited (paid)
- AWS SES: Pay per email

**Q: Will email sending block event creation?**
- No, emails are sent asynchronously using `setImmediate()`

**Q: What if email service is down?**
- Event is still created successfully
- Error is logged to console
- No impact on API response

**Q: Can I customize the email template?**
- Yes, edit `generateEventEmailHTML()` in `emailService.js`

**Q: How do I add unsubscribe feature?**
- Add `preferences.emailNotifications` field to User model
- Filter users before sending: `users.filter(u => u.preferences.emailNotifications)`