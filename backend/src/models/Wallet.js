const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  balance: { type: Number, default: 0.0, min: 0 },
  currency: { type: String, default: 'USD' },
  dailyLimit: { type: Number, default: 5000 },
  monthlyInflow: { type: Number, default: 0 },
  monthlyOutflow: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Wallet', walletSchema);
