const express = require('express');
const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const User = require('../models/User');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const { generateTxHash, getChainTip } = require('../utils/blockchain');

const router = express.Router();

// GET /api/transactions — get current user's transaction history
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status } = req.query;
    const filter = {
      $or: [{ senderId: req.user.id }, { receiverId: req.user.id }]
    };
    if (type) filter.type = type;
    if (status) filter.status = status;

    const total = await Transaction.countDocuments(filter);
    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('senderId', 'name email campusId avatar')
      .populate('receiverId', 'name email campusId avatar');

    res.json({ success: true, transactions, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/transactions/search-user?email=... — find recipient (legacy)
router.get('/search-user', auth, async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ success: false, message: 'Email required' });
    const user = await User.findOne({ email }).select('name email campusId avatar');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    console.error('Search User Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/transactions/search-users?q=... — autocomplete dropdown
router.get('/search-users', auth, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json({ success: true, users: [] });
    
    // Exclude current user from search
    const users = await User.find({
      _id: { $ne: req.user.id },
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { campusId: { $regex: q, $options: 'i' } }
      ]
    }).select('name email campusId avatar').limit(5);
    
    res.json({ success: true, users });
  } catch (err) {
    console.error('Search Users Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/transactions/:id — get single transaction detail
router.get('/:id', auth, async (req, res) => {
  try {
    const tx = await Transaction.findById(req.params.id)
      .populate('senderId', 'name email campusId avatar')
      .populate('receiverId', 'name email campusId avatar');
    if (!tx) return res.status(404).json({ success: false, message: 'Transaction not found' });
    // Verify user is sender or receiver
    const isParty = tx.senderId._id.toString() === req.user.id || tx.receiverId._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isParty && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    res.json({ success: true, transaction: tx });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/transactions/send — send money (atomic debit/credit with blockchain hash)
router.post('/send', auth, async (req, res) => {
  try {
    const { receiverEmail, amount, note, type = 'p2p' } = req.body;
    if (!receiverEmail || !amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Receiver email and valid amount required' });
    }
    if (receiverEmail === req.user.email) {
      return res.status(400).json({ success: false, message: 'Cannot send money to yourself' });
    }

    const receiver = await User.findOne({ email: receiverEmail });
    if (!receiver) {
      return res.status(404).json({ success: false, message: 'Recipient not found' });
    }

    // Check sender balance
    const senderWallet = await Wallet.findOne({ userId: req.user.id });
    if (!senderWallet || senderWallet.balance < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient balance' });
    }

    // Debit sender
    await Wallet.findOneAndUpdate(
      { userId: req.user.id },
      { $inc: { balance: -amount, monthlyOutflow: amount } }
    );
    
    // Credit receiver
    await Wallet.findOneAndUpdate(
      { userId: receiver._id },
      { $inc: { balance: amount, monthlyInflow: amount } },
      { upsert: true }
    );

    // Generate blockchain hash
    const prevHash = await getChainTip(Transaction);
    const lastTx = await Transaction.findOne().sort({ blockIndex: -1 });
    const blockIndex = lastTx ? lastTx.blockIndex + 1 : 0;
    const txHash = generateTxHash(prevHash, {
      senderId: req.user.id, receiverId: receiver._id, amount, timestamp: Date.now()
    });

    const newTx = await Transaction.create([{
      senderId: req.user.id,
      receiverId: receiver._id,
      amount,
      type,
      status: 'completed',
      note: note || '',
      txHash,
      prevHash,
      blockIndex,
    }]);

    // Create notifications for both parties
    await Notification.create([
      {
        userId: receiver._id,
        title: 'Payment Received',
        body: `You received $${amount.toFixed(2)} from ${req.user.name}`,
        type: 'transaction',
        metadata: { txId: newTx[0]._id }
      },
      {
        userId: req.user.id,
        title: 'Payment Sent',
        body: `$${amount.toFixed(2)} sent to ${receiver.name}`,
        type: 'transaction',
        metadata: { txId: newTx[0]._id }
      }
    ]);

    const populated = await Transaction.findById(newTx[0]._id)
      .populate('senderId', 'name email campusId')
      .populate('receiverId', 'name email campusId');

    res.status(201).json({ success: true, transaction: populated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Transaction failed: ' + err.message });
  }
});


module.exports = router;
