import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import MainContent from '../components/MainContent';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Transactions = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [txs, setTxs] = useState([]);
  const [stats, setStats] = useState({ total: 0, pages: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ type: '', status: '' });
  const [search, setSearch] = useState('');

  const fetchTxs = async (p = 1) => {
    setLoading(true);
    try {
      let data;
      if (isAdmin) {
        // Admin sees ALL transactions across the entire network
        const params = new URLSearchParams({ page: p, limit: 20 });
        const res = await api.get(`/admin/transactions?${params}`);
        data = res.data;
        // Admin endpoint returns { transactions, total } without pages
        setStats({ total: data.total, pages: Math.ceil(data.total / 20) });
      } else {
        const params = new URLSearchParams({ page: p, limit: 15, ...filter });
        const res = await api.get(`/transactions?${params}`);
        data = res.data;
        setStats({ total: data.total, pages: data.pages });
      }
      setTxs(data.transactions);
      setPage(p);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchTxs(1); }, [filter, isAdmin]);

  const fmt = n => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0);
  const fmtDate = d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const totalVolume = txs.reduce((s, t) => s + t.amount, 0);

  // For admin view, filter transactions client-side by search
  const displayed = isAdmin && search
    ? txs.filter(tx =>
        tx.senderId?.name?.toLowerCase().includes(search.toLowerCase()) ||
        tx.receiverId?.name?.toLowerCase().includes(search.toLowerCase()) ||
        tx.note?.toLowerCase().includes(search.toLowerCase()) ||
        tx.txHash?.includes(search)
      )
    : txs;

  return (
    <div className="page-wrapper">
      <Sidebar />
      <MainContent>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-6">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
            <div>
              {isAdmin && (
                <p className="text-xs uppercase tracking-widest font-body mb-1 text-amber-400/70">System Administrator</p>
              )}
              <h1 className={`font-headline font-bold text-2xl lg:text-3xl ${isAdmin ? 'text-amber-400' : 'text-on-surface'}`}>
                {isAdmin ? 'Global Transaction Ledger' : 'History'}
              </h1>
              <p className="text-on-surface-variant font-body mt-1 text-sm">
                {isAdmin
                  ? 'Review all transactions across the entire CampusChain network.'
                  : 'Review and manage all your institutional transactions.'}
              </p>
            </div>
            <p className="text-xs text-on-surface-variant font-body">
              Showing {displayed.length} of {stats.total} transactions
            </p>
          </div>

          {/* Stats */}
          <div className={`grid gap-3 ${isAdmin ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-3'}`}>
            {[
              { label: isAdmin ? 'Network Volume' : 'Total Volume', value: fmt(totalVolume), icon: 'storage', admin: false },
              { label: 'Success Rate', value: '98.2%', icon: 'verified', admin: false },
              { label: 'Total Count', value: stats.total, icon: 'receipt_long', admin: false },
              ...(isAdmin ? [{ label: 'All Users', value: '—', icon: 'group', admin: true }] : []),
            ].map(s => (
              <div key={s.label} className={`stat-card ${isAdmin ? 'border border-amber-500/10' : ''}`}>
                <p className={`stat-value ${isAdmin ? 'text-amber-400' : ''}`}>{s.value}</p>
                <p className="stat-label">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Admin: Search bar | User: Filters */}
          {isAdmin ? (
            <div className="flex gap-3">
              <div className="relative flex-1">
                <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-amber-400/50 text-lg">search</span>
                <input
                  className="input-field w-full pl-10 text-sm border-amber-500/20 focus:border-amber-400"
                  placeholder="Search by user, note, or tx hash..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  id="admin-tx-search"
                />
              </div>
              <button onClick={() => fetchTxs(1)} className="px-3 py-2 rounded-xl font-body text-sm font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-all flex-shrink-0" id="admin-tx-refresh">
                <span className="material-icons text-base">refresh</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
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
          )}

          {/* Transaction List */}
          <div className={`card p-2 space-y-1 ${isAdmin ? 'border border-amber-500/10' : ''}`}>
            {loading ? (
              Array(5).fill(0).map((_, i) => <div key={i} className="h-16 skeleton rounded-xl" />)
            ) : displayed.length === 0 ? (
              <div className="p-12 text-center text-on-surface-variant font-body">No transactions found</div>
            ) : displayed.map((tx, i) => {
              const isIncoming = !isAdmin && (tx.receiverId?._id === user?.id || tx.receiverId === user?.id);
              return (
                <motion.div key={tx._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  onClick={() => navigate(`/transactions/${tx._id}`)} className="tx-row group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isAdmin ? 'bg-amber-500/10' : isIncoming ? 'bg-tertiary/10' : 'bg-error/10'
                    }`}>
                      <span className={`material-icons text-xl ${
                        isAdmin ? 'text-amber-400' : isIncoming ? 'text-tertiary' : 'text-error'
                      }`}>
                        {isAdmin ? 'swap_horiz' : isIncoming ? 'call_received' : 'call_made'}
                      </span>
                    </div>
                    <div>
                      {isAdmin ? (
                        <>
                          <p className="font-body font-medium text-on-surface text-sm">
                            <span className="text-amber-400">{tx.senderId?.name || 'System'}</span>
                            <span className="text-on-surface-variant mx-1">→</span>
                            <span>{tx.receiverId?.name || 'Unknown'}</span>
                          </p>
                          <p className="text-xs text-on-surface-variant font-mono">{tx.txHash?.slice(0, 24)}...</p>
                        </>
                      ) : (
                        <>
                          <p className="font-body font-medium text-on-surface text-sm">
                            {(isIncoming ? tx.senderId : tx.receiverId)?.name || tx.note || 'Unknown'}
                          </p>
                        </>
                      )}
                      <p className="text-xs text-on-surface-variant">{fmtDate(tx.createdAt)} · #{tx.blockIndex}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <span className={`badge-${tx.status === 'completed' ? 'success' : tx.status === 'pending' ? 'pending' : 'error'} capitalize`}>
                      {tx.status}
                    </span>
                    <p className={`font-headline font-semibold text-sm min-w-20 text-right ${
                      isAdmin ? 'text-amber-400' : isIncoming ? 'text-tertiary' : 'text-error'
                    }`}>
                      {!isAdmin && (isIncoming ? '+' : '-')}{fmt(tx.amount)}
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
              {Array.from({ length: Math.min(stats.pages, 10) }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => fetchTxs(p)}
                  className={`w-9 h-9 rounded-xl text-sm font-body font-medium transition-all ${
                    p === page
                      ? isAdmin ? 'bg-amber-500 text-black' : 'bg-primary text-white'
                      : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                  }`}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </MainContent>
    </div>
  );
};

export default Transactions;
