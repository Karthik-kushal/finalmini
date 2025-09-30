const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {           // short description
    type: String,
    trim: true
  },
  detailedDescription: {   // long/detailed description
    type: String,
    trim: true
  },
  date: {                  // combined date and time as one Date object
    type: Date,
    required: true
  },
  location: {
    type: String,
    trim: true
  },
  imageUrl: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: ['Tech', 'Cultural', 'Sports', 'Academic', 'Social', 'Others'],
    default: 'Others'
  },
  tags: [{
    type: String,
    trim: true
  }],
  rsvpCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
