const express = require('express');
const router = express.Router();
const Election = require('../models/Election');
const auth = require('../middleware/auth');

// Get all elections
router.get('/', async (req, res) => {
    try {
        const elections = await Election.find()
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });
        res.json(elections);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching elections', error: error.message });
    }
});

// Get single election
router.get('/:id', async (req, res) => {
    try {
        const election = await Election.findById(req.params.id)
            .populate('createdBy', 'name email')
            .populate('voters', 'name email');
        
        if (!election) {
            return res.status(404).json({ message: 'Election not found' });
        }
        
        res.json(election);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching election', error: error.message });
    }
});

// Create new election (admin only)
router.post('/', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can create elections' });
        }

        const { title, description, startDate, endDate, candidates } = req.body;

        const election = new Election({
            title,
            description,
            startDate,
            endDate,
            candidates,
            createdBy: req.user._id
        });

        await election.save();
        res.status(201).json(election);
    } catch (error) {
        res.status(500).json({ message: 'Error creating election', error: error.message });
    }
});

// Update election (admin only)
router.put('/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can update elections' });
        }

        const election = await Election.findById(req.params.id);
        if (!election) {
            return res.status(404).json({ message: 'Election not found' });
        }

        const updates = Object.keys(req.body);
        updates.forEach(update => election[update] = req.body[update]);
        
        await election.save();
        res.json(election);
    } catch (error) {
        res.status(500).json({ message: 'Error updating election', error: error.message });
    }
});

// Delete election (admin only)
router.delete('/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can delete elections' });
        }

        const election = await Election.findByIdAndDelete(req.params.id);
        if (!election) {
            return res.status(404).json({ message: 'Election not found' });
        }

        res.json({ message: 'Election deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting election', error: error.message });
    }
});

module.exports = router; 