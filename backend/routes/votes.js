const express = require('express');
const router = express.Router();
const Vote = require('../models/Vote');
const Election = require('../models/Election');
const { authenticate, authorize } = require('../middleware/auth');

// Get all votes for an election (admin only)
router.get('/election/:electionId', authenticate, authorize('admin'), async (req, res) => {
  try {
    const votes = await Vote.getElectionVotes(req.params.electionId);
    res.json(votes.map(vote => vote.getPublicData()));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching votes', error: error.message });
  }
});

// Get user's votes
router.get('/my-votes', authenticate, async (req, res) => {
  try {
    const votes = await Vote.find({ user: req.user.userId })
      .populate('election', 'title description')
      .populate('candidate', 'name')
      .sort({ timestamp: -1 });

    res.json(votes.map(vote => vote.getPublicData()));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching votes', error: error.message });
  }
});

// Check if user has voted in an election
router.get('/check/:electionId', authenticate, async (req, res) => {
  try {
    const hasVoted = await Vote.hasVoted(req.params.electionId, req.user.userId);
    res.json({ hasVoted });
  } catch (error) {
    res.status(500).json({ message: 'Error checking vote', error: error.message });
  }
});

// Get vote statistics for an election (admin only)
router.get('/stats/:electionId', authenticate, authorize('admin'), async (req, res) => {
  try {
    const election = await Election.findById(req.params.electionId);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    const totalVotes = election.candidates.reduce((sum, candidate) => sum + candidate.votes, 0);
    const stats = election.candidates.map(candidate => ({
      name: candidate.name,
      votes: candidate.votes,
      percentage: totalVotes > 0 ? (candidate.votes / totalVotes) * 100 : 0
    }));

    res.json({
      electionTitle: election.title,
      totalVotes,
      stats
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching vote statistics', error: error.message });
  }
});

// Delete a vote (admin only)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const vote = await Vote.findById(req.params.id);
    if (!vote) {
      return res.status(404).json({ message: 'Vote not found' });
    }

    // Update election candidate vote count
    const election = await Election.findById(vote.election);
    if (election) {
      const candidate = election.candidates.id(vote.candidate);
      if (candidate) {
        candidate.votes = Math.max(0, candidate.votes - 1);
        await election.save();
      }
    }

    await vote.remove();
    res.json({ message: 'Vote deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting vote', error: error.message });
  }
});

module.exports = router; 