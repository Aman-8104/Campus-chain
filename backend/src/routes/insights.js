const express = require('express');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/insights/weekly — last 7 days spending breakdown
router.get('/weekly', auth, async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const data = await Transaction.aggregate([
      {
        $match: {
          senderId: require('mongoose').Types.ObjectId.createFromHexString(req.user.id),
          status: 'completed',
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            day: { $dayOfWeek: '$createdAt' },
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    // Category breakdown (by transaction type)
    const byCategory = await Transaction.aggregate([
      {
        $match: {
          senderId: require('mongoose').Types.ObjectId.createFromHexString(req.user.id),
          status: 'completed',
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      { $group: { _id: '$type', total: { $sum: '$amount' } } }
    ]);

    res.json({ success: true, weekly: data, byCategory });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/insights/monthly — last 6 months spending
router.get('/monthly', auth, async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const sent = await Transaction.aggregate([
      {
        $match: {
          senderId: require('mongoose').Types.ObjectId.createFromHexString(req.user.id),
          status: 'completed',
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          spent: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const received = await Transaction.aggregate([
      {
        $match: {
          receiverId: require('mongoose').Types.ObjectId.createFromHexString(req.user.id),
          status: 'completed',
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          received: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({ success: true, monthly: { sent, received } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
