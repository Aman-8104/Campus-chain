import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [regForm, setRegForm] = useState({ name: '', email: '', password: '', department: '' });

  const executeLogin = async (email, password) => {
    setError(''); setLoading(true);
    try {
      const data = await login(email, password);
      if (data.success) navigate('/dashboard');
      else setError(data.message || 'Invalid credentials');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  const handleLogin = e => {
    e.preventDefault();
    executeLogin(form.email, form.password);
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
            <p className="text-xs uppercase tracking-widest text-on-surface-variant font-body mb-2">Vault Access</p>
            <h1 className="font-headline font-bold text-3xl text-on-surface">Welcome back</h1>
            <p className="text-on-surface-variant font-body mt-2">Please enter your institutional credentials to continue.</p>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 p-3 rounded-xl bg-error/10 text-error text-sm font-body">
              {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-body font-medium text-on-surface-variant mb-2 uppercase tracking-wide">Email</label>
              <input
                type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="input-field" placeholder="admin@campus.edu" id="login-email" required
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

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => executeLogin('admin@campus.edu', 'admin123')}
              className="btn-tertiary text-sm text-center border border-primary/20 hover:border-transparent">
              Admin Login
            </button>
            <button
              type="button"
              onClick={() => executeLogin('student@campus.edu', 'student123')}
              className="btn-tertiary text-sm text-center border border-primary/20 hover:border-transparent">
              User Login
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-on-surface-variant text-sm font-body">
              New to CampusChain?{' '}
              <button onClick={() => setShowRegister(!showRegister)} className="text-primary font-medium hover:underline">
                Create account
              </button>
            </p>
          </div>

          {showRegister && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-5 rounded-xl bg-surface-low space-y-3">
              <p className="font-headline font-semibold text-on-surface text-sm">New Account</p>
              <input className="input-field text-sm" placeholder="Full Name" value={regForm.name} onChange={e => setRegForm(f => ({ ...f, name: e.target.value }))} id="reg-name" />
              <input className="input-field text-sm" type="email" placeholder="Email" value={regForm.email} onChange={e => setRegForm(f => ({ ...f, email: e.target.value }))} id="reg-email" />
              <input className="input-field text-sm" type="password" placeholder="Password" value={regForm.password} onChange={e => setRegForm(f => ({ ...f, password: e.target.value }))} id="reg-password" />
              <input className="input-field text-sm" placeholder="Department" value={regForm.department} onChange={e => setRegForm(f => ({ ...f, department: e.target.value }))} id="reg-dept" />
              <button
                onClick={async () => {
                  setError(''); setLoading(true);
                  try {
                    const { register } = useAuth();
                    const data = await register(regForm);
                    if (data.success) navigate('/dashboard');
                  } catch (err) { setError(err.response?.data?.message || 'Registration failed'); }
                  finally { setLoading(false); }
                }}
                className="btn-primary w-full text-sm" id="reg-submit"
              >
                Create Account
              </button>
            </motion.div>
          )}

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
