import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import MainContent from '../components/MainContent';
import api from '../api/axios';

const fmt = n => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0);
const fmtDate = d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

const AdminFund = () => {
  // User search
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searching, setSearching] = useState(false);

  // Fund form
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Recent fund transfers
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const { data } = await api.get('/admin/transactions?limit=20');
      // filter only topup type
      setHistory(data.transactions.filter(t => t.type === 'topup'));
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  // User search with debounce
  useEffect(() => {
    if (query.length < 2) { setSearchResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const { data } = await api.get(`/transactions/search-users?q=${query}`);
        setSearchResults(data.users || []);
      } finally { setSearching(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const selectUser = (u) => {
    setSelectedUser(u);
    setQuery(u.name);
    setSearchResults([]);
    setSuccessMsg(''); setErrorMsg('');
  };

  const clearUser = () => {
    setSelectedUser(null);
    setQuery('');
    setSearchResults([]);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!selectedUser || !amount || amount <= 0) return;
    setSending(true); setSuccessMsg(''); setErrorMsg('');
    try {
      const { data } = await api.post('/admin/fund-user', {
        targetUserId: selectedUser._id,
        amount: Number(amount),
        note: note || undefined,
      });
      if (data.success) {
        setSuccessMsg(data.message);
        setAmount(''); setNote('');
        clearUser();
        fetchHistory();
      } else {
        setErrorMsg(data.message);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Transfer failed');
    } finally {
      setSending(false);
    }
  };

  const quickAmounts = [100, 500, 1000, 5000];

  return (
    <div className="page-wrapper">
      <Sidebar />
      <MainContent>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-8">

          {/* Header */}
          <div>
            <p className="text-xs uppercase tracking-widest font-body mb-1 text-amber-400/70">System Administrator</p>
            <h1 className="font-headline font-bold text-3xl text-amber-400">Fund Distribution</h1>
            <p className="text-on-surface-variant font-body mt-1">
              Allocate funds directly to any user's wallet with a blockchain-verified record.
            </p>
          </div>

          <div className="grid grid-cols-5 gap-6">
            {/* Left — Send Panel */}
            <div className="col-span-3 space-y-5">

              {/* Recipient Search */}
              <div className="card p-6 border border-amber-500/10 space-y-4 relative z-10">
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-icons text-amber-400 text-xl">person_search</span>
                  <h2 className="font-headline font-semibold text-on-surface">Select Recipient</h2>
                </div>

                {selectedUser ? (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-amber-400 text-lg font-bold font-headline">
                        {selectedUser.name?.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-headline font-semibold text-on-surface">{selectedUser.name}</p>
                      <p className="text-sm text-on-surface-variant font-body">{selectedUser.email}</p>
                      <p className="text-xs font-mono text-amber-400/70">{selectedUser.campusId}</p>
                    </div>
                    <button onClick={clearUser} className="w-8 h-8 rounded-full hover:bg-error/10 flex items-center justify-center transition-colors" id="clear-recipient">
                      <span className="material-icons text-error text-base">close</span>
                    </button>
                  </motion.div>
                ) : (
                  <div className="relative">
                    <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-amber-400/40 text-lg pointer-events-none">search</span>
                    <input
                      id="recipient-search"
                      className="input-field w-full pl-10 border-amber-500/20 focus:border-amber-400 bg-transparent"
                      placeholder="Search by name, email or campus ID..."
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      autoComplete="off"
                    />
                    {/* Dropdown */}
                    <AnimatePresence>
                      {(searchResults.length > 0 || searching) && (
                        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="absolute z-50 left-0 right-0 top-full mt-1 bg-surface-lowest border border-amber-500/20 rounded-xl overflow-hidden shadow-ambient">
                          {searching ? (
                            <div className="p-4 text-xs text-on-surface-variant font-body text-center">Searching...</div>
                          ) : searchResults.map(u => (
                            <button key={u._id} onClick={() => selectUser(u)}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-amber-500/5 transition-colors text-left">
                              <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                                <span className="text-amber-400 text-sm font-bold">{u.name?.charAt(0)}</span>
                              </div>
                              <div>
                                <p className="font-body font-medium text-on-surface text-sm">{u.name}</p>
                                <p className="text-xs text-on-surface-variant">{u.email} · {u.campusId}</p>
                              </div>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Amount + Note Form */}
              <form onSubmit={handleSend} className="card p-6 border border-amber-500/10 space-y-5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-icons text-amber-400 text-xl">payments</span>
                  <h2 className="font-headline font-semibold text-on-surface">Transfer Details</h2>
                </div>

                {/* Quick Amount Buttons */}
                <div>
                  <label className="block text-xs font-body font-medium text-on-surface-variant mb-2 uppercase tracking-wide">Quick Amount</label>
                  <div className="flex gap-2 flex-wrap">
                    {quickAmounts.map(q => (
                      <button key={q} type="button"
                        onClick={() => setAmount(String(q))}
                        className={`px-4 py-2 rounded-xl text-sm font-body font-semibold transition-all border ${
                          Number(amount) === q
                            ? 'bg-amber-500 text-black border-amber-500'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
                        }`}
                        id={`quick-${q}`}
                      >
                        {fmt(q)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Amount */}
                <div>
                  <label className="block text-xs font-body font-medium text-on-surface-variant mb-2 uppercase tracking-wide">Custom Amount (USD)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400 font-bold text-lg pointer-events-none">$</span>
                    <input
                      id="fund-amount"
                      type="number" min="1" step="0.01"
                      className="input-field w-full pl-8 border-amber-500/20 focus:border-amber-400"
                      placeholder="0.00"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Note */}
                <div>
                  <label className="block text-xs font-body font-medium text-on-surface-variant mb-2 uppercase tracking-wide">Note (Optional)</label>
                  <input
                    id="fund-note"
                    className="input-field w-full border-amber-500/20 focus:border-amber-400"
                    placeholder="e.g. Scholarship award, Merit bonus..."
                    value={note}
                    onChange={e => setNote(e.target.value)}
                  />
                </div>

                {/* Feedback Messages */}
                <AnimatePresence>
                  {successMsg && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-2 p-3 rounded-xl bg-tertiary/10 border border-tertiary/20 text-tertiary text-sm font-body">
                      <span className="material-icons text-base">check_circle</span>
                      {successMsg}
                    </motion.div>
                  )}
                  {errorMsg && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-2 p-3 rounded-xl bg-error/10 border border-error/20 text-error text-sm font-body">
                      <span className="material-icons text-base">error_outline</span>
                      {errorMsg}
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  id="fund-submit"
                  disabled={sending || !selectedUser || !amount}
                  className={`w-full py-4 rounded-xl font-headline font-bold text-base transition-all flex items-center justify-center gap-2 ${
                    sending || !selectedUser || !amount
                      ? 'bg-amber-500/20 text-amber-400/40 cursor-not-allowed'
                      : 'bg-amber-500 text-black hover:bg-amber-400 shadow-lg hover:shadow-amber-500/20'
                  }`}
                >
                  {sending ? (
                    <><span className="material-icons animate-spin text-base">sync</span> Processing...</>
                  ) : (
                    <><span className="material-icons text-base">send</span> Send Funds</>
                  )}
                </button>
              </form>
            </div>

            {/* Right — Recent Fund Transfers */}
            <div className="col-span-2">
              <div className="card p-5 border border-amber-500/10 h-full">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-icons text-amber-400 text-xl">history</span>
                  <h2 className="font-headline font-semibold text-on-surface">Recent Transfers</h2>
                </div>
                <div className="space-y-2 overflow-y-auto max-h-[520px]">
                  {historyLoading ? (
                    Array(4).fill(0).map((_, i) => <div key={i} className="h-14 skeleton rounded-xl" />)
                  ) : history.length === 0 ? (
                    <p className="text-xs text-on-surface-variant font-body text-center py-8">No fund transfers yet</p>
                  ) : history.map((tx, i) => (
                    <motion.div key={tx._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                      className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="material-icons text-amber-400 text-sm">payments</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-body font-medium text-on-surface truncate">
                          → {tx.receiverId?.name || 'Unknown'}
                        </p>
                        <p className="text-xs text-on-surface-variant truncate">{tx.note || 'Fund Transfer'}</p>
                        <p className="text-xs text-amber-400/60">{fmtDate(tx.createdAt)}</p>
                      </div>
                      <p className="font-headline font-semibold text-sm text-amber-400 flex-shrink-0">
                        +{fmt(tx.amount)}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </MainContent>
    </div>
  );
};

export default AdminFund;
