const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Event = require('../models/Event');
const User = require('../models/User');

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

    res.status(201).json(event);

  } catch (err) {
    console.error('Error creating event:', err);
    next(err); // Pass to express error handler middleware
  }
});

// GET /api/events (List all events)
router.get('/events', async (req, res, next) => {
  try {
    const events = await Event.find()
      .populate('createdBy', 'fullName email')
      .exec();
    res.status(200).json(events);
  } catch (err) {
    console.error('Error fetching events:', err);
    next(err);
  }
});

module.exports = router;
