const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
};

const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

const generateEventEmailHTML = (event, hostName) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Event: ${event.title}</title>
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
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 3px solid #2563eb;
        }
        .header h1 {
          color: #2563eb;
          margin: 0 0 10px 0;
          font-size: 28px;
        }
        .badge {
          display: inline-block;
          padding: 6px 12px;
          background-color: #dbeafe;
          color: #1e40af;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          margin-top: 10px;
        }
        .event-title {
          font-size: 24px;
          color: #1f2937;
          margin: 20px 0;
          font-weight: 700;
        }
        .event-details {
          background-color: #f9fafb;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .detail-row {
          display: flex;
          margin: 12px 0;
          align-items: flex-start;
        }
        .detail-label {
          font-weight: 600;
          color: #2563eb;
          min-width: 100px;
          display: inline-block;
        }
        .detail-value {
          color: #4b5563;
        }
        .description {
          margin: 20px 0;
          padding: 20px;
          background-color: #f0f9ff;
          border-left: 4px solid #2563eb;
          border-radius: 4px;
        }
        .description h3 {
          margin-top: 0;
          color: #1e40af;
        }
        .cta-button {
          display: inline-block;
          padding: 14px 32px;
          background: linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%);
          color: #ffffff;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          text-align: center;
          margin: 20px 0;
          transition: transform 0.2s;
        }
        .cta-button:hover {
          transform: translateY(-2px);
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 14px;
        }
        @media only screen and (max-width: 600px) {
          body {
            padding: 10px;
          }
          .container {
            padding: 20px;
          }
          .detail-row {
            flex-direction: column;
          }
          .detail-label {
            margin-bottom: 4px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 New Event Alert!</h1>
          <span class="badge">${event.category}</span>
        </div>

        <h2 class="event-title">${event.title}</h2>

        <div class="event-details">
          <div class="detail-row">
            <span class="detail-label">📅 Date:</span>
            <span class="detail-value">${formatDate(event.date)}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">⏰ Time:</span>
            <span class="detail-value">${formatTime(event.date)}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">📍 Location:</span>
            <span class="detail-value">${event.location || 'Location TBA'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">👤 Hosted by:</span>
            <span class="detail-value">${hostName}</span>
          </div>
          ${event.tags && event.tags.length > 0 ? `
          <div class="detail-row">
            <span class="detail-label">🏷️ Tags:</span>
            <span class="detail-value">${event.tags.map(tag => `#${tag}`).join(', ')}</span>
          </div>
          ` : ''}
        </div>

        ${event.description || event.detailedDescription ? `
        <div class="description">
          <h3>About This Event</h3>
          <p>${event.detailedDescription || event.description}</p>
        </div>
        ` : ''}

        <div style="text-align: center;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/event/${event._id}" class="cta-button">
            View Event Details & RSVP
          </a>
        </div>

        <div class="footer">
          <p>Don't miss out on this exciting event! Click the button above to RSVP.</p>
          <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">
            You're receiving this email because you're registered as a student in Campus Connect.<br>
            To manage your notification preferences, please visit your account settings.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const sendNewEventNotification = async (event, users) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn('⚠️ Email credentials not configured. Skipping email notifications.');
      return {
        success: false,
        message: 'Email credentials not configured',
        sent: 0,
        failed: 0
      };
    }

    if (!users || users.length === 0) {
      console.log('📧 No users to send notifications to.');
      return {
        success: true,
        message: 'No users to notify',
        sent: 0,
        failed: 0
      };
    }

    const hostName = event.createdBy?.fullName || 'Campus Admin';

    const emailPromises = users.map(async (user) => {
      const mailOptions = {
        from: `"Campus Connect" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: `🎉 New Event: ${event.title}`,
        html: generateEventEmailHTML(event, hostName),
        text: `
New Event Alert: ${event.title}

Category: ${event.category}
Date: ${formatDate(event.date)}
Time: ${formatTime(event.date)}
Location: ${event.location || 'Location TBA'}
Hosted by: ${hostName}

${event.description || event.detailedDescription || ''}

View full event details and RSVP at: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/event/${event._id}
        `.trim()
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent successfully to ${user.email}`);
        return { success: true, email: user.email };
      } catch (error) {
        console.error(`❌ Failed to send email to ${user.email}:`, error.message);
        return { success: false, email: user.email, error: error.message };
      }
    });

    const results = await Promise.allSettled(emailPromises);

    const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failCount = results.length - successCount;

    console.log(`📧 Email notification summary: ${successCount} sent, ${failCount} failed out of ${users.length} total`);

    return {
      success: true,
      message: `Emails sent: ${successCount}/${users.length}`,
      sent: successCount,
      failed: failCount,
      total: users.length
    };

  } catch (error) {
    console.error('❌ Error in email notification service:', error);
    return {
      success: false,
      message: error.message,
      sent: 0,
      failed: users?.length || 0
    };
  }
};

const verifyEmailConfiguration = async () => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      return { configured: false, message: 'Email credentials not set' };
    }

    await transporter.verify();
    return { configured: true, message: 'Email service is ready' };
  } catch (error) {
    return { configured: false, message: error.message };
  }
};

module.exports = {
  sendNewEventNotification,
  verifyEmailConfiguration,
  transporter
};