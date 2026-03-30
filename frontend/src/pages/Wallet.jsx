import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Wallet = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [wallet, setWallet] = useState(null);
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topupAmount, setTopupAmount] = useState('');
  const [topupLoading, setTopupLoading] = useState(false);
  const [topupMsg, setTopupMsg] = useState('');

  useEffect(() => {
    Promise.all([api.get('/wallet'), api.get('/transactions?limit=10')])
      .then(([w, t]) => { setWallet(w.data.wallet); setTxs(t.data.transactions); })
      .finally(() => setLoading(false));
  }, []);

  const fmt = n => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0);
  const fmtDate = d => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const handleTopup = async e => {
    e.preventDefault();
    if (!topupAmount || topupAmount <= 0) return;
    setTopupLoading(true); setTopupMsg('');
    try {
      const { data } = await api.post('/wallet/topup', { amount: Number(topupAmount) });
      if (data.success) {
        setWallet(data.wallet);
        setTopupMsg(data.message);
        setTopupAmount('');
      }
    } catch (err) { setTopupMsg(err.response?.data?.message || 'Failed'); }
    finally { setTopupLoading(false); }
  };

  return (
    <div className="page-wrapper">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 overflow-auto">
        {loading ? (
          <div className="space-y-4 animate-pulse max-w-5xl mx-auto">
            {[1, 2, 3].map(i => <div key={i} className="h-32 skeleton rounded-xl" />)}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div>
              <p className="text-xs uppercase tracking-widest text-on-surface-variant font-body mb-1">Institutional Treasury #{user?.campusId}</p>
              <h1 className="font-headline font-bold text-3xl text-on-surface">Wallet Details</h1>
              <p className="text-on-surface-variant font-body mt-2">Manage your primary settlement account and view historical cash flows.</p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Available Balance', value: fmt(wallet?.balance), icon: 'account_balance', color: 'text-primary' },
                { label: 'Monthly Inflow', value: fmt(wallet?.monthlyInflow), icon: 'trending_up', color: 'text-tertiary' },
                { label: 'Monthly Outflow', value: fmt(wallet?.monthlyOutflow), icon: 'trending_down', color: 'text-error' },
                { label: 'Daily Limit', value: fmt(wallet?.dailyLimit), icon: 'speed', color: 'text-secondary' },
              ].map(s => (
                <div key={s.label} className="stat-card">
                  <div className={`w-9 h-9 rounded-xl ${s.color.replace('text-', 'bg-')}/10 flex items-center justify-center mb-3`}>
                    <span className={`material-icons text-xl ${s.color}`}>{s.icon}</span>
                  </div>
                  <p className="stat-value">{s.value}</p>
                  <p className="stat-label">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Add Funds */}
            <div className="card p-6">
              <h2 className="font-headline font-semibold text-lg text-on-surface mb-4">Add Funds</h2>
              <form onSubmit={handleTopup} className="flex gap-3">
                <input type="number" min="1" step="0.01" className="input-field flex-1" placeholder="Enter amount (USD)"
                  value={topupAmount} onChange={e => setTopupAmount(e.target.value)} id="topup-amount" />
                <button type="submit" className="btn-primary px-8" id="topup-submit" disabled={topupLoading}>
                  {topupLoading ? <span className="material-icons animate-spin text-base">sync</span> : 'Add Funds'}
                </button>
              </form>
              {topupMsg && <p className="mt-2 text-sm text-tertiary font-body">{topupMsg}</p>}
            </div>

            {/* Recent Activity */}
            <div>
              <h2 className="font-headline font-semibold text-lg text-on-surface mb-4">Recent Activity</h2>
              <div className="card p-2 space-y-1">
                {txs.map((tx, i) => {
                  const isIncoming = tx.receiverId?._id === user?.id || tx.receiverId === user?.id;
                  return (
                    <motion.div key={tx._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                      onClick={() => navigate(`/transactions/${tx._id}`)} className="tx-row group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isIncoming ? 'bg-tertiary/10' : 'bg-error/10'}`}>
                          <span className={`material-icons text-xl ${isIncoming ? 'text-tertiary' : 'text-error'}`}>
                            {isIncoming ? 'call_received' : 'call_made'}
                          </span>
                        </div>
                        <div>
                          <p className="font-body font-medium text-on-surface text-sm">{tx.note || (isIncoming ? tx.senderId?.name : tx.receiverId?.name)}</p>
                          <p className="text-xs text-on-surface-variant font-mono">{tx.txHash?.slice(0, 20)}...</p>
                          <p className="text-xs text-on-surface-variant">{fmtDate(tx.createdAt)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-headline font-semibold text-sm ${isIncoming ? 'text-tertiary' : 'text-error'}`}>
                          {isIncoming ? '+' : '-'}{fmt(tx.amount)}
                        </p>
                        <span className={`badge-${tx.status === 'completed' ? 'success' : tx.status === 'pending' ? 'pending' : 'error'}`}>{tx.status}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Governance Note */}
            <div className="card-container p-5 flex gap-4">
              <span className="material-icons text-primary mt-0.5">shield</span>
              <div>
                <p className="font-headline font-semibold text-on-surface text-sm">Governance Note</p>
                <p className="text-on-surface-variant text-xs font-body mt-1">
                  All data is cryptographically hashed and anchored to the CampusChain mainnet. High-value transactions require multi-signature authorization.
                </p>
                <p className="text-xs text-tertiary font-body mt-2">Node Syncing: 99.9% • Last Audit: Clean</p>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Wallet;
