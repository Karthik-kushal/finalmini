# Email Notification Setup Guide

## Overview
This system automatically sends email notifications to all registered students whenever an admin creates a new event.

## Features
- **Asynchronous Processing**: Emails are sent in the background without blocking event creation
- **Beautiful HTML Emails**: Styled, responsive email templates with event details
- **Error Handling**: Graceful failure handling - event creation succeeds even if emails fail
- **Batch Processing**: Efficiently sends emails to all students simultaneously
- **Fallback Text**: Plain text version included for email clients that don't support HTML

## Setup Instructions

### 1. Install Dependencies
```bash
cd campus-connect-backend
npm install nodemailer
```

### 2. Configure Environment Variables

Create a `.env` file in the backend root directory:

```env
# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/campus-connect

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### 3. Email Service Setup

#### Option A: Gmail (Recommended for Development)

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Navigate to **Security** > **2-Step Verification** (enable if not already)
3. Go to **Security** > **2-Step Verification** > **App passwords**
4. Select **Mail** and **Other (Custom name)**
5. Copy the 16-character password
6. Use this password as `EMAIL_PASSWORD` in your `.env` file

**Example:**
```env
EMAIL_SERVICE=gmail
EMAIL_USER=campusconnect@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
```

#### Option B: Outlook/Hotmail

```env
EMAIL_SERVICE=hotmail
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
```

#### Option C: Custom SMTP Server

```env
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@example.com
EMAIL_PASSWORD=your-password
```

### 4. Test Email Configuration

Add this test endpoint to your server (optional):

```javascript
// In server.js or a test route
app.get('/api/test-email', async (req, res) => {
  const { verifyEmailConfiguration } = require('./services/emailService');
  const result = await verifyEmailConfiguration();
  res.json(result);
});
```

Access `http://localhost:5000/api/test-email` to verify your configuration.

## How It Works

### Event Creation Flow

1. Admin creates a new event via `POST /api/events`
2. Event is saved to MongoDB immediately
3. Response is sent back to the client (fast response)
4. In the background (asynchronously):
   - System fetches all users with role='student'
   - Generates personalized HTML email for each student
   - Sends emails in parallel using Promise.allSettled
   - Logs success/failure for each email

### Email Content

Each notification email includes:
- Event title and category badge
- Date and time (formatted)
- Location
- Host name
- Event description
- Tags (if any)
- "View Event & RSVP" button (links to event details page)
- Responsive HTML design

### Asynchronous Processing

The system uses `setImmediate()` to ensure:
- Event creation API responds instantly
- Emails are sent in the background
- Email failures don't affect event creation
- No timeout issues for large user bases

## Code Structure

### Files Created/Modified

```
campus-connect-backend/
├── services/
│   └── emailService.js          # Email utility functions
├── routes/
│   └── event.js                 # Updated with email trigger
├── .env                         # Email credentials (create this)
└── .env.example                 # Template for .env
```

### Key Functions

**emailService.js:**
- `sendNewEventNotification(event, users)` - Sends emails to all users
- `generateEventEmailHTML(event, hostName)` - Creates HTML email template
- `verifyEmailConfiguration()` - Tests email setup

## Usage

### Creating an Event (With Email Notifications)

```javascript
// POST /api/events
{
  "title": "Tech Hackathon 2024",
  "description": "48-hour coding competition",
  "detailedDescription": "Join us for an exciting...",
  "date": "2024-12-15T09:00:00Z",
  "location": "Computer Science Building, Room 101",
  "category": "Tech",
  "tags": ["coding", "competition", "prizes"],
  "imageUrl": "https://example.com/image.jpg",
  "createdBy": "507f1f77bcf86cd799439011"  // Admin user ID
}
```

**Response:** Immediate (does not wait for emails)
```json
{
  "_id": "...",
  "title": "Tech Hackathon 2024",
  "... other event fields ...",
  "createdBy": {
    "_id": "...",
    "fullName": "Admin Name",
    "email": "admin@example.com"
  }
}
```

**Background Process:** Emails sent to all students asynchronously

### Console Logs

```
📧 Sending event notifications to 150 students...
✅ Email sent successfully to student1@university.edu
✅ Email sent successfully to student2@university.edu
❌ Failed to send email to student3@university.edu: Connection timeout
...
📧 Email notification summary: 148 sent, 2 failed out of 150 total
```

## Error Handling

### Scenarios Handled

1. **Missing Email Credentials**: Warns in console, skips email sending
2. **No Students Found**: Logs info message, continues normally
3. **Individual Email Failures**: Logs error, continues with other emails
4. **Email Service Down**: Event still created, errors logged

### Production Recommendations

1. **Use a transactional email service**: SendGrid, AWS SES, or Mailgun
2. **Implement retry logic**: For failed emails
3. **Add email queue**: Use Bull or Redis for better reliability
4. **Rate limiting**: Prevent email service throttling
5. **Email preferences**: Let users opt-out of notifications
6. **Track email status**: Store sent/failed status in database

## Troubleshooting

### Emails Not Sending

1. Check console for error messages
2. Verify `.env` file exists and has correct credentials
3. Test with: `GET /api/test-email`
4. Check Gmail security settings (less secure apps, 2FA)
5. Verify email service is not blocking NodeMailer

### Common Errors

**"Invalid login"**: Wrong credentials or app password not generated
**"Connection timeout"**: Firewall blocking SMTP ports (587, 465)
**"Rate limit exceeded"**: Too many emails sent too quickly

## Security Notes

- Never commit `.env` file to version control
- Use app-specific passwords, not your main account password
- Consider using environment-specific credentials
- Implement rate limiting for email sending
- Validate email addresses before sending

## Testing

### Manual Test
1. Create a test student account
2. Login as admin
3. Create a new event
4. Check student's email inbox

### Automated Test (Optional)
```javascript
const { sendNewEventNotification } = require('./services/emailService');

// Test with dummy data
const testEvent = {
  _id: 'test123',
  title: 'Test Event',
  date: new Date(),
  location: 'Test Location',
  category: 'Tech',
  createdBy: { fullName: 'Test Admin' }
};

const testUsers = [
  { email: 'test@example.com', fullName: 'Test User' }
];

sendNewEventNotification(testEvent, testUsers)
  .then(result => console.log('Test result:', result));
```

## Future Enhancements

- [ ] Add email templates for RSVP confirmations
- [ ] Event reminder emails (24 hours before)
- [ ] Event cancellation notifications
- [ ] User preference management (opt-in/opt-out)
- [ ] Email analytics and tracking
- [ ] Digest emails (daily/weekly summary)

## Support

For issues or questions:
1. Check console logs for specific error messages
2. Review Gmail/email provider security settings
3. Test with `verifyEmailConfiguration()` function
4. Ensure all environment variables are set correctly