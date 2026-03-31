import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setMsg({ text: '', type: '' });
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setMsg({ text: data.message, type: 'success' });
    } catch (err) {
      setMsg({ text: err.response?.data?.message || 'Something went wrong', type: 'error' });
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-low p-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex items-center gap-2 mb-10 justify-center">
          <div className="w-10 h-10 rounded-xl bg-primary-gradient flex items-center justify-center">
            <span className="material-icons text-white text-xl">link</span>
          </div>
          <span className="font-headline font-bold text-on-surface text-xl">CampusChain</span>
        </div>

        <div className="card p-8 space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <span className="material-icons text-primary text-3xl">lock_reset</span>
            </div>
            <h1 className="font-headline font-bold text-2xl text-on-surface">Forgot your password?</h1>
            <p className="text-on-surface-variant font-body text-sm mt-2">
              Enter your campus email and we'll send a reset link to your personal recovery email.
            </p>
          </div>

          <AnimatePresence>
            {msg.text && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className={`p-4 rounded-xl text-sm font-body flex items-start gap-2
                  ${msg.type === 'success' ? 'bg-tertiary/10 border border-tertiary/20 text-tertiary' : 'bg-error/10 border border-error/20 text-error'}`}>
                <span className="material-icons text-base flex-shrink-0 mt-0.5">
                  {msg.type === 'success' ? 'mark_email_read' : 'error_outline'}
                </span>
                {msg.text}
              </motion.div>
            )}
          </AnimatePresence>

          {msg.type !== 'success' && (
            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
              <div>
                <label className="block text-xs font-body text-on-surface-variant mb-2 uppercase tracking-wide">Campus Email</label>
                <input
                  type="email" className="input-field"
                  id="forgot-email" required autoComplete="off"
                  value={email} onChange={e => setEmail(e.target.value)}
                />
              </div>
              <button type="submit" disabled={loading} id="forgot-submit"
                className="btn-primary w-full flex items-center justify-center gap-2">
                {loading ? <><span className="material-icons animate-spin text-base">sync</span>Sending...</> : 'Send Reset Link'}
              </button>
            </form>
          )}

          <div className="text-center">
            <Link to="/" className="text-sm text-on-surface-variant hover:text-on-surface font-body transition-colors flex items-center justify-center gap-1">
              <span className="material-icons text-sm">arrow_back</span>
              Back to Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
