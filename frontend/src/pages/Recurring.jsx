import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';

const FREQ_LABELS = { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly' };
const fmt = n => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0);

const Recurring = () => {
  const [recurring, setRecurring] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ receiverEmail: '', amount: '', frequency: 'weekly', label: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/recurring').then(({ data }) => setRecurring(data.recurring)).finally(() => setLoading(false));
  }, []);

  const handleCreate = async e => {
    e.preventDefault(); setError(''); setSubmitting(true);
    try {
      const { data } = await api.post('/recurring', { ...form, amount: Number(form.amount) });
      if (data.success) { setRecurring(r => [data.recurring, ...r]); setShowForm(false); setForm({ receiverEmail: '', amount: '', frequency: 'weekly', label: '' }); }
    } catch (err) { setError(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const toggle = async (id) => {
    const { data } = await api.patch(`/recurring/${id}/toggle`);
    setRecurring(r => r.map(rec => rec._id === id ? data.recurring : rec));
  };

  const remove = async (id) => {
    await api.delete(`/recurring/${id}`);
    setRecurring(r => r.filter(rec => rec._id !== id));
  };

  return (
    <div className="page-wrapper">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 overflow-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-headline font-bold text-3xl text-on-surface">Recurring Payments</h1>
              <p className="text-on-surface-variant font-body mt-1">Automate regular transfers to people you frequently pay.</p>
            </div>
            <button onClick={() => setShowForm(!showForm)} id="new-recurring" className="btn-primary flex items-center gap-2 text-sm px-4 py-2.5">
              <span className="material-icons text-base">add</span> New
            </button>
          </div>

          {showForm && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
              <h2 className="font-headline font-semibold text-on-surface mb-4">New Recurring Payment</h2>
              <form onSubmit={handleCreate} className="space-y-3">
                <input className="input-field text-sm" placeholder="Recipient email" value={form.receiverEmail} onChange={e => setForm(f => ({ ...f, receiverEmail: e.target.value }))} required id="rec-email" />
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" className="input-field text-sm" placeholder="Amount (USD)" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} min="0.01" step="0.01" required id="rec-amount" />
                  <select className="input-field text-sm" value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))} id="rec-freq">
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <input className="input-field text-sm" placeholder="Label (optional)" value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} id="rec-label" />
                {error && <p className="text-error text-sm font-body">{error}</p>}
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                  <button type="submit" className="btn-primary flex-1" disabled={submitting} id="rec-submit">
                    {submitting ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {loading ? (
            <div className="space-y-3 animate-pulse">{[1,2,3].map(i => <div key={i} className="h-20 skeleton rounded-xl" />)}</div>
          ) : recurring.length === 0 ? (
            <div className="card p-12 text-center text-on-surface-variant font-body">
              <span className="material-icons text-4xl mb-3 block text-on-surface-variant">autorenew</span>
              No recurring payments set up yet
            </div>
          ) : (
            <div className="space-y-3">
              {recurring.map((r, i) => (
                <motion.div key={r._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                  className="card p-4 flex items-center gap-4"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${r.active ? 'bg-primary/10' : 'bg-surface-container'}`}>
                    <span className={`material-icons text-xl ${r.active ? 'text-primary' : 'text-on-surface-variant'}`}>autorenew</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-body font-semibold text-on-surface text-sm">{r.label}</p>
                    <p className="text-xs text-on-surface-variant">{r.receiverId?.name} · {FREQ_LABELS[r.frequency]}</p>
                    <p className="text-xs text-on-surface-variant">Next: {new Date(r.nextRun).toLocaleDateString()}</p>
                  </div>
                  <p className="font-headline font-bold text-on-surface">{fmt(r.amount)}</p>
                  <div className="flex gap-2">
                    <button onClick={() => toggle(r._id)} className={`w-8 h-8 rounded-xl flex items-center justify-center ${r.active ? 'bg-tertiary/10 text-tertiary' : 'bg-error/10 text-error'} hover:opacity-80 transition-opacity`}>
                      <span className="material-icons text-base">{r.active ? 'pause' : 'play_arrow'}</span>
                    </button>
                    <button onClick={() => remove(r._id)} className="w-8 h-8 rounded-xl flex items-center justify-center bg-error/10 text-error hover:opacity-80 transition-opacity">
                      <span className="material-icons text-base">delete</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default Recurring;
