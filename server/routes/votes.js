const express = require('express');
const router = express.Router();
const Election = require('../models/Election');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Cast a vote
router.post('/:electionId', auth, async (req, res) => {
    try {
        const { candidateId } = req.body;
        const election = await Election.findById(req.params.electionId);

        if (!election) {
            return res.status(404).json({ message: 'Election not found' });
        }

        // Check if election is active
        if (!election.isActive()) {
            return res.status(400).json({ message: 'Election is not active' });
        }

        // Check if user has already voted
        if (election.voters.includes(req.user._id)) {
            return res.status(400).json({ message: 'You have already voted in this election' });
        }

        // Find and update candidate votes
        const candidate = election.candidates.id(candidateId);
        if (!candidate) {
            return res.status(404).json({ message: 'Candidate not found' });
        }

        candidate.votes += 1;
        election.totalVotes += 1;
        election.voters.push(req.user._id);

        // Update user's votedElections
        await User.findByIdAndUpdate(req.user._id, {
            $push: { votedElections: election._id }
        });

        await election.save();
        res.json({ message: 'Vote cast successfully', election });
    } catch (error) {
        res.status(500).json({ message: 'Error casting vote', error: error.message });
    }
});

// Get election results
router.get('/:electionId/results', async (req, res) => {
    try {
        const election = await Election.findById(req.params.electionId)
            .populate('voters', 'name email');

        if (!election) {
            return res.status(404).json({ message: 'Election not found' });
        }

        // Calculate percentages
        const results = election.candidates.map(candidate => ({
            ...candidate.toObject(),
            percentage: election.totalVotes > 0 
                ? ((candidate.votes / election.totalVotes) * 100).toFixed(2)
                : 0
        }));

        res.json({
            election: {
                title: election.title,
                description: election.description,
                status: election.status,
                totalVotes: election.totalVotes,
                results
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching results', error: error.message });
    }
});

module.exports = router; 