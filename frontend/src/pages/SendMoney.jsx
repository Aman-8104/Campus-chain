import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const STEPS = ['Find Recipient', 'Enter Amount', 'Confirm & Send'];

const SendMoney = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(0);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [recipient, setRecipient] = useState(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);
  const [txResult, setTxResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setSearching(true);
        try {
          const { data } = await api.get(`/transactions/search-users?q=${encodeURIComponent(query)}`);
          if (data.success) {
            setSearchResults(data.users);
            setShowDropdown(true);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Handle ?to= Query Params (e.g. from QR Scanner)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const toParam = params.get('to');
    if (toParam && step === 0) {
      api.get(`/transactions/search-users?q=${encodeURIComponent(toParam)}`)
        .then(({ data }) => {
          if (data.success && data.users && data.users.length === 1) {
            setRecipient(data.users[0]);
            setStep(1);
          } else {
            setQuery(toParam);
          }
        })
        .catch(console.error);
    }
  }, [location.search]);

  const handleSend = async () => {
    if (!amount || amount <= 0) { setError('Enter a valid amount'); return; }
    setSending(true); setError('');
    try {
      const { data } = await api.post('/transactions/send', { receiverEmail: recipient.email, amount: Number(amount), note });
      if (data.success) { setTxResult(data.transaction); setStep(3); }
    } catch (err) { setError(err.response?.data?.message || 'Transfer failed'); }
    finally { setSending(false); }
  };

  const fmt = n => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0);

  return (
    <div className="page-wrapper">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 overflow-auto">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <p className="text-xs uppercase tracking-widest text-on-surface-variant mb-1 font-body">{user?.name}</p>
            <h1 className="font-headline font-bold text-3xl text-on-surface">Send Money</h1>
            <p className="text-on-surface-variant font-body mt-2">Transfer funds instantly to anyone on CampusChain.</p>
          </div>

          {/* Step Indicator */}
          {step < 3 && (
            <div className="flex items-center gap-2 mb-8">
              {STEPS.map((s, i) => (
                <React.Fragment key={s}>
                  <div className={`flex items-center gap-2 ${i <= step ? 'text-primary' : 'text-on-surface-variant'}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-headline ${i < step ? 'bg-primary text-white' : i === step ? 'bg-primary/20 text-primary' : 'bg-surface-container text-on-surface-variant'}`}>
                      {i < step ? '✓' : i + 1}
                    </div>
                    <span className="text-xs font-body font-medium hidden sm:block">{s}</span>
                  </div>
                  {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 ${i < step ? 'bg-primary' : 'bg-surface-container-highest'}`} />}
                </React.Fragment>
              ))}
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* Step 0 — Find Recipient */}
            {step === 0 && (
              <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="card p-6 space-y-5">
                <h2 className="font-headline font-semibold text-on-surface">Find Recipient</h2>
                <div className="relative">
                  <label className="block text-xs uppercase tracking-wide text-on-surface-variant mb-2 font-body">Search by Name, Email, or Campus ID</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 material-icons text-on-surface-variant">search</span>
                    <input className="input-field pl-12" placeholder="Start typing a name..." value={query} 
                      onChange={e => setQuery(e.target.value)} onFocus={() => query.length >= 2 && setShowDropdown(true)} 
                      onBlur={() => setTimeout(() => setShowDropdown(false), 200)} />
                  </div>
                  
                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {showDropdown && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} 
                        className="absolute z-50 w-full mt-2 bg-surface-lowest border border-surface-container rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden">
                        {searching ? (
                          <div className="p-4 text-center text-sm text-on-surface-variant font-body animate-pulse">Searching...</div>
                        ) : searchResults.length > 0 ? (
                          <ul className="max-h-64 overflow-y-auto custom-scrollbar">
                            {searchResults.map(u => (
                              <li key={u._id} onMouseDown={() => { setRecipient(u); setStep(1); setShowDropdown(false); setQuery(''); }}
                                className="p-3 hover:bg-surface-low border-b border-surface-container/50 last:border-none cursor-pointer flex items-center gap-3 transition-colors">
                                <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold font-headline">
                                  {u.name.charAt(0)}
                                </div>
                                <div className="text-left">
                                  <p className="text-sm font-semibold text-on-surface font-headline">{u.name}</p>
                                  <p className="text-xs text-on-surface-variant font-body">{u.email}</p>
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="p-4 text-center text-sm text-on-surface-variant font-body">No users found</div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* Step 1 — Enter Amount */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                {/* Recipient Card */}
                <div className="card p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-gradient flex items-center justify-center">
                    <span className="text-white font-bold font-headline text-lg">{recipient?.name?.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-headline font-semibold text-on-surface">{recipient?.name}</p>
                    <p className="text-on-surface-variant text-sm font-body">{recipient?.email} · {recipient?.campusId}</p>
                  </div>
                  <button onClick={() => setStep(0)} className="ml-auto text-on-surface-variant hover:text-error transition-colors">
                    <span className="material-icons">close</span>
                  </button>
                </div>

                <div className="card p-6 space-y-4">
                  <h2 className="font-headline font-semibold text-on-surface">Transaction Summary</h2>
                  <div>
                    <label className="block text-xs uppercase tracking-wide text-on-surface-variant mb-2 font-body">Amount (USD)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-body">$</span>
                      <input type="number" min="0.01" step="0.01" className="input-field pl-8" placeholder="0.00"
                        value={amount} onChange={e => setAmount(e.target.value)} id="send-amount" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wide text-on-surface-variant mb-2 font-body">Note (Optional)</label>
                    <input className="input-field" placeholder="e.g. Lunch split" value={note} onChange={e => setNote(e.target.value)} id="send-note" />
                  </div>
                  {error && <p className="text-error text-sm font-body">{error}</p>}
                  <p className="text-xs text-on-surface-variant font-body">
                    Funds will be transferred instantly using CampusChain's secure peer-to-peer network.
                  </p>
                  <button onClick={() => { if (!amount) return; setError(''); setStep(2); }} className="btn-primary w-full" id="review-transfer">
                    Review Transfer
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2 — Confirm */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="card p-6 space-y-6">
                <h2 className="font-headline font-semibold text-on-surface">Review Transfer</h2>
                <p className="text-on-surface-variant text-sm font-body">Please confirm the details of your transfer to {recipient?.name}.</p>
                <div className="bg-surface-low rounded-xl p-4 space-y-3">
                  {[
                    { label: 'To', value: `${recipient?.name} (${recipient?.campusId})` },
                    { label: 'Amount', value: fmt(amount), bold: true },
                    { label: 'Note', value: note || '—' },
                    { label: 'Network Fee', value: '$0.00 (Sponsored)' },
                  ].map(row => (
                    <div key={row.label} className="flex justify-between">
                      <span className="text-xs uppercase tracking-wide text-on-surface-variant font-body">{row.label}</span>
                      <span className={`text-sm font-body ${row.bold ? 'font-bold text-on-surface' : 'text-on-surface'}`}>{row.value}</span>
                    </div>
                  ))}
                </div>
                {error && <p className="text-error text-sm font-body">{error}</p>}
                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="btn-secondary flex-1">Back</button>
                  <button onClick={handleSend} disabled={sending} className="btn-primary flex-1 flex justify-center items-center gap-2" id="confirm-send">
                    {sending && <span className="material-icons animate-spin text-base">sync</span>}
                    {sending ? 'Sending...' : 'Confirm & Send'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3 — Success */}
            {step === 3 && txResult && (
              <motion.div key="step3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-tertiary/10 flex items-center justify-center mx-auto">
                  <span className="material-icons text-tertiary text-3xl">check_circle</span>
                </div>
                <h2 className="font-headline font-bold text-2xl text-on-surface">Transfer Successful!</h2>
                <p className="text-5xl font-headline font-bold text-primary">{fmt(txResult.amount)}</p>
                <p className="text-on-surface-variant font-body text-sm">Sent to <strong>{recipient?.name}</strong></p>
                <div className="bg-surface-low rounded-xl p-4 mt-4 text-left">
                  <p className="text-xs uppercase tracking-wide text-on-surface-variant mb-1 font-body">Transaction Hash</p>
                  <p className="font-mono text-xs text-on-surface break-all">{txResult.txHash}</p>
                </div>
                <div className="flex gap-3 mt-4">
                  <button onClick={() => navigate(`/transactions/${txResult._id}`)} className="btn-secondary flex-1">View Details</button>
                  <button onClick={() => navigate('/dashboard')} className="btn-primary flex-1">Return Home</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default SendMoney;
