const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Election = require('../models/Election');
const Vote = require('../models/Vote');
const { authenticate, authorize } = require('../middleware/auth');

// Validation middleware
const validateElection = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('candidates').isArray({ min: 2 }).withMessage('At least 2 candidates are required'),
  body('candidates.*.name').trim().notEmpty().withMessage('Candidate name is required')
];

// Get all active elections (public)
router.get('/', async (req, res) => {
  try {
    const elections = await Election.find({
      $or: [
        { status: 'active' },
        { status: 'completed' }
      ]
    }).sort({ startDate: -1 });

    res.json(elections.map(election => election.getPublicData()));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching elections', error: error.message });
  }
});

// Get all elections (admin only)
router.get('/admin', authenticate, authorize('admin'), async (req, res) => {
  try {
    const elections = await Election.find().sort({ createdAt: -1 });
    res.json(elections.map(election => election.getPublicData()));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching elections', error: error.message });
  }
});

// Get single election
router.get('/:id', async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }
    res.json(election.getPublicData());
  } catch (error) {
    res.status(500).json({ message: 'Error fetching election', error: error.message });
  }
});

// Create election (admin only)
router.post('/', authenticate, authorize('admin'), validateElection, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const election = new Election({
      ...req.body,
      createdBy: req.user.userId
    });

    await election.save();
    res.status(201).json(election.getPublicData());
  } catch (error) {
    res.status(500).json({ message: 'Error creating election', error: error.message });
  }
});

// Update election (admin only)
router.patch('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    // Don't allow updating if election is completed
    if (election.status === 'completed') {
      return res.status(400).json({ message: 'Cannot update completed election' });
    }

    // Update allowed fields
    const allowedUpdates = ['title', 'description', 'startDate', 'endDate', 'status'];
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        election[key] = req.body[key];
      }
    });

    await election.save();
    res.json(election.getPublicData());
  } catch (error) {
    res.status(500).json({ message: 'Error updating election', error: error.message });
  }
});

// Delete election (admin only)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    // Don't allow deleting if election is active or completed
    if (election.status !== 'draft') {
      return res.status(400).json({ message: 'Cannot delete active or completed election' });
    }

    await election.remove();
    res.json({ message: 'Election deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting election', error: error.message });
  }
});

// Submit vote
router.post('/:id/vote', authenticate, async (req, res) => {
  try {
    const { candidateId } = req.body;
    if (!candidateId) {
      return res.status(400).json({ message: 'Candidate ID is required' });
    }

    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    // Check if election is active
    if (!election.isActive()) {
      return res.status(400).json({ message: 'Election is not active' });
    }

    // Check if user has already voted
    const hasVoted = await Vote.hasVoted(election._id, req.user.userId);
    if (hasVoted) {
      return res.status(400).json({ message: 'You have already voted in this election' });
    }

    // Check if candidate exists
    const candidate = election.candidates.id(candidateId);
    if (!candidate) {
      return res.status(400).json({ message: 'Invalid candidate' });
    }

    // Create vote
    const vote = new Vote({
      election: election._id,
      user: req.user.userId,
      candidate: candidateId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    await vote.save();

    // Update candidate vote count
    candidate.votes += 1;
    await election.save();

    res.json({ message: 'Vote submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting vote', error: error.message });
  }
});

// Get election results
router.get('/:id/results', async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    // Only show results if election is completed
    if (election.status !== 'completed') {
      return res.status(403).json({ message: 'Results are not available yet' });
    }

    const results = election.candidates.map(candidate => ({
      name: candidate.name,
      votes: candidate.votes
    }));

    res.json({
      title: election.title,
      totalVotes: results.reduce((sum, candidate) => sum + candidate.votes, 0),
      results
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching results', error: error.message });
  }
});

module.exports = router; 