const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const { verifyEmailConfiguration } = require('./services/emailService');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/event');
const rsvpRoutes = require('./routes/rsvp');

app.use('/api', authRoutes);
app.use('/api', eventRoutes);
app.use('/api', rsvpRoutes);

app.get('/api/test-email-config', async (req, res) => {
  const result = await verifyEmailConfiguration();
  res.json(result);
});



// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ MongoDB connected');
}).catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
});

app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);

  const emailConfig = await verifyEmailConfiguration();
  if (emailConfig.configured) {
    console.log('✅ Email service configured and ready');
  } else {
    console.log('⚠️ Email service not configured:', emailConfig.message);
    console.log('💡 Add EMAIL_USER and EMAIL_PASSWORD to .env file to enable notifications');
  }
});
