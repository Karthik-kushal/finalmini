const mongoose = require('mongoose');

const rsvpSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  status: {
    type: String,
    enum: ['yes', 'no', 'maybe'],
    default: 'yes'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const RSVP = mongoose.model('RSVP', rsvpSchema);

module.exports = RSVP;
