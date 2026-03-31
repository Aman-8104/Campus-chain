import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';

const BUSINESS_TYPES = ['Food & Beverages', 'Bookstore & Stationery', 'Tech & Electronics', 'Health & Pharmacy', 'Clothing & Accessories', 'Printing & Services', 'Sports & Recreation', 'Other'];

const VendorSignup = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', businessName: '', businessType: '', businessDescription: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await api.post('/auth/vendor-register', form);
      if (data.success) {
        setSubmitted(true);
      } else {
        setError(data.message || 'Submission failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally { setLoading(false); }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-low p-8">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
            <span className="material-icons text-white text-4xl">hourglass_top</span>
          </div>
          <div>
            <h1 className="font-headline font-bold text-3xl text-on-surface mb-3">Application Submitted!</h1>
            <p className="text-on-surface-variant font-body text-base leading-relaxed">
              Your vendor application for <span className="text-amber-400 font-semibold">{form.businessName}</span> has been submitted successfully.
            </p>
            <p className="text-on-surface-variant font-body text-sm mt-3">
              Our admin team will review your application and notify you at <span className="text-primary">{form.email}</span>. This usually takes 1–2 business days.
            </p>
          </div>
          <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
            <div className="flex items-center gap-3">
              <span className="material-icons text-amber-400 text-xl">info</span>
              <p className="text-sm text-amber-400/80 font-body text-left">You can log in once your account is approved by the admin.</p>
            </div>
          </div>
          <Link to="/" className="btn-primary inline-flex items-center gap-2">
            <span className="material-icons text-base">login</span>
            Back to Login
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-surface-low">
      {/* Left Panel */}
      <motion.div
        initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
        className="hidden lg:flex flex-col justify-between w-[45%] p-16 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a0a00, #3d1f00, #1a0a00)' }}
      >
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at top right, rgba(245,158,11,0.2), transparent 60%)' }} />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.2)' }}>
              <span className="material-icons text-amber-400 text-xl">storefront</span>
            </div>
            <span className="font-headline font-bold text-amber-400 text-xl">CampusChain</span>
          </div>
          <h2 className="font-headline font-bold text-white text-4xl leading-tight mb-6">
            Sell to the entire<br />campus network.
          </h2>
          <p className="text-white/60 font-body text-base leading-relaxed max-w-md">
            Join as a campus vendor and receive instant blockchain-verified payments from thousands of students.
          </p>
          <div className="mt-10 space-y-4">
            {[
              { icon: 'qr_code_scanner', text: 'Accept QR payments instantly' },
              { icon: 'analytics', text: 'Real-time revenue analytics' },
              { icon: 'security', text: 'Fraud-free, admin-verified account' },
              { icon: 'payments', text: 'Instant settlement to your wallet' },
            ].map(f => (
              <div key={f.text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.1)' }}>
                  <span className="material-icons text-amber-400 text-base">{f.icon}</span>
                </div>
                <span className="text-white/70 font-body text-sm">{f.text}</span>
              </div>
            ))}
          </div>
          <div className="mt-10 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
            <div className="flex items-center gap-2 mb-1">
              <span className="material-icons text-amber-400 text-sm">admin_panel_settings</span>
              <span className="text-amber-400 text-xs font-headline font-bold uppercase tracking-wide">Admin Review Required</span>
            </div>
            <p className="text-white/50 text-xs font-body">All vendor applications are reviewed within 1–2 business days.</p>
          </div>
        </div>
        <div className="relative z-10 flex items-center gap-4">
          <span className="text-white/40 text-xs font-body">Already approved?</span>
          <Link to="/" className="text-amber-400 text-xs font-body font-semibold hover:underline">Sign in →</Link>
        </div>
      </motion.div>

      {/* Right — Form */}
      <motion.div
        initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
        className="flex-1 flex items-center justify-center p-8 overflow-y-auto"
      >
        <div className="w-full max-w-md py-8">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-widest text-on-surface-variant font-body mb-2">Vendor Registration</p>
            <h1 className="font-headline font-bold text-3xl text-on-surface">Apply as a Vendor</h1>
            <p className="text-on-surface-variant font-body mt-2">Fill in your business details. Admin approval required before login.</p>
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
            {/* Business Info */}
            <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-3">
              <p className="text-xs font-headline font-bold text-amber-400 uppercase tracking-wider">Business Details</p>
              <div>
                <label className="block text-xs font-body font-medium text-on-surface-variant mb-1.5 uppercase tracking-wide">Business Name *</label>
                <input className="input-field" placeholder="e.g. Campus Cafe" id="v-bname" required
                  value={form.businessName} onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-body font-medium text-on-surface-variant mb-1.5 uppercase tracking-wide">Business Type *</label>
                <select className="input-field" id="v-btype" required value={form.businessType}
                  onChange={e => setForm(f => ({ ...f, businessType: e.target.value }))}>
                  <option value="">Select type...</option>
                  {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-body font-medium text-on-surface-variant mb-1.5 uppercase tracking-wide">Description</label>
                <textarea className="input-field resize-none" rows={2} placeholder="Briefly describe your business..."
                  id="v-desc" value={form.businessDescription}
                  onChange={e => setForm(f => ({ ...f, businessDescription: e.target.value }))} />
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-3">
              <p className="text-xs font-headline font-bold text-on-surface-variant uppercase tracking-wider">Contact Person</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-body font-medium text-on-surface-variant mb-1.5 uppercase tracking-wide">Full Name *</label>
                  <input className="input-field" placeholder="John Smith" id="v-name" required
                    value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-body font-medium text-on-surface-variant mb-1.5 uppercase tracking-wide">Phone</label>
                  <input className="input-field" placeholder="+1-555-0000" id="v-phone"
                    value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-body font-medium text-on-surface-variant mb-1.5 uppercase tracking-wide">Email *</label>
                <input className="input-field" type="email" placeholder="contact@yourbusiness.com" id="v-email" required
                  value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-body font-medium text-on-surface-variant mb-1.5 uppercase tracking-wide">Password *</label>
                <input className="input-field" type="password" placeholder="Min 8 characters" id="v-password" required minLength={8}
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
              </div>
            </div>

            <button type="submit" id="v-submit" disabled={loading}
              className="w-full py-4 rounded-xl font-headline font-bold text-base flex items-center justify-center gap-2 transition-all"
              style={{ background: loading ? 'rgba(245,158,11,0.3)' : 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#000' }}>
              {loading
                ? <><span className="material-icons animate-spin text-base">sync</span>Submitting...</>
                : <><span className="material-icons text-base">send</span>Submit Application</>}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-on-surface-variant text-sm font-body">
              Already approved?{' '}
              <Link to="/" className="text-primary font-semibold hover:underline">Sign in</Link>
            </p>
            <p className="text-on-surface-variant text-sm font-body">
              Are you a student?{' '}
              <Link to="/signup" className="text-primary font-semibold hover:underline">Student Registration →</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VendorSignup;
