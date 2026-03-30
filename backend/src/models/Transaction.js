const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true, min: 0.01 },
  type: { type: String, enum: ['p2p', 'topup', 'fee', 'qr', 'recurring'], default: 'p2p' },
  status: { type: String, enum: ['completed', 'pending', 'failed'], default: 'completed' },
  note: { type: String, default: '' },
  // Blockchain fields
  txHash: { type: String, required: true, unique: true },
  prevHash: { type: String, required: true },
  blockIndex: { type: Number, required: true },
}, { timestamps: true });

// Index for fast history queries
transactionSchema.index({ senderId: 1, createdAt: -1 });
transactionSchema.index({ receiverId: 1, createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
