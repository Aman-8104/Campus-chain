import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [form, setForm] = useState({ newPassword: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [done, setDone] = useState(false);

  const passwordsMatch = form.newPassword && form.confirm && form.newPassword === form.confirm;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword.length < 8) { setMsg({ text: 'Password must be at least 8 characters', type: 'error' }); return; }
    if (!passwordsMatch) { setMsg({ text: 'Passwords do not match', type: 'error' }); return; }
    setLoading(true); setMsg({ text: '', type: '' });
    try {
      const { data } = await api.post('/auth/reset-password', { token, newPassword: form.newPassword });
      setMsg({ text: data.message, type: 'success' });
      setDone(true);
      setTimeout(() => navigate('/'), 3000);
    } catch (err) {
      setMsg({ text: err.response?.data?.message || 'Reset failed', type: 'error' });
    } finally { setLoading(false); }
  };

  if (!token) return (
    <div className="min-h-screen flex items-center justify-center bg-surface-low">
      <div className="text-center space-y-4">
        <span className="material-icons text-error text-5xl">link_off</span>
        <p className="text-on-surface font-headline font-bold text-xl">Invalid Reset Link</p>
        <Link to="/forgot-password" className="btn-primary inline-flex">Request a new link</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-low p-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="flex items-center gap-2 mb-10 justify-center">
          <div className="w-10 h-10 rounded-xl bg-primary-gradient flex items-center justify-center">
            <span className="material-icons text-white text-xl">link</span>
          </div>
          <span className="font-headline font-bold text-on-surface text-xl">CampusChain</span>
        </div>

        <div className="card p-8 space-y-6">
          <div className="text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${done ? 'bg-tertiary/10' : 'bg-primary/10'}`}>
              <span className={`material-icons text-3xl ${done ? 'text-tertiary' : 'text-primary'}`}>
                {done ? 'check_circle' : 'lock_open'}
              </span>
            </div>
            <h1 className="font-headline font-bold text-2xl text-on-surface">
              {done ? 'Password Reset!' : 'Set New Password'}
            </h1>
            <p className="text-on-surface-variant font-body text-sm mt-2">
              {done ? 'Redirecting you to login in 3 seconds...' : 'Choose a strong password for your account.'}
            </p>
          </div>

          <AnimatePresence>
            {msg.text && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className={`p-4 rounded-xl text-sm font-body flex items-start gap-2
                  ${msg.type === 'success' ? 'bg-tertiary/10 border border-tertiary/20 text-tertiary' : 'bg-error/10 border border-error/20 text-error'}`}>
                <span className="material-icons text-base flex-shrink-0 mt-0.5">
                  {msg.type === 'success' ? 'check_circle' : 'error_outline'}
                </span>
                {msg.text}
              </motion.div>
            )}
          </AnimatePresence>

          {!done && (
            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
              <div>
                <label className="block text-xs font-body text-on-surface-variant mb-2 uppercase tracking-wide">New Password</label>
                <input type="password" className="input-field" id="reset-pw" required minLength={8} autoComplete="new-password"
                  value={form.newPassword} onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-body text-on-surface-variant mb-2 uppercase tracking-wide">Confirm Password</label>
                <input
                  type="password"
                  className={`input-field ${form.confirm && !passwordsMatch ? 'border-error' : form.confirm && passwordsMatch ? 'border-tertiary' : ''}`}
                  id="reset-pw-confirm" required autoComplete="new-password"
                  value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                />
                {form.confirm && !passwordsMatch && <p className="text-xs text-error mt-1 font-body">Passwords don't match</p>}
              </div>
              <button type="submit" disabled={loading} id="reset-submit"
                className="btn-primary w-full flex items-center justify-center gap-2">
                {loading ? <><span className="material-icons animate-spin text-base">sync</span>Resetting...</> : 'Reset Password'}
              </button>
            </form>
          )}

          {done && (
            <Link to="/" className="btn-primary w-full flex items-center justify-center gap-2">
              <span className="material-icons text-base">login</span>Go to Login
            </Link>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
