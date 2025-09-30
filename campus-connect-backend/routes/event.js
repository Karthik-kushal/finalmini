const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Event = require('../models/Event');
const User = require('../models/User');
const { sendNewEventNotification } = require('../services/emailService');

// POST /api/events (Create an event)
router.post('/events', async (req, res, next) => {
  try {
    const { 
      title, 
      description, 
      detailedDescription, 
      date, 
      location, 
      imageUrl, 
      createdBy, 
      category, 
      tags 
    } = req.body;

    // Validate required fields exist
    if (!title || !date || !createdBy) {
      return res.status(400).json({ message: 'Title, date and createdBy fields are required.' });
    }

    // Validate createdBy as valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(createdBy)) {
      return res.status(400).json({ message: 'Invalid createdBy user ID.' });
    }

    // Optionally check if user exists (recommended)
    const userExists = await User.exists({ _id: createdBy });
    if (!userExists) {
      return res.status(404).json({ message: 'User not found for createdBy field.' });
    }

    const event = new Event({
      title,
      description,
      detailedDescription,
      date,
      location,
      imageUrl,
      createdBy,
      category,
      tags
    });

    await event.save();

    const populatedEvent = await Event.findById(event._id)
      .populate('createdBy', 'fullName email')
      .exec();

    setImmediate(async () => {
      try {
        const students = await User.find({ role: 'student' }).select('email fullName');

        if (students && students.length > 0) {
          console.log(`📧 Sending event notifications to ${students.length} students...`);
          const emailResult = await sendNewEventNotification(populatedEvent, students);
          console.log(`📧 Email notification result:`, emailResult);
        } else {
          console.log('ℹ️ No students found to notify.');
        }
      } catch (emailError) {
        console.error('❌ Error sending email notifications:', emailError);
      }
    });

    res.status(201).json(populatedEvent);

  } catch (err) {
    console.error('Error creating event:', err);
    next(err); // Pass to express error handler middleware
  }
});

// GET /api/events (List all events with optional category filter)
router.get('/events', async (req, res, next) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};

    const events = await Event.find(filter)
      .populate('createdBy', 'fullName email')
      .exec();
    res.status(200).json(events);
  } catch (err) {
    console.error('Error fetching events:', err);
    next(err);
  }
});

// GET /api/events/:id (Get single event by ID)
router.get('/events/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }

    const event = await Event.findById(id)
      .populate('createdBy', 'fullName email')
      .exec();

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.status(200).json(event);
  } catch (err) {
    console.error('Error fetching event:', err);
    next(err);
  }
});

module.exports = router;
