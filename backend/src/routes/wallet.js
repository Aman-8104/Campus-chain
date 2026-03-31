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
