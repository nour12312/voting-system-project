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
        enum: ['upcoming', 'active', 'completed'],
        default: 'upcoming'
    },
    candidates: [candidateSchema],
    totalVotes: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    voters: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true
});

// Method to check if election is active
electionSchema.methods.isActive = function() {
    const now = new Date();
    return now >= this.startDate && now <= this.endDate;
};

// Method to update election status
electionSchema.methods.updateStatus = function() {
    const now = new Date();
    if (now < this.startDate) {
        this.status = 'upcoming';
    } else if (now > this.endDate) {
        this.status = 'completed';
    } else {
        this.status = 'active';
    }
    return this.save();
};

const Election = mongoose.model('Election', electionSchema);

module.exports = Election; 