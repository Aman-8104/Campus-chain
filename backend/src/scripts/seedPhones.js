/**
 * Migration: Add random phone numbers to users that have no phone set.
 * Run: node src/scripts/seedPhones.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const randomPhone = () => {
  const countryCodes = ['+91', '+1', '+44', '+61', '+49'];
  const cc = countryCodes[Math.floor(Math.random() * countryCodes.length)];
  const number = Math.floor(1000000000 + Math.random() * 9000000000);
  return `${cc} ${number}`;
};

async function run() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/CampusChain');
  console.log('Connected to MongoDB');

  const users = await User.find({ $or: [{ phone: '' }, { phone: null }, { phone: { $exists: false } }] });
  console.log(`Found ${users.length} users without a phone number`);

  let updated = 0;
  for (const user of users) {
    user.phone = randomPhone();
    await user.save();
    console.log(`  ✓ ${user.name} (${user.email}) → ${user.phone}`);
    updated++;
  }

  console.log(`\nDone. Updated ${updated} users.`);
  await mongoose.disconnect();
}

run().catch(err => { console.error(err); process.exit(1); });
