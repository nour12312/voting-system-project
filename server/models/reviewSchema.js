const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true
  },

  customerEmail: {
    type: String,
    required: true
  },

  customerNumber: {
    type: String,
    required: true
  },

  comment: {
    type: String,
    required: true,
    maxlength: 1000,
  }

}, {
  timestamps: true 
});

module.exports = mongoose.model('Review', reviewSchema);
