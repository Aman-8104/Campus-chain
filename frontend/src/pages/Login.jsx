import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState('');

  const quickLogin = async (email, password, label) => {
    setDemoLoading(label); setError('');
    try {
      const data = await login(email, password);
      if (data.success) {
        if (data.user?.role === 'admin') {
          setError('Administrator accounts must log in via the Admin Login page.');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    } finally { setDemoLoading(''); }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const data = await login(form.email, form.password);
      if (data.success) {
        if (data.user?.role === 'admin') {
          setError('Administrator accounts must log in via the Admin Login page.');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex bg-surface-low">
      {/* Left — Branding Panel */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="hidden lg:flex flex-col justify-between w-[55%] bg-navy-gradient p-16 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(78,95,125,0.3),transparent_60%)]" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
              <span className="material-icons text-white text-xl">link</span>
            </div>
            <span className="font-headline font-bold text-white text-xl">CampusChain</span>
          </div>
          <h2 className="font-headline font-bold text-white text-5xl leading-tight mb-6">
            The institutional<br />ledger for<br />modern academia.
          </h2>
          <p className="text-white/60 font-body text-lg leading-relaxed max-w-md">
            Secure, transparent, and immutable financial infrastructure for the world's leading educational institutions.
          </p>
        </div>
        <div className="relative z-10 flex items-center gap-6">
          {['Enterprise Grade Security', 'Blockchain Verified', 'v4.2.0'].map(tag => (
            <span key={tag} className="text-white/50 text-xs font-body font-medium">• {tag}</span>
          ))}
        </div>
      </motion.div>

      {/* Right — Login Form */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
        className="flex-1 flex items-center justify-center p-8"
      >
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-8 h-8 rounded-xl bg-primary-gradient flex items-center justify-center">
              <span className="material-icons text-white text-base">link</span>
            </div>
            <span className="font-headline font-bold text-navy">CampusChain</span>
          </div>

          <div className="mb-8">
            <p className="text-xs uppercase tracking-widest text-on-surface-variant font-body mb-2">Student & Vendor Access</p>
            <h1 className="font-headline font-bold text-3xl text-on-surface">Welcome back</h1>
            <p className="text-on-surface-variant font-body mt-2">Enter your institutional credentials to continue.</p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="mb-4 p-3 rounded-xl bg-error/10 text-error text-sm font-body flex items-center gap-2">
                <span className="material-icons text-base">error_outline</span>{error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
            <div>
              <label className="block text-xs font-body font-medium text-on-surface-variant mb-2 uppercase tracking-wide">Email</label>
              <input
                type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="input-field" id="login-email"
                autoComplete="off" required
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-body font-medium text-on-surface-variant uppercase tracking-wide">Password</label>
                <Link to="/forgot-password" className="text-xs text-primary font-body hover:underline">Forgot password?</Link>
              </div>
              <input
                type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="input-field" id="login-password"
                autoComplete="new-password" required
              />
            </div>
            <button type="submit" disabled={loading} id="login-submit" className="btn-primary w-full mt-2 flex items-center justify-center gap-2">
              {loading ? <span className="material-icons animate-spin text-base">sync</span> : null}
              {loading ? 'Authenticating...' : 'Access Vault'}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-surface-container" />
            <span className="text-xs text-on-surface-variant font-body">or</span>
            <div className="flex-1 h-px bg-surface-container" />
          </div>

          {/* Admin Login Link */}
          <Link
            to="/admin-login"
            id="goto-admin-login"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-body font-semibold border border-amber-500/30 bg-amber-500/5 text-amber-400 hover:bg-amber-500/15 transition-all"
          >
            <span className="material-icons text-base">admin_panel_settings</span>
            Admin Login →
          </Link>

          {/* ── Quick Demo Logins ── */}
          <div className="mt-6 pt-5 border-t border-surface-container/60">
            <p className="text-center text-xs text-on-surface-variant font-body mb-3 uppercase tracking-widest">⚡ Quick Demo</p>
            <div className="grid grid-cols-2 gap-3">

              {/* Prachi — Student */}
              <button
                type="button"
                id="demo-prachi"
                onClick={() => quickLogin('prachi@campus.edu', 'demo1234', 'prachi')}
                disabled={!!demoLoading}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-indigo-500/25 bg-indigo-500/6 hover:bg-indigo-500/15 transition-all disabled:opacity-60"
              >
                <div className="w-9 h-9 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                  {demoLoading === 'prachi'
                    ? <span className="material-icons animate-spin text-indigo-400 text-base">sync</span>
                    : <span className="font-headline font-bold text-indigo-400 text-sm">P</span>}
                </div>
                <div className="text-left">
                  <p className="text-xs font-headline font-semibold text-on-surface leading-none">Prachi</p>
                  <p className="text-[10px] text-on-surface-variant font-body mt-0.5">Student</p>
                </div>
              </button>

              {/* Campus Bookstore — Vendor */}
              <button
                type="button"
                id="demo-vendor"
                onClick={() => quickLogin('vendor@campus.edu', 'demo1234', 'vendor')}
                disabled={!!demoLoading}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-emerald-500/25 bg-emerald-500/6 hover:bg-emerald-500/15 transition-all disabled:opacity-60"
              >
                <div className="w-9 h-9 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  {demoLoading === 'vendor'
                    ? <span className="material-icons animate-spin text-emerald-400 text-base">sync</span>
                    : <span className="material-icons text-emerald-400 text-base">storefront</span>}
                </div>
                <div className="text-left">
                  <p className="text-xs font-headline font-semibold text-on-surface leading-none">Bookstore</p>
                  <p className="text-[10px] text-on-surface-variant font-body mt-0.5">Vendor</p>
                </div>
              </button>

            </div>
          </div>

          {/* Signup Links */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-on-surface-variant text-sm font-body">
              New student?{' '}
              <Link to="/signup" className="text-primary font-semibold hover:underline">Create account →</Link>
            </p>
            <p className="text-on-surface-variant text-sm font-body">
              Registering a business?{' '}
              <Link to="/vendor-signup" className="text-amber-400 font-semibold hover:underline">Vendor sign up →</Link>
            </p>
          </div>

          <div className="mt-8 flex items-center gap-6 justify-center">
            {['System Status', 'Privacy Policy', 'Compliance'].map(link => (
              <button key={link} className="text-xs text-on-surface-variant hover:text-on-surface font-body transition-colors">{link}</button>
            ))}
          </div>
          <p className="text-center text-xs text-on-surface-variant mt-4 font-body">© 2024 CampusChain Institutional Services</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
