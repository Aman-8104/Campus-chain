require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');
const Wallet = require('./models/Wallet');
const Transaction = require('./models/Transaction');
const Notification = require('./models/Notification');
const { generateTxHash } = require('./utils/blockchain');

const seed = async () => {
  await connectDB();
  console.log('🌱 Seeding database...');

  // Clear existing data
  await User.deleteMany();
  await Wallet.deleteMany();
  await Transaction.deleteMany();
  await Notification.deleteMany();
  console.log('🗑️  Cleared existing data');

  // Create users
  const adminHash = await bcrypt.hash('admin123', 12);
  const studentHash = await bcrypt.hash('student123', 12);
  const vendorHash = await bcrypt.hash('vendor123', 12);

  const admin = await User.create({
    name: 'Dr. Alexander Vance',
    email: 'admin@campus.edu',
    passwordHash: adminHash,
    role: 'admin',
    department: 'Finance Office',
    campusId: 'CC-ADMIN-001',
    phone: '+1-555-0100'
  });

  const student = await User.create({
    name: 'Alex Rivera',
    email: 'student@campus.edu',
    passwordHash: studentHash,
    role: 'student',
    department: 'Computer Science',
    campusId: 'CC-STU-9042',
    phone: '+1-555-0200'
  });

  const sarah = await User.create({
    name: 'Sarah Jensen',
    email: 'sarah@campus.edu',
    passwordHash: studentHash,
    role: 'student',
    department: 'Business Administration',
    campusId: 'CC-STU-7751',
    phone: '+1-555-0201'
  });

  const john = await User.create({
    name: 'John Doe',
    email: 'john@campus.edu',
    passwordHash: studentHash,
    role: 'student',
    department: 'Engineering',
    campusId: 'CC-STU-8821',
    phone: '+1-555-0202'
  });

  const emma = await User.create({
    name: 'Emma Watson',
    email: 'emma@campus.edu',
    passwordHash: studentHash,
    role: 'student',
    department: 'Arts',
    campusId: 'CC-STU-9932',
    phone: '+1-555-0203'
  });

  const customNames = ['Achal', 'Prachi', 'Rohan', 'Priya', 'Aryan', 'Neha', 'Kabir', 'Riya', 'Dev', 'Ananya'];
  const customUsers = [];
  for (let i = 0; i < customNames.length; i++) {
    const n = customNames[i];
    const lower = n.toLowerCase();
    const hash = await bcrypt.hash(`${lower}123`, 12);
    const u = await User.create({
      name: n,
      email: `${lower}@campus.edu`,
      passwordHash: hash,
      role: 'student',
      department: 'General Studies',
      campusId: `CC-STU-500${i}`,
      phone: `+1-555-030${i}`
    });
    customUsers.push(u);
  }

  const vendor = await User.create({
    name: 'Campus Bookstore',
    email: 'vendor@campus.edu',
    passwordHash: vendorHash,
    role: 'vendor',
    department: 'Auxiliary Services',
    campusId: 'CC-VND-2200',
  });

  console.log('✅ Users created');

  // Create wallets
  await Wallet.create({ userId: admin._id, balance: 50000, monthlyInflow: 342900, monthlyOutflow: 128450 });
  await Wallet.create({ userId: student._id, balance: 4280.50, monthlyInflow: 500, monthlyOutflow: 219.5 });
  await Wallet.create({ userId: sarah._id, balance: 1850.00, monthlyInflow: 200, monthlyOutflow: 150 });
  await Wallet.create({ userId: john._id, balance: 500.00, monthlyInflow: 100, monthlyOutflow: 50 });
  await Wallet.create({ userId: emma._id, balance: 950.00, monthlyInflow: 300, monthlyOutflow: 200 });
  await Wallet.create({ userId: vendor._id, balance: 12400, monthlyInflow: 5000, monthlyOutflow: 1200 });
  
  for (const u of customUsers) {
    await Wallet.create({ userId: u._id, balance: 2500, monthlyInflow: 1200, monthlyOutflow: 400 });
  }
  
  console.log('✅ Wallets created');

  // Create chained transactions
  const genesis = '0000000000000000000000000000000000000000000000000000000000000000';
  const txData = [
    { senderId: student._id, receiverId: vendor._id, amount: 45.50, type: 'p2p', note: 'Campus Bookstore', daysAgo: 0, time: '10:45 AM' },
    { senderId: sarah._id, receiverId: student._id, amount: 120.00, type: 'p2p', note: 'Share rent', daysAgo: 1, time: '4:12 PM' },
    { senderId: student._id, receiverId: vendor._id, amount: 18.50, type: 'fee', note: 'Central Hall Dining', daysAgo: 3, time: '12:30 PM' },
    { senderId: student._id, receiverId: vendor._id, amount: 299.00, type: 'fee', note: 'Student Tech Hub', daysAgo: 4, time: '9:15 AM' },
    { senderId: admin._id, receiverId: student._id, amount: 500.00, type: 'topup', note: 'Scholarship top-up', daysAgo: 7, time: '11:00 AM' },
    { senderId: student._id, receiverId: sarah._id, amount: 50.00, type: 'p2p', note: 'Lunch split', daysAgo: 10, time: '1:00 PM' },
    { senderId: sarah._id, receiverId: vendor._id, amount: 33.25, type: 'fee', note: 'Library fee', daysAgo: 12, time: '3:45 PM' },
    { senderId: student._id, receiverId: vendor._id, amount: 12.75, type: 'qr', note: 'QR payment - cafeteria', daysAgo: 14, time: '8:30 AM' },
    { senderId: admin._id, receiverId: sarah._id, amount: 200.00, type: 'topup', note: 'Merit award', daysAgo: 20, time: '9:00 AM' },
    { senderId: student._id, receiverId: vendor._id, amount: 89.99, type: 'fee', note: 'Lab equipment rental', daysAgo: 25, time: '2:15 PM' },
  ];

  let prevHash = genesis;
  for (let i = 0; i < txData.length; i++) {
    const d = txData[i];
    const ts = new Date();
    ts.setDate(ts.getDate() - d.daysAgo);
    const txHash = generateTxHash(prevHash, {
      senderId: d.senderId.toString(), receiverId: d.receiverId.toString(), amount: d.amount, timestamp: ts.getTime()
    });
    await Transaction.create({
      senderId: d.senderId, receiverId: d.receiverId, amount: d.amount,
      type: d.type, status: 'completed', note: d.note,
      txHash, prevHash, blockIndex: i, createdAt: ts
    });
    prevHash = txHash;
  }
  console.log('✅ Transactions created with hash chain');

  // Create notifications
  await Notification.create([
    { userId: student._id, title: 'Payment Received', body: 'You received $120.00 from Sarah Jensen', type: 'transaction', read: false },
    { userId: student._id, title: 'Scholarship Credited', body: '$500.00 scholarship top-up credited to your wallet', type: 'transaction', read: false },
    { userId: student._id, title: 'System Update', body: 'CampusChain has upgraded to v4.2.0 with faster QR payments', type: 'system', read: true },
    { userId: student._id, title: 'Security Alert', body: 'New device login detected. If this was not you, contact support.', type: 'alert', read: false },
    { userId: admin._id, title: 'System Health', body: 'All nodes operational. System integrity at 99.98%', type: 'system', read: false },
  ]);
  console.log('✅ Notifications created');

  console.log('\n🎉 Database seeded successfully!');
  console.log('─────────────────────────────────────');
  console.log('  Admin: admin@campus.edu / admin123');
  console.log('  Student 1: student@campus.edu / student123');
  console.log('  Student 2: sarah@campus.edu / student123');
  console.log('  Student 3: john@campus.edu / student123');
  console.log('  Student 4: emma@campus.edu / student123');
  console.log('  Vendor: vendor@campus.edu / vendor123');
  console.log('  Added 10 Custom Users: Achal, Prachi, Rohan, Priya, Aryan, Neha, Kabir, Riya, Dev, Ananya');
  console.log('  Custom Emails: <name>@campus.edu');
  console.log('  Custom Passwords: <name>123');
  console.log('─────────────────────────────────────');

  process.exit(0);
};

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
