import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import QRScanner from '../components/QRScanner';
import api from '../api/axios';

const stagger = { container: { animate: { transition: { staggerChildren: 0.08 } } }, item: { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } } };

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [wallet, setWallet] = useState(null);
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    Promise.all([api.get('/wallet'), api.get('/transactions?limit=5')])
      .then(([w, t]) => { setWallet(w.data.wallet); setTxs(t.data.transactions); })
      .finally(() => setLoading(false));
  }, []);

  const fmt = n => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0);
  const fmtDate = d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const handleScanSuccess = (decodedText) => {
    setShowScanner(false);
    let target = decodedText;
    try {
      // If the QR code contains JSON (like user details), extract the best identifier
      const data = JSON.parse(decodedText);
      target = data.campusId || data.email || decodedText;
    } catch (e) {
      // It's a plain string, use as is
    }
    navigate(`/send?to=${encodeURIComponent(target)}`);
  };

  const quickActions = [
    { icon: 'send', label: 'Send Money', sub: 'Transfer to any campus peer', onClick: () => navigate('/send'), color: 'bg-primary/10 text-primary' },
    { icon: 'qr_code_scanner', label: 'Pay via QR', sub: 'Instant scan and pay at kiosks', onClick: () => setShowScanner(true), color: 'bg-secondary/10 text-secondary' },
    { icon: 'receipt_long', label: 'View History', sub: 'Review all your transactions', onClick: () => navigate('/transactions'), color: 'bg-tertiary/10 text-tertiary' },
  ];

  return (
    <div className="page-wrapper">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 lg:p-12 overflow-auto">
        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map(i => <div key={i} className="h-32 skeleton rounded-2xl" />)}
          </div>
        ) : (
          <motion.div variants={stagger.container} initial="initial" animate="animate" className="space-y-12 max-w-7xl mx-auto">
            {/* Header */}
            <motion.div variants={stagger.item} className="flex justify-between items-start">
              <div>
                <p className="text-sm uppercase tracking-widest text-on-surface-variant font-body mb-2">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <h1 className="font-headline font-bold text-5xl text-on-surface">Hello, {user?.name?.split(' ')[0]} 👋</h1>
              </div>
              <button onClick={() => navigate('/notifications')} className="relative p-4 rounded-2xl bg-surface-low hover:bg-surface-container transition-colors">
                <span className="material-icons text-3xl text-on-surface-variant">notifications</span>
                <span className="absolute top-3 right-3 w-3 h-3 bg-error rounded-full ring-2 ring-white" />
              </button>
            </motion.div>

            {/* Balance Card */}
            <motion.div variants={stagger.item} className="relative rounded-[2rem] bg-card-gradient p-12 text-white overflow-hidden shadow-float">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.08),transparent_60%)]" />
              <div className="relative z-10">
                <p className="text-white/70 text-sm uppercase tracking-widest font-body mb-4 font-semibold">Total Balance</p>
                <p className="font-headline font-bold text-7xl mb-2 tracking-tight">{fmt(wallet?.balance)}</p>
                <p className="text-white/60 text-lg font-body">{user?.campusId}</p>
                <div className="mt-10 flex gap-12">
                  <div>
                    <p className="text-white/60 text-sm mb-2 font-medium">Monthly Inflow</p>
                    <p className="font-headline font-bold text-2xl text-emerald-300">+{fmt(wallet?.monthlyInflow)}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm mb-2 font-medium">Monthly Outflow</p>
                    <p className="font-headline font-bold text-2xl text-pink-300">-{fmt(wallet?.monthlyOutflow)}</p>
                  </div>
                </div>
              </div>
              {/* Card number decoration */}
              <div className="absolute bottom-8 right-8 text-white/30 font-headline font-bold text-xl tracking-widest">
                **** **** **** {user?.campusId?.slice(-4) || '0000'}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={stagger.item}>
              <h2 className="font-headline font-bold text-2xl text-on-surface mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {quickActions.map(a => (
                  <button key={a.label} onClick={a.onClick}
                    className="card p-8 text-left hover:shadow-float hover:-translate-y-1 transition-all duration-300 group"
                  >
                    <div className={`w-16 h-16 rounded-2xl ${a.color} flex items-center justify-center mb-6`}>
                      <span className="material-icons text-3xl">{a.icon}</span>
                    </div>
                    <p className="font-headline font-bold text-on-surface text-xl mb-1">{a.label}</p>
                    <p className="text-on-surface-variant text-sm font-body">{a.sub}</p>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Recent Transactions */}
            <motion.div variants={stagger.item}>
              <div className="flex justify-between items-end mb-6">
                <h2 className="font-headline font-bold text-2xl text-on-surface">Recent Transactions</h2>
                <button onClick={() => navigate('/transactions')} className="text-primary font-medium hover:underline text-lg">View all</button>
              </div>
              <div className="card p-4 space-y-2">
                {txs.length === 0 ? (
                  <div className="p-12 text-center text-on-surface-variant font-body text-base">No transactions yet</div>
                ) : txs.map((tx, i) => {
                  const isIncoming = tx.receiverId?._id === user?.id || tx.receiverId === user?.id;
                  const counterparty = isIncoming ? tx.senderId : tx.receiverId;
                  return (
                    <motion.div key={tx._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                      onClick={() => navigate(`/transactions/${tx._id}`)} className="tx-row group !p-6"
                    >
                      <div className="flex items-center gap-5">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isIncoming ? 'bg-tertiary/10' : 'bg-primary/10'}`}>
                          <span className={`material-icons text-3xl ${isIncoming ? 'text-tertiary' : 'text-primary'}`}>
                            {isIncoming ? 'call_received' : 'call_made'}
                          </span>
                        </div>
                        <div>
                          <p className="font-headline font-bold text-on-surface text-xl mb-1">{counterparty?.name || tx.note || 'Unknown'}</p>
                          <p className="text-sm text-on-surface-variant font-body">{fmtDate(tx.createdAt)}</p>
                        </div>
                      </div>
                      <p className={`font-headline font-bold text-2xl ${isIncoming ? 'text-tertiary' : 'text-on-surface'}`}>
                        {isIncoming ? '+' : '-'}{fmt(tx.amount)}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Savings Goal Banner */}
            <motion.div variants={stagger.item} className="card p-8 flex items-center gap-6 shadow-sm border border-surface-container">
              <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                <span className="material-icons text-secondary text-3xl">savings</span>
              </div>
              <div className="flex-1">
                <p className="font-headline font-bold text-on-surface text-xl mb-1">Savings Goal</p>
                <p className="text-on-surface-variant text-base font-body">You're $150 away from your "New Laptop" goal. Keep it up!</p>
              </div>
              <div className="w-48 h-3 bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full bg-secondary rounded-full" style={{ width: '78%' }} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </main>

      {/* QR Scanner Modal */}
      {showScanner && (
        <QRScanner
          onScanSuccess={handleScanSuccess}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
