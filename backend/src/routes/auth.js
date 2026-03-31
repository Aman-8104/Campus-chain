const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Wallet = require('../models/Wallet');

const router = express.Router();

const CAMPUS_DOMAIN = '@campus.edu';

// POST /api/auth/register  — student (campus email only, immediate active)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, department, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }
    if (!email.toLowerCase().endsWith(CAMPUS_DOMAIN)) {
      return res.status(400).json({ success: false, message: `Only institutional emails ending in ${CAMPUS_DOMAIN} are allowed for student registration` });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email: email.toLowerCase(), passwordHash, role: 'student', department, phone, status: 'active' });
    await Wallet.create({ userId: user._id, balance: 500.0 });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, name: user.name, campusId: user.campusId },
      process.env.JWT_SECRET, { expiresIn: '7d' }
    );
    res.status(201).json({
      success: true, token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, campusId: user.campusId }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/auth/vendor-register  — vendor (any email, goes PENDING until admin approves)
router.post('/vendor-register', async (req, res) => {
  try {
    const { name, email, password, phone, businessName, businessType, businessDescription } = req.body;
    if (!name || !email || !password || !businessName || !businessType) {
      return res.status(400).json({ success: false, message: 'Name, email, password, business name and type are required' });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 12);
    await User.create({
      name, email: email.toLowerCase(), passwordHash,
      role: 'vendor', status: 'pending',
      phone: phone || '', businessName, businessType,
      businessDescription: businessDescription || '',
    });
    // No wallet or token — account must be approved first
    res.status(201).json({ success: true, message: 'Application submitted. You will be notified once the admin approves your account.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password are required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    // Block pending/rejected accounts
    if (user.status === 'pending') {
      return res.status(403).json({ success: false, message: 'Your account is pending admin approval. Please check back later.' });
    }
    if (user.status === 'rejected') {
      return res.status(403).json({ success: false, message: 'Your account application was not approved. Please contact administration.' });
    }
    if (user.isActive === false) {
      return res.status(403).json({ success: false, message: 'Your account has been suspended. Please contact administration.' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, name: user.name, campusId: user.campusId },
      process.env.JWT_SECRET, { expiresIn: '7d' }
    );
    res.json({
      success: true, token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, campusId: user.campusId }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/auth/me
router.get('/me', require('../middleware/auth'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
