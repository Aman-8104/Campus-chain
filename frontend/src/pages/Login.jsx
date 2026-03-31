import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [adminForm, setAdminForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [adminError, setAdminError] = useState('');
  const [loading, setLoading] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // Regular user login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const data = await login(form.email, form.password);
      if (data.success) {
        if (data.user?.role === 'admin') {
          // Admin tried the user form — reject and redirect to admin panel below
          setError('Administrator accounts must use the Admin Login section below.');
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

  // Admin-only login — rejects if credentials don't belong to an admin
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setAdminError(''); setAdminLoading(true);
    try {
      const data = await login(adminForm.email, adminForm.password);
      if (data.success) {
        if (data.user?.role === 'admin') {
          navigate('/admin');
        } else {
          // Logged in but not admin — reject
          setAdminError('Access denied. These credentials do not have administrator privileges.');
        }
      } else {
        setAdminError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setAdminError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally { setAdminLoading(false); }
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

      {/* Right — Forms */}
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

          {/* ── User Login Form ── */}
          <div className="mb-8">
            <p className="text-xs uppercase tracking-widest text-on-surface-variant font-body mb-2">Vault Access</p>
            <h1 className="font-headline font-bold text-3xl text-on-surface">Welcome back</h1>
            <p className="text-on-surface-variant font-body mt-2">Please enter your institutional credentials to continue.</p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="mb-4 p-3 rounded-xl bg-error/10 text-error text-sm font-body flex items-center gap-2">
                <span className="material-icons text-base">error_outline</span>{error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-body font-medium text-on-surface-variant mb-2 uppercase tracking-wide">Email</label>
              <input
                type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="input-field" placeholder="you@campus.edu" id="login-email" required
              />
            </div>
            <div>
              <label className="block text-xs font-body font-medium text-on-surface-variant mb-2 uppercase tracking-wide">Password</label>
              <input
                type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="input-field" placeholder="••••••••" id="login-password" required
              />
            </div>
            <button type="submit" disabled={loading} id="login-submit" className="btn-primary w-full mt-2 flex items-center justify-center gap-2">
              {loading ? <span className="material-icons animate-spin text-base">sync</span> : null}
              {loading ? 'Authenticating...' : 'Access Vault'}
            </button>
          </form>

          {/* ── Admin Login Toggle ── */}
          <div className="mt-4">
            <button
              type="button"
              id="admin-login-toggle"
              onClick={() => { setShowAdminPanel(v => !v); setAdminError(''); setAdminForm({ email: '', password: '' }); }}
              className="w-full py-2.5 rounded-xl text-sm font-body font-semibold border border-amber-500/30 bg-amber-500/5 text-amber-400 hover:bg-amber-500/15 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-icons text-base">admin_panel_settings</span>
              {showAdminPanel ? 'Hide Admin Login' : 'Admin Login'}
              <span className="material-icons text-sm ml-auto">{showAdminPanel ? 'expand_less' : 'expand_more'}</span>
            </button>

            <AnimatePresence>
              {showAdminPanel && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="p-5 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="material-icons text-amber-400 text-lg">shield</span>
                      <div>
                        <p className="font-headline font-bold text-amber-400 text-sm">Administrator Access</p>
                        <p className="text-xs text-amber-400/60 font-body">Admin credentials required</p>
                      </div>
                      <div className="ml-auto w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    </div>

                    <AnimatePresence>
                      {adminError && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="p-3 rounded-xl bg-error/10 text-error text-xs font-body flex items-center gap-2">
                          <span className="material-icons text-sm">lock</span>{adminError}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <form onSubmit={handleAdminLogin} className="space-y-3">
                      <div>
                        <label className="block text-xs font-body font-medium text-amber-400/70 mb-1.5 uppercase tracking-wide">Admin Email</label>
                        <input
                          type="email" value={adminForm.email}
                          onChange={e => setAdminForm(f => ({ ...f, email: e.target.value }))}
                          className="input-field text-sm" placeholder="admin@campus.edu"
                          id="admin-email" required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-body font-medium text-amber-400/70 mb-1.5 uppercase tracking-wide">Admin Password</label>
                        <input
                          type="password" value={adminForm.password}
                          onChange={e => setAdminForm(f => ({ ...f, password: e.target.value }))}
                          className="input-field text-sm" placeholder="••••••••"
                          id="admin-password" required
                        />
                      </div>
                      <button
                        type="submit"
                        id="admin-login-submit"
                        disabled={adminLoading}
                        className="w-full py-3 rounded-xl font-headline font-bold text-sm flex items-center justify-center gap-2 transition-all"
                        style={{ background: adminLoading ? 'rgba(245,158,11,0.3)' : 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#000' }}
                      >
                        {adminLoading
                          ? <><span className="material-icons animate-spin text-base">sync</span>Verifying...</>
                          : <><span className="material-icons text-base">login</span>Enter Admin Console</>}
                      </button>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
