const express = require('express');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { generateTxHash, getChainTip } = require('../utils/blockchain');

const router = express.Router();

// GET /api/wallet — get current user's wallet
router.get('/', auth, async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ userId: req.user.id }).populate('userId', 'name email campusId');
    if (!wallet) return res.status(404).json({ success: false, message: 'Wallet not found' });
    res.json({ success: true, wallet });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/wallet/topup — add funds (admin can topup any user, students topup themselves)
router.post('/topup', auth, async (req, res) => {
  try {
    const { amount, targetUserId } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid amount required' });
    }
    const userId = (req.user.role === 'admin' && targetUserId) ? targetUserId : req.user.id;
    const wallet = await Wallet.findOneAndUpdate(
      { userId },
      {
        $inc: { balance: amount, monthlyInflow: amount },
        updatedAt: new Date()
      },
      { new: true }
    );
    if (!wallet) return res.status(404).json({ success: false, message: 'Wallet not found' });

    // Create blockchain transaction record for topup
    const prevHash = await getChainTip(Transaction);
    const lastTx = await Transaction.findOne().sort({ blockIndex: -1 });
    const blockIndex = lastTx ? lastTx.blockIndex + 1 : 0;
    const txHash = generateTxHash(prevHash, {
      senderId: req.user.id, receiverId: userId, amount, timestamp: Date.now()
    });
    await Transaction.create({
      senderId: req.user.id,
      receiverId: userId,
      amount,
      type: 'topup',
      status: 'completed',
      txHash,
      prevHash,
      blockIndex,
      note: 'Wallet Top-Up'
    });

    res.json({ success: true, wallet, message: `$${amount} added successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/wallet/all — admin only: list all wallets
router.get('/all', auth, role('admin'), async (req, res) => {
  try {
    const wallets = await Wallet.find().populate('userId', 'name email role campusId');
    res.json({ success: true, wallets });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
