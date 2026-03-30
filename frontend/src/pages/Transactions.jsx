import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Transactions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [txs, setTxs] = useState([]);
  const [stats, setStats] = useState({ total: 0, pages: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ type: '', status: '' });

  const fetchTxs = async (p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: 15, ...filter });
      const { data } = await api.get(`/transactions?${params}`);
      setTxs(data.transactions);
      setStats({ total: data.total, pages: data.pages });
      setPage(p);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchTxs(1); }, [filter]);

  const fmt = n => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0);
  const fmtDate = d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const totalVolume = txs.reduce((s, t) => s + t.amount, 0);

  return (
    <div className="page-wrapper">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 overflow-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="font-headline font-bold text-3xl text-on-surface">History</h1>
              <p className="text-on-surface-variant font-body mt-1">Review and manage all your institutional transactions.</p>
            </div>
            <p className="text-xs text-on-surface-variant font-body mt-2">Showing {txs.length} of {stats.total} transactions</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total Volume', value: fmt(totalVolume), icon: 'storage' },
              { label: 'Success Rate', value: '98.2%', icon: 'verified' },
              { label: 'Total Count', value: stats.total, icon: 'receipt_long' },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <p className="stat-value">{s.value}</p>
                <p className="stat-label">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            <select className="input-field w-40 text-sm" value={filter.type} id="filter-type"
              onChange={e => setFilter(f => ({ ...f, type: e.target.value }))}>
              <option value="">All Types</option>
              <option value="p2p">P2P</option>
              <option value="topup">Top-up</option>
              <option value="fee">Fee</option>
              <option value="qr">QR</option>
              <option value="recurring">Recurring</option>
            </select>
            <select className="input-field w-40 text-sm" value={filter.status} id="filter-status"
              onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}>
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
            <button onClick={() => setFilter({ type: '', status: '' })} className="btn-tertiary text-sm" id="clear-filters">Clear</button>
          </div>

          {/* Transaction List */}
          <div className="card p-2 space-y-1">
            {loading ? (
              Array(5).fill(0).map((_, i) => <div key={i} className="h-16 skeleton rounded-xl" />)
            ) : txs.length === 0 ? (
              <div className="p-12 text-center text-on-surface-variant font-body">No transactions found</div>
            ) : txs.map((tx, i) => {
              const isIncoming = tx.receiverId?._id === user?.id || tx.receiverId === user?.id;
              const counterparty = isIncoming ? tx.senderId : tx.receiverId;
              return (
                <motion.div key={tx._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  onClick={() => navigate(`/transactions/${tx._id}`)} className="tx-row group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isIncoming ? 'bg-tertiary/10' : 'bg-error/10'}`}>
                      <span className={`material-icons text-xl ${isIncoming ? 'text-tertiary' : 'text-error'}`}>
                        {isIncoming ? 'call_received' : 'call_made'}
                      </span>
                    </div>
                    <div>
                      <p className="font-body font-medium text-on-surface text-sm">{counterparty?.name || tx.note || 'Unknown'}</p>
                      <p className="text-xs text-on-surface-variant">{fmtDate(tx.createdAt)} · #{tx.blockIndex}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <span className={`badge-${tx.status === 'completed' ? 'success' : tx.status === 'pending' ? 'pending' : 'error'} capitalize`}>
                      {tx.status}
                    </span>
                    <p className={`font-headline font-semibold text-sm min-w-20 text-right ${isIncoming ? 'text-tertiary' : 'text-error'}`}>
                      {isIncoming ? '+' : '-'}{fmt(tx.amount)}
                    </p>
                    <span className="material-icons text-on-surface-variant text-base group-hover:text-primary transition-colors">chevron_right</span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Pagination */}
          {stats.pages > 1 && (
            <div className="flex justify-center gap-2">
              {Array.from({ length: stats.pages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => fetchTxs(p)}
                  className={`w-9 h-9 rounded-xl text-sm font-body font-medium transition-all ${p === page ? 'bg-primary text-white' : 'bg-surface-container text-on-surface hover:bg-surface-container-high'}`}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default Transactions;
