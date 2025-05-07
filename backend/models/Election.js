const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  imageUrl: String,
  votes: {
    type: Number,
    default: 0
  }
});

const electionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'completed'],
    default: 'draft'
  },
  candidates: [candidateSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  eligibleVoters: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  hasVoted: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  settings: {
    requireAuthentication: {
      type: Boolean,
      default: true
    },
    allowMultipleVotes: {
      type: Boolean,
      default: false
    },
    showResultsBeforeEnd: {
      type: Boolean,
      default: false
    },
    requireMFA: {
      type: Boolean,
      default: false
    }
  },
  results: {
    totalVotes: {
      type: Number,
      default: 0
    },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate'
    },
    lastUpdated: Date
  }
}, {
  timestamps: true
});

// Update the updatedAt timestamp before saving
electionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
electionSchema.index({ status: 1, startDate: 1, endDate: 1 });

// Method to check if election is active
electionSchema.methods.isActive = function() {
  const now = new Date();
  return this.status === 'active' && now >= this.startDate && now <= this.endDate;
};

// Method to get public election data
electionSchema.methods.getPublicData = function() {
  return {
    _id: this._id,
    title: this.title,
    description: this.description,
    startDate: this.startDate,
    endDate: this.endDate,
    status: this.status,
    candidates: this.candidates.map(candidate => ({
      _id: candidate._id,
      name: candidate.name,
      votes: candidate.votes
    })),
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Static method to find active elections
electionSchema.statics.findActive = function() {
  const now = new Date();
  return this.find({
    status: 'active',
    startDate: { $lte: now },
    endDate: { $gte: now }
  });
};

// Static method to find completed elections
electionSchema.statics.findCompleted = function() {
  const now = new Date();
  return this.find({
    $or: [
      { status: 'completed' },
      { endDate: { $lt: now } }
    ]
  });
};

// Method to check if user can vote
electionSchema.methods.canVote = function(userId) {
  if (!this.isActive()) return false;
  if (this.hasVoted.includes(userId)) return false;
  if (this.settings.requireAuthentication && !this.eligibleVoters.includes(userId)) return false;
  return true;
};

// Method to record a vote
electionSchema.methods.recordVote = async function(userId, candidateId) {
  if (!this.canVote(userId)) {
    throw new Error('User cannot vote in this election');
  }

  const candidate = this.candidates.id(candidateId);
  if (!candidate) {
    throw new Error('Invalid candidate');
  }

  candidate.votes += 1;
  this.hasVoted.push(userId);
  this.results.totalVotes += 1;
  this.results.lastUpdated = new Date();

  // Update winner if necessary
  const maxVotes = Math.max(...this.candidates.map(c => c.votes));
  const winners = this.candidates.filter(c => c.votes === maxVotes);
  if (winners.length === 1) {
    this.results.winner = winners[0]._id;
  }

  await this.save();
};

const Election = mongoose.model('Election', electionSchema);

module.exports = Election; 