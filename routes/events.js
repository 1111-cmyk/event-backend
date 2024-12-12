const express = require('express');
const Event = require('../models/Event');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Create Event
router.post('/', authMiddleware, async (req, res) => {
    const { title, description, date } = req.body;

    try {
        const event = await Event.create({
            title,
            description,
            date,
            user: req.user._id, // Linking the event to the logged-in user
        });
        res.json(event);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get Events
router.get('/', authMiddleware, async (req, res) => {
    try {
        const events = await Event.find({ user: req.user._id })
        res.json(events);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (event.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You do not have permission to edit this event' });
        }

        res.json(event);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update Event
router.put('/:id', authMiddleware, async (req, res) => {
    const { title, description, date } = req.body;

    try {
        const event = await Event.findById(req.params.id);

        // Check if the event exists and if the logged-in user is the owner of the event
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (event.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You do not have permission to edit this event' });
        }

        // Update the event
        event.title = title || event.title;
        event.description = description || event.description;
        event.date = date || event.date;

        await event.save();

        res.json(event);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete Event
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (event.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You do not have permission to delete this event' });
        }

        await Event.findByIdAndDelete(req.params.id);
        res.json({ message: 'Event deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
        console.log(err);
    }
});

module.exports = router;
