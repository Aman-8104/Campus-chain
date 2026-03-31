import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const CAMPUS_DOMAIN = '@campus.edu';

const Signup = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  // step 1 = basic info, step 2 = Gmail + OTP
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', password: '', department: '', phone: '', recoveryEmail: '', otpCode: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpSuccess, setOtpSuccess] = useState('');

  const emailValid = form.email.toLowerCase().endsWith(CAMPUS_DOMAIN);
  const phoneValid = !form.phone || /^[+]?[0-9]{7,15}$/.test(form.phone.replace(/[\s\-()]/g, ''));
  const recoveryEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.recoveryEmail) &&
    !form.recoveryEmail.toLowerCase().endsWith(CAMPUS_DOMAIN); // must NOT be campus email

  const goToStep2 = (e) => {
    e.preventDefault();
    if (!emailValid) { setError(`Only ${CAMPUS_DOMAIN} emails allowed`); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (form.phone && !phoneValid) { setError('Enter a valid phone number'); return; }
    setError(''); setStep(2);
  };

  const sendOtp = async () => {
    if (!recoveryEmailValid) { setError('Enter a valid personal email (not your campus email)'); return; }
    setOtpSending(true); setError(''); setOtpSuccess('');
    try {
      const { data } = await api.post('/auth/send-otp', { name: form.name, recoveryEmail: form.recoveryEmail });
      if (data.success) { setOtpSent(true); setOtpSuccess(data.message); }
      else setError(data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally { setOtpSending(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otpSent) { setError('Please verify your personal email first'); return; }
    if (!form.otpCode || form.otpCode.length !== 6) { setError('Enter the 6-digit OTP'); return; }
    setError(''); setLoading(true);
    try {
      const data = await register(form);
      if (data.success) { navigate('/dashboard'); }
      else setError(data.message || 'Registration failed');
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

          {/* Steps indicator */}
          <div className="mt-12 space-y-4">
            {[
              { num: 1, label: 'Enter your details', done: step > 1 },
              { num: 2, label: 'Verify your Gmail', done: false },
            ].map(s => (
              <div key={s.num} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all
                  ${s.done ? 'bg-indigo-500 text-white' : step === s.num ? 'bg-white text-indigo-800' : 'bg-white/10 text-white/40'}`}>
                  {s.done ? <span className="material-icons text-sm">check</span> : s.num}
                </div>
                <span className={`font-body text-sm ${step === s.num ? 'text-white' : 'text-white/40'}`}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10">
          <Link to="/" className="text-indigo-400 text-xs font-body font-semibold hover:underline">← Back to Login</Link>
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

          {/* Step pills */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2].map(n => (
              <div key={n} className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= n ? 'bg-primary' : 'bg-surface-container'}`} />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div key="err" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="mb-4 p-3 rounded-xl bg-error/10 text-error text-sm font-body flex items-center gap-2">
                <span className="material-icons text-base">error_outline</span>{error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── STEP 1: Basic Info ── */}
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="mb-6">
                  <p className="text-xs uppercase tracking-widest text-on-surface-variant font-body mb-1">Step 1 of 2</p>
                  <h1 className="font-headline font-bold text-3xl text-on-surface">Create your account</h1>
                  <p className="text-on-surface-variant font-body mt-1 text-sm">Use your <span className="text-primary font-semibold">{CAMPUS_DOMAIN}</span> email.</p>
                </div>
                <form onSubmit={goToStep2} className="space-y-4" autoComplete="off">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-body text-on-surface-variant mb-1.5 uppercase tracking-wide">Full Name *</label>
                      <input className="input-field" id="reg-name" required autoComplete="off"
                        value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                    </div>
                    <div>
                      <label className="block text-xs font-body text-on-surface-variant mb-1.5 uppercase tracking-wide">Department</label>
                      <input className="input-field" placeholder="e.g. CS" id="reg-dept" autoComplete="off"
                        value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-body text-on-surface-variant mb-1.5 uppercase tracking-wide">Campus Email *</label>
                    <div className="relative">
                      <input className={`input-field w-full pr-10 ${form.email && !emailValid ? 'border-error' : form.email && emailValid ? 'border-tertiary' : ''}`}
                        type="email" id="reg-email" required autoComplete="off"
                        value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                      {form.email && (
                        <span className={`material-icons absolute right-3 top-1/2 -translate-y-1/2 text-base ${emailValid ? 'text-tertiary' : 'text-error'}`}>
                          {emailValid ? 'check_circle' : 'cancel'}
                        </span>
                      )}
                    </div>
                    {form.email && !emailValid && <p className="text-xs text-error mt-1 font-body">Must end with {CAMPUS_DOMAIN}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-body text-on-surface-variant mb-1.5 uppercase tracking-wide">Password * (min 8 chars)</label>
                    <input className="input-field" type="password" id="reg-password" required minLength={8} autoComplete="new-password"
                      value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-xs font-body text-on-surface-variant mb-1.5 uppercase tracking-wide">Mobile Number</label>
                    <input className="input-field" placeholder="+91 98765 43210" id="reg-phone" autoComplete="off"
                      value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                  </div>
                  <button type="submit" id="reg-next" className="btn-primary w-full mt-2 flex items-center justify-center gap-2">
                    Continue <span className="material-icons text-base">arrow_forward</span>
                  </button>
                </form>
              </motion.div>
            )}

            {/* ── STEP 2: Gmail + OTP ── */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="mb-6">
                  <p className="text-xs uppercase tracking-widest text-on-surface-variant font-body mb-1">Step 2 of 2</p>
                  <h1 className="font-headline font-bold text-3xl text-on-surface">Verify your email</h1>
                  <p className="text-on-surface-variant font-body mt-1 text-sm">
                    Enter your personal email (Gmail, Outlook, Yahoo, etc.) to receive a verification code.
                    This will be used for password recovery.
                  </p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
                  {/* Gmail input */}
                  <div>
                    <label className="block text-xs font-body text-on-surface-variant mb-1.5 uppercase tracking-wide">Personal Recovery Email *</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-base pointer-events-none">mail</span>
                        <input
                          className={`input-field w-full pl-10 ${form.recoveryEmail && !recoveryEmailValid ? 'border-error' : form.recoveryEmail && recoveryEmailValid ? 'border-tertiary' : ''}`}
                          type="email" id="reg-recovery-email" placeholder="yourname@gmail.com / @outlook.com" autoComplete="off"
                          value={form.recoveryEmail}
                          onChange={e => { setForm(f => ({ ...f, recoveryEmail: e.target.value })); setOtpSent(false); setOtpSuccess(''); }}
                        />
                      </div>
                      <button type="button" onClick={sendOtp} disabled={otpSending || !recoveryEmailValid}
                        className="px-4 py-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 text-sm font-body font-semibold hover:bg-primary/20 transition-all disabled:opacity-40 whitespace-nowrap flex items-center gap-1">
                        {otpSending ? <span className="material-icons animate-spin text-sm">sync</span> : null}
                        {otpSent ? 'Resend' : 'Send OTP'}
                      </button>
                    </div>
                    {form.recoveryEmail && !recoveryEmailValid && (
                      <p className="text-xs text-error mt-1 font-body">
                        {form.recoveryEmail.toLowerCase().endsWith(CAMPUS_DOMAIN)
                          ? 'Cannot use your campus email — use a personal email'
                          : 'Enter a valid email address'}
                      </p>
                    )}
                    {otpSuccess && (
                      <p className="text-xs text-tertiary mt-1 font-body flex items-center gap-1">
                        <span className="material-icons text-sm">check_circle</span>{otpSuccess}
                      </p>
                    )}
                  </div>

                  {/* OTP input */}
                  <AnimatePresence>
                    {otpSent && (
                      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <label className="block text-xs font-body text-on-surface-variant mb-1.5 uppercase tracking-wide">
                          6-Digit OTP *
                        </label>
                        <input
                          className="input-field text-center text-2xl font-headline tracking-widest"
                          maxLength={6} id="reg-otp" placeholder="· · · · · ·"
                          value={form.otpCode}
                          onChange={e => setForm(f => ({ ...f, otpCode: e.target.value.replace(/\D/g, '') }))}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex gap-3 pt-1">
                    <button type="button" onClick={() => { setStep(1); setError(''); }}
                      className="flex-1 py-3 rounded-xl border border-surface-container text-on-surface-variant font-body text-sm hover:bg-surface-container transition-all">
                      ← Back
                    </button>
                    <button type="submit" id="reg-submit" disabled={loading || !otpSent || form.otpCode.length !== 6}
                      className={`flex-1 btn-primary flex items-center justify-center gap-2 ${(!otpSent || form.otpCode.length !== 6) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      {loading ? <><span className="material-icons animate-spin text-base">sync</span>Creating...</> : 'Create Account'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-6 text-center">
            <p className="text-on-surface-variant text-sm font-body">
              Already have an account?{' '}
              <Link to="/" className="text-primary font-semibold hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
