const express = require('express');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

const router = express.Router();

// GET /api/admin/stats — platform-wide analytics
router.get('/stats', auth, role('admin'), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTransactions = await Transaction.countDocuments();
    const volumeResult = await Transaction.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const grossVolume = volumeResult[0]?.total || 0;
    const successRate = totalTransactions > 0
      ? ((await Transaction.countDocuments({ status: 'completed' })) / totalTransactions * 100).toFixed(2)
      : 100;

    // Monthly breakdown for chart
    const monthlyData = await Transaction.aggregate([
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          volume: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    // Volume by type
    const volumeByType = await Transaction.aggregate([
      { $group: { _id: '$type', total: { $sum: '$amount' } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalTransactions,
        grossVolume,
        successRate: Number(successRate),
        activeNodes: 1204,
        systemIntegrity: 99.98,
        monthlyData,
        volumeByType
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/admin/users — list all users with wallet info
router.get('/users', auth, role('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const filter = search ? { $or: [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }] } : {};
    const users = await User.find(filter)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await User.countDocuments(filter);

    // Attach wallet balances
    const enhanced = await Promise.all(users.map(async u => {
      const wallet = await Wallet.findOne({ userId: u._id }).lean();
      return { ...u.toObject(), balance: wallet?.balance || 0 };
    }));

    res.json({ success: true, users: enhanced, total, page: Number(page) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PATCH /api/admin/users/:id — toggle active/suspended status or transaction block
router.patch('/users/:id', auth, role('admin'), async (req, res) => {
  try {
    const { isActive, txBlocked } = req.body;
    const update = {};
    if (typeof isActive === 'boolean') update.isActive = isActive;
    if (typeof txBlocked === 'boolean') update.txBlocked = txBlocked;
    if (Object.keys(update).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields to update' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('-passwordHash');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/admin/transactions — all transactions (admin view)
router.get('/transactions', auth, role('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const transactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('senderId', 'name email')
      .populate('receiverId', 'name email');
    const total = await Transaction.countDocuments();
    res.json({ success: true, transactions, total });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/admin/fund-user — admin sends funds to any user's wallet
router.post('/fund-user', auth, role('admin'), async (req, res) => {
  try {
    const { targetUserId, amount, note } = req.body;
    if (!targetUserId || !amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Target user and valid amount required' });
    }

    const Wallet = require('../models/Wallet');
    const Transaction = require('../models/Transaction');
    const { generateTxHash, getChainTip } = require('../utils/blockchain');

    const targetUser = await User.findById(targetUserId).select('name email campusId');
    if (!targetUser) return res.status(404).json({ success: false, message: 'Target user not found' });

    const wallet = await Wallet.findOneAndUpdate(
      { userId: targetUserId },
      { $inc: { balance: amount, monthlyInflow: amount }, updatedAt: new Date() },
      { new: true }
    );
    if (!wallet) return res.status(404).json({ success: false, message: 'Wallet not found for target user' });

    const prevHash = await getChainTip(Transaction);
    const lastTx = await Transaction.findOne().sort({ blockIndex: -1 });
    const blockIndex = lastTx ? lastTx.blockIndex + 1 : 0;
    const txHash = generateTxHash(prevHash, {
      senderId: req.user.id, receiverId: targetUserId, amount, timestamp: Date.now()
    });

    const tx = await Transaction.create({
      senderId: req.user.id,
      receiverId: targetUserId,
      amount,
      type: 'topup',
      status: 'completed',
      txHash,
      prevHash,
      blockIndex,
      note: note || `Admin Fund Transfer to ${targetUser.name}`
    });

    res.json({ success: true, wallet, transaction: tx, message: `$${Number(amount).toFixed(2)} sent to ${targetUser.name}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/admin/vendor-requests — list pending vendor applications
router.get('/vendor-requests', auth, role('admin'), async (req, res) => {
  try {
    const vendors = await User.find({ role: 'vendor', status: { $in: ['pending', 'rejected'] } })
      .select('-passwordHash')
      .sort({ createdAt: -1 });
    res.json({ success: true, vendors });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PATCH /api/admin/vendor-requests/:id/approve
router.patch('/vendor-requests/:id/approve', auth, role('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id, { status: 'active', isActive: true }, { new: true }
    ).select('-passwordHash');
    if (!user) return res.status(404).json({ success: false, message: 'Vendor not found' });
    const existingWallet = await Wallet.findOne({ userId: user._id });
    if (!existingWallet) await Wallet.create({ userId: user._id, balance: 0 });
    res.json({ success: true, user, message: `${user.businessName || user.name} approved` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PATCH /api/admin/vendor-requests/:id/reject
router.patch('/vendor-requests/:id/reject', auth, role('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id, { status: 'rejected' }, { new: true }
    ).select('-passwordHash');
    if (!user) return res.status(404).json({ success: false, message: 'Vendor not found' });
    res.json({ success: true, user, message: `${user.businessName || user.name} application rejected` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
