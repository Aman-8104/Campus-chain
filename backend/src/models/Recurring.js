const mongoose = require('mongoose');

const recurringSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true, min: 0.01 },
  frequency: { type: String, enum: ['daily', 'weekly', 'monthly'], required: true },
  label: { type: String, default: 'Recurring Payment' },
  nextRun: { type: Date, required: true },
  active: { type: Boolean, default: true },
  lastRun: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Recurring', recurringSchema);
