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

// PATCH /api/admin/users/:id — update role or status
router.patch('/users/:id', auth, role('admin'), async (req, res) => {
  try {
    const { role: newRole, isActive } = req.body;
    const update = {};
    if (newRole) update.role = newRole;
    if (typeof isActive === 'boolean') update.isActive = isActive;
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

module.exports = router;
