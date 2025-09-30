const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const RSVP = require('../models/RSVP');
const Event = require('../models/Event');
const User = require('../models/User');

// POST /api/rsvps (Create RSVP)
router.post('/rsvps', async (req, res) => {
  try {
    const { userId, eventId } = req.body;

    const existing = await RSVP.findOne({ user: userId, event: eventId });
    if (existing) return res.status(400).json({ message: 'Already RSVPed' });

    const rsvp = new RSVP({ user: userId, event: eventId });
    await rsvp.save();

    res.status(201).json(rsvp);
  } catch (err) {
    res.status(500).json({ message: 'Failed to RSVP' });
  }
});

// GET /api/rsvps/:userId (List RSVPs by user)
router.get('/rsvps/:userId', async (req, res) => {
  try {
    const rsvps = await RSVP.find({ user: req.params.userId }).populate('event');
    res.status(200).json(rsvps);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch RSVPs' });
  }
});

// POST /api/events/:eventId/rsvp (Toggle RSVP for an event)
router.post('/events/:eventId/rsvp', async (req, res) => {
  try {
    const { eventId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(eventId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid event or user ID' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const existingRSVP = await RSVP.findOne({ user: userId, event: eventId });

    if (existingRSVP) {
      await RSVP.deleteOne({ _id: existingRSVP._id });
      await Event.findByIdAndUpdate(eventId, { $inc: { rsvpCount: -1 } });
      return res.status(200).json({ message: 'RSVP removed', isRSVPed: false });
    } else {
      const rsvp = new RSVP({ user: userId, event: eventId });
      await rsvp.save();
      await Event.findByIdAndUpdate(eventId, { $inc: { rsvpCount: 1 } });
      return res.status(201).json({ message: 'RSVP created', isRSVPed: true });
    }
  } catch (err) {
    console.error('Error toggling RSVP:', err);
    res.status(500).json({ message: 'Failed to toggle RSVP' });
  }
});

// GET /api/events/:eventId/rsvp/:userId (Check if user has RSVPed to event)
router.get('/events/:eventId/rsvp/:userId', async (req, res) => {
  try {
    const { eventId, userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid event or user ID' });
    }

    const rsvp = await RSVP.findOne({ user: userId, event: eventId });
    res.status(200).json({ isRSVPed: !!rsvp });
  } catch (err) {
    console.error('Error checking RSVP:', err);
    res.status(500).json({ message: 'Failed to check RSVP status' });
  }
});

module.exports = router;
