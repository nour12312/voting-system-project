const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerNumber: { type: String, required: true },
  deliveryAddress: { type: String, required: true, trim: true },
  foodOrder: { type: String, required: true },

status: {
  type: String,
  enum: ['ongoing', 'completed', 'canceled', 'queued'],
  default: 'ongoing'
},


  startedAt: {
    type: Date,
    default: null
  }

}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
