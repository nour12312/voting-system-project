const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  election: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Election',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  }
});

// Compound index to ensure one vote per user per election
voteSchema.index({ election: 1, user: 1 }, { unique: true });

// Method to get public vote data
voteSchema.methods.getPublicData = function() {
  return {
    _id: this._id,
    election: this.election,
    candidate: this.candidate,
    timestamp: this.timestamp
  };
};

// Static method to check if user has voted in an election
voteSchema.statics.hasVoted = async function(electionId, userId) {
  const vote = await this.findOne({ election: electionId, user: userId });
  return !!vote;
};

// Static method to get vote count for a candidate in an election
voteSchema.statics.getCandidateVotes = async function(electionId, candidateId) {
  return this.countDocuments({ election: electionId, candidate: candidateId });
};

// Static method to get all votes for an election
voteSchema.statics.getElectionVotes = async function(electionId) {
  return this.find({ election: electionId })
    .populate('user', 'name email')
    .populate('candidate', 'name');
};

const Vote = mongoose.model('Vote', voteSchema);

module.exports = Vote; 