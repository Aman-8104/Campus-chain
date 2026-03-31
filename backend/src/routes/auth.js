const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const { sendOtpEmail, sendResetEmail } = require('../utils/email');

const router = express.Router();

// In-memory OTP store: { recoveryEmail -> { otp, expiry } }
const otpStore = new Map();

const CAMPUS_DOMAIN = '@campus.edu';

// POST /api/auth/register  — student (campus email only, immediate active)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, department, phone, recoveryEmail, otpCode } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }
    if (!email.toLowerCase().endsWith(CAMPUS_DOMAIN)) {
      return res.status(400).json({ success: false, message: `Only institutional emails ending in ${CAMPUS_DOMAIN} are allowed for student registration` });
    }
    if (!recoveryEmail || !otpCode) {
      return res.status(400).json({ success: false, message: 'Recovery Gmail and OTP verification are required' });
    }

    // Verify OTP from in-memory store
    const stored = otpStore.get(recoveryEmail);
    if (!stored || stored.otp !== otpCode || stored.expiry < Date.now()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP. Please request a new code.' });
    }
    otpStore.delete(recoveryEmail); // one-time use

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name, email: email.toLowerCase(), passwordHash,
      role: 'student', department, phone,
      recoveryEmail, otpCode: null, otpExpiry: null,
      status: 'active',
    });
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

// PATCH /api/auth/change-password
router.patch('/change-password', require('../middleware/auth'), async (req, res) => {
  try {
    const { current, newPw, confirm } = req.body;
    if (!current || !newPw || !confirm)
      return res.status(400).json({ success: false, message: 'All password fields are required' });
    if (newPw.length < 8)
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters' });
    if (newPw !== confirm)
      return res.status(400).json({ success: false, message: 'New passwords do not match' });

    const user = await User.findById(req.user.id);
    const isMatch = await user.comparePassword(current);
    if (!isMatch)
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });

    user.passwordHash = await bcrypt.hash(newPw, 12);
    await user.save();
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PATCH /api/auth/me — update profile (name, phone, department)
router.patch('/me', require('../middleware/auth'), async (req, res) => {
  try {
    const { name, phone, department } = req.body;
    const updates = {};
    if (name && name.trim())       updates.name       = name.trim();
    if (phone !== undefined)       updates.phone      = phone.trim();
    if (department !== undefined)  updates.department = department.trim();

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'Nothing to update' });
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-passwordHash');
    res.json({ success: true, message: 'Profile updated successfully', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/auth/send-otp — send verification OTP to recovery Gmail
router.post('/send-otp', async (req, res) => {
  try {
    const { name, recoveryEmail } = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!recoveryEmail || !emailRegex.test(recoveryEmail)) {
      return res.status(400).json({ success: false, message: 'A valid personal email address is required' });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(recoveryEmail, { otp, expiry: Date.now() + 10 * 60 * 1000 }); // 10 min
    await sendOtpEmail(recoveryEmail, otp, name || 'User');
    res.json({ success: true, message: `Verification code sent to ${recoveryEmail}` });
  } catch (err) {
    console.error('OTP error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to send OTP. Check your email address and SMTP settings.' });
  }
});

// POST /api/auth/forgot-password — send reset link to recovery Gmail
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user || !user.recoveryEmail) {
      // Don't reveal if user exists
      return res.json({ success: true, message: 'If that email is registered, a reset link has been sent.' });
    }
    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken = token;
    user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    await sendResetEmail(user.recoveryEmail, resetLink, user.name);
    res.json({ success: true, message: 'Password reset link sent to your recovery Gmail.' });
  } catch (err) {
    console.error('Forgot password error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to send reset email. Try again.' });
  }
});

// POST /api/auth/reset-password — verify token and set new password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword || newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'Token and a password of at least 8 characters are required' });
    }
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() },
    });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Reset link is invalid or has expired' });
    }
    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();
    res.json({ success: true, message: 'Password reset successfully. You can now log in.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
