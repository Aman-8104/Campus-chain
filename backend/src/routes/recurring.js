const express = require('express');
const Recurring = require('../models/Recurring');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/recurring
router.get('/', auth, async (req, res) => {
  try {
    const recurring = await Recurring.find({ userId: req.user.id })
      .populate('receiverId', 'name email campusId');
    res.json({ success: true, recurring });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/recurring
router.post('/', auth, async (req, res) => {
  try {
    const { receiverEmail, amount, frequency, label } = req.body;
    if (!receiverEmail || !amount || !frequency) {
      return res.status(400).json({ success: false, message: 'Receiver, amount and frequency required' });
    }
    const receiver = await User.findOne({ email: receiverEmail });
    if (!receiver) return res.status(404).json({ success: false, message: 'Recipient not found' });

    // Calculate next run based on frequency
    const now = new Date();
    const nextRun = new Date(now);
    if (frequency === 'daily') nextRun.setDate(nextRun.getDate() + 1);
    else if (frequency === 'weekly') nextRun.setDate(nextRun.getDate() + 7);
    else if (frequency === 'monthly') nextRun.setMonth(nextRun.getMonth() + 1);

    const rec = await Recurring.create({
      userId: req.user.id,
      receiverId: receiver._id,
      amount,
      frequency,
      label: label || `Payment to ${receiver.name}`,
      nextRun,
    });
    res.status(201).json({ success: true, recurring: rec });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PATCH /api/recurring/:id/toggle — pause/resume
router.patch('/:id/toggle', auth, async (req, res) => {
  try {
    const rec = await Recurring.findOne({ _id: req.params.id, userId: req.user.id });
    if (!rec) return res.status(404).json({ success: false, message: 'Not found' });
    rec.active = !rec.active;
    await rec.save();
    res.json({ success: true, recurring: rec });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/recurring/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    await Recurring.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
