const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin', 'vendor'], default: 'student' },
  campusId: { type: String, unique: true, sparse: true },
  avatar: { type: String, default: '' },
  department: { type: String, default: '' },
  phone: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Virtual for comparing passwords
userSchema.methods.comparePassword = async function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

// Auto-generate campusId
userSchema.pre('save', function (next) {
  if (!this.campusId) {
    this.campusId = `CC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
