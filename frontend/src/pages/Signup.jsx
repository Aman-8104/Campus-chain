import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const CAMPUS_DOMAIN = '@campus.edu';

const Signup = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', department: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1=info, 2=success

  const emailValid = form.email.toLowerCase().endsWith(CAMPUS_DOMAIN);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailValid) { setError(`Only ${CAMPUS_DOMAIN} emails allowed`); return; }
    setError(''); setLoading(true);
    try {
      const data = await register(form);
      if (data.success) {
        navigate('/dashboard');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex bg-surface-low">
      {/* Left Panel */}
      <motion.div
        initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
        className="hidden lg:flex flex-col justify-between w-[50%] p-16 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)' }}
      >
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at top right, rgba(99,102,241,0.25), transparent 60%)' }} />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
              <span className="material-icons text-white text-xl">link</span>
            </div>
            <span className="font-headline font-bold text-white text-xl">CampusChain</span>
          </div>
          <h2 className="font-headline font-bold text-white text-5xl leading-tight mb-6">
            Join the campus<br />financial network.
          </h2>
          <p className="text-white/60 font-body text-lg leading-relaxed max-w-md">
            Your institutional wallet, secured by blockchain. Send, receive, and manage funds with your campus community.
          </p>
          <div className="mt-12 space-y-4">
            {[
              { icon: 'verified_user', text: 'Verified with your campus email' },
              { icon: 'bolt', text: 'Instant peer-to-peer transfers' },
              { icon: 'shield', text: 'Blockchain-secured transactions' },
            ].map(f => (
              <div key={f.text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                  <span className="material-icons text-indigo-400 text-base">{f.icon}</span>
                </div>
                <span className="text-white/70 font-body text-sm">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 flex items-center gap-6">
          <span className="text-white/40 text-xs font-body">Already have an account?</span>
          <Link to="/" className="text-indigo-400 text-xs font-body font-semibold hover:underline">Sign in →</Link>
        </div>
      </motion.div>

      {/* Right — Form */}
      <motion.div
        initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
        className="flex-1 flex items-center justify-center p-8"
      >
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-xl bg-primary-gradient flex items-center justify-center">
              <span className="material-icons text-white text-base">link</span>
            </div>
            <span className="font-headline font-bold text-navy">CampusChain</span>
          </div>

          <div className="mb-8">
            <p className="text-xs uppercase tracking-widest text-on-surface-variant font-body mb-2">Student Registration</p>
            <h1 className="font-headline font-bold text-3xl text-on-surface">Create your account</h1>
            <p className="text-on-surface-variant font-body mt-2">Use your institutional <span className="text-primary font-semibold">{CAMPUS_DOMAIN}</span> email to register.</p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mb-4 p-3 rounded-xl bg-error/10 text-error text-sm font-body flex items-center gap-2">
                <span className="material-icons text-base">error_outline</span>{error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-body font-medium text-on-surface-variant mb-1.5 uppercase tracking-wide">Full Name</label>
                <input className="input-field" placeholder="Alex Rivera" id="reg-name" required
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-body font-medium text-on-surface-variant mb-1.5 uppercase tracking-wide">Department</label>
                <input className="input-field" placeholder="Computer Science" id="reg-dept"
                  value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-body font-medium text-on-surface-variant mb-1.5 uppercase tracking-wide">Campus Email</label>
              <div className="relative">
                <input className={`input-field w-full pr-10 ${form.email && !emailValid ? 'border-error' : form.email && emailValid ? 'border-tertiary' : ''}`}
                  type="email" placeholder={`student${CAMPUS_DOMAIN}`} id="reg-email" required
                  value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                {form.email && (
                  <span className={`material-icons absolute right-3 top-1/2 -translate-y-1/2 text-base ${emailValid ? 'text-tertiary' : 'text-error'}`}>
                    {emailValid ? 'check_circle' : 'cancel'}
                  </span>
                )}
              </div>
              {form.email && !emailValid && (
                <p className="text-xs text-error mt-1 font-body">Must end with {CAMPUS_DOMAIN}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-body font-medium text-on-surface-variant mb-1.5 uppercase tracking-wide">Password</label>
              <input className="input-field" type="password" placeholder="Min 8 characters" id="reg-password" required minLength={8}
                value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
            </div>

            <div>
              <label className="block text-xs font-body font-medium text-on-surface-variant mb-1.5 uppercase tracking-wide">Phone (Optional)</label>
              <input className="input-field" placeholder="+1-555-0000" id="reg-phone"
                value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>

            <button type="submit" id="reg-submit" disabled={loading || !emailValid}
              className={`btn-primary w-full mt-2 flex items-center justify-center gap-2 ${!emailValid ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {loading ? <><span className="material-icons animate-spin text-base">sync</span>Creating account...</> : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-on-surface-variant text-sm font-body">
              Already have an account?{' '}
              <Link to="/" className="text-primary font-semibold hover:underline">Sign in</Link>
            </p>
            <p className="text-on-surface-variant text-sm font-body">
              Registering as a vendor?{' '}
              <Link to="/vendor-signup" className="text-secondary font-semibold hover:underline">Vendor Registration →</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
