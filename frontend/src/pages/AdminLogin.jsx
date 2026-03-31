import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const AdminLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const data = await login(form.email, form.password);
      if (data.success) {
        if (data.user?.role === 'admin') {
          navigate('/admin');
        } else {
          setError('Access denied. These credentials do not have administrator privileges.');
        }
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex bg-[#0a0a1a]">

      {/* Left — Admin Branding Panel */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="hidden lg:flex flex-col justify-between w-[55%] p-16 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0a0a1a 0%, #1a0f00 50%, #0d0800 100%)' }}
      >
        {/* Glow effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(245,158,11,0.15),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(217,119,6,0.08),transparent_60%)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-amber-500/5 blur-3xl" />

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <span className="material-icons text-amber-400 text-2xl">shield</span>
            </div>
            <div>
              <span className="font-headline font-bold text-amber-400 text-xl">CampusChain</span>
              <p className="text-amber-400/50 text-xs font-body tracking-widest uppercase">Admin Console</p>
            </div>
          </div>

          <h2 className="font-headline font-bold text-5xl leading-tight mb-6" style={{ color: '#f59e0b' }}>
            Institutional<br />Command<br />Centre.
          </h2>
          <p className="text-amber-400/60 font-body text-lg leading-relaxed max-w-md">
            Restricted access. Only authorised administrators may proceed. All activity is logged and monitored.
          </p>

          {/* Security indicators */}
          <div className="mt-12 space-y-3">
            {[
              { icon: 'lock', text: 'End-to-end encrypted session' },
              { icon: 'verified_user', text: 'Multi-layer role verification' },
              { icon: 'visibility', text: 'All actions are audited' },
            ].map(item => (
              <div key={item.text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="material-icons text-amber-400 text-sm">{item.icon}</span>
                </div>
                <span className="text-amber-400/70 text-sm font-body">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-6">
          {['Restricted Access', 'Audit Logged', 'v4.2.0'].map(tag => (
            <span key={tag} className="text-amber-400/30 text-xs font-body font-medium">• {tag}</span>
          ))}
        </div>
      </motion.div>

      {/* Right — Admin Login Form */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
        className="flex-1 flex items-center justify-center p-8"
      >
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <span className="material-icons text-amber-400 text-lg">shield</span>
            </div>
            <div>
              <span className="font-headline font-bold text-amber-400 text-lg">CampusChain</span>
              <p className="text-amber-400/50 text-xs font-body">Admin Console</p>
            </div>
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <p className="text-xs uppercase tracking-widest text-amber-400/60 font-body">Secure Admin Gateway</p>
            </div>
            <h1 className="font-headline font-bold text-3xl text-amber-400">Administrator Login</h1>
            <p className="text-amber-400/50 font-body mt-2 text-sm">Enter your admin credentials to access the control panel.</p>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-body flex items-start gap-2">
                <span className="material-icons text-base flex-shrink-0 mt-0.5">lock</span>
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
            <div>
              <label className="block text-xs font-body font-medium text-amber-400/60 mb-2 uppercase tracking-wide">
                Admin Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="input-field border-amber-500/20 focus:border-amber-400"
                id="admin-login-email"
                autoComplete="off"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-body font-medium text-amber-400/60 mb-2 uppercase tracking-wide">
                Admin Password
              </label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="input-field border-amber-500/20 focus:border-amber-400"
                id="admin-login-password"
                autoComplete="new-password"
                required
              />
            </div>

            <button
              type="submit"
              id="admin-login-submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-headline font-bold text-base flex items-center justify-center gap-2 transition-all mt-2"
              style={{
                background: loading ? 'rgba(245,158,11,0.2)' : 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: loading ? '#f59e0b' : '#000',
                boxShadow: loading ? 'none' : '0 0 30px rgba(245,158,11,0.3), 0 6px 0 #92400e',
              }}
            >
              {loading
                ? <><span className="material-icons animate-spin text-base">sync</span>Verifying...</>
                : <><span className="material-icons text-base">admin_panel_settings</span>Enter Admin Console</>
              }
            </button>
          </form>

          {/* Back link */}
          <div className="mt-8 text-center">
            <Link to="/" className="text-sm text-amber-400/50 hover:text-amber-400 font-body transition-colors flex items-center justify-center gap-1">
              <span className="material-icons text-sm">arrow_back</span>
              Back to User Login
            </Link>
          </div>

          <p className="text-center text-xs text-amber-400/20 mt-6 font-body">
            Unauthorised access attempts are logged and reported.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
