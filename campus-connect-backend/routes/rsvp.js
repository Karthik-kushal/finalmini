const express = require('express');
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

module.exports = router;
