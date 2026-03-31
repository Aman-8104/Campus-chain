import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import MainContent from '../components/MainContent';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Settings = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: '', department: '', phone: '' });
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [pwMsg, setPwMsg] = useState({ text: '', type: '' });
  const [saving, setSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);

  // Load current profile from backend so we pre-fill with real saved values
  useEffect(() => {
    api.get('/auth/me').then(({ data }) => {
      if (data.success) {
        setForm({
          name: data.user.name || '',
          department: data.user.department || '',
          phone: data.user.phone || '',
        });
        setProfileLoaded(true);
      }
    }).catch(() => {
      // Fallback to token data
      setForm({ name: user?.name || '', department: '', phone: '' });
      setProfileLoaded(true);
    });
  }, []);

  const phoneValid = !form.phone || /^[+]?[0-9]{7,15}$/.test(form.phone.replace(/[\s\-()]/g, ''));

  const handleProfile = async e => {
    e.preventDefault();
    if (!form.name.trim()) { setMsg({ text: 'Name cannot be empty', type: 'error' }); return; }
    if (form.phone && !phoneValid) { setMsg({ text: 'Enter a valid mobile number', type: 'error' }); return; }
    setSaving(true); setMsg({ text: '', type: '' });
    try {
      const { data } = await api.patch('/auth/me', form);
      setMsg({ text: data.message || 'Profile updated!', type: 'success' });
    } catch (err) {
      setMsg({ text: err.response?.data?.message || 'Update failed', type: 'error' });
    } finally { setSaving(false); }
  };

  const handlePassword = async e => {
    e.preventDefault();
    if (!pwForm.current || !pwForm.newPw || !pwForm.confirm) {
      setPwMsg({ text: 'All fields are required', type: 'error' }); return;
    }
    if (pwForm.newPw.length < 8) {
      setPwMsg({ text: 'New password must be at least 8 characters', type: 'error' }); return;
    }
    if (pwForm.newPw !== pwForm.confirm) {
      setPwMsg({ text: 'New passwords do not match', type: 'error' }); return;
    }
    setPwSaving(true); setPwMsg({ text: '', type: '' });
    try {
      const { data } = await api.patch('/auth/change-password', pwForm);
      setPwMsg({ text: data.message || 'Password updated successfully!', type: 'success' });
      setPwForm({ current: '', newPw: '', confirm: '' });
    } catch (err) {
      setPwMsg({ text: err.response?.data?.message || 'Update failed', type: 'error' });
    } finally { setPwSaving(false); }
  };

  return (
    <div className="page-wrapper">
      <Sidebar />
      <MainContent>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-8">
          <div>
            <h1 className="font-headline font-bold text-2xl lg:text-3xl text-on-surface">Settings & Profile</h1>
            <p className="text-on-surface-variant font-body mt-1 text-sm">Manage your account details and preferences.</p>
          </div>

          {/* Profile Card */}
          <div className="card p-6">
            {/* Avatar row */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-primary-gradient flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold font-headline text-xl lg:text-2xl">{user?.name?.charAt(0)}</span>
              </div>
              <div>
                <p className="font-headline font-bold text-on-surface text-lg lg:text-xl">{user?.name}</p>
                <p className="text-on-surface-variant font-body text-sm">{user?.email}</p>
                <span className="badge-success capitalize mt-1 inline-flex">{user?.role}</span>
              </div>
            </div>

            {!profileLoaded ? (
              <div className="space-y-3 animate-pulse">
                {[1,2,3].map(i => <div key={i} className="h-12 skeleton rounded-xl" />)}
              </div>
            ) : (
              <form onSubmit={handleProfile} className="space-y-4">
                <h2 className="font-headline font-semibold text-on-surface text-sm uppercase tracking-wide">Personal Information</h2>

                {/* Name */}
                <div>
                  <label className="block text-xs font-body text-on-surface-variant mb-2 uppercase tracking-wide">
                    Full Name <span className="text-error">*</span>
                  </label>
                  <input
                    className="input-field"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    id="settings-name"
                    required
                  />
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-xs font-body text-on-surface-variant mb-2 uppercase tracking-wide">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-base pointer-events-none">
                      smartphone
                    </span>
                    <input
                      className={`input-field pl-10 ${form.phone && !phoneValid ? 'border-error' : form.phone && phoneValid ? 'border-tertiary' : ''}`}
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      id="settings-phone"
                      placeholder="+91 98765 43210"
                    />
                    {form.phone && (
                      <span className={`material-icons absolute right-3 top-1/2 -translate-y-1/2 text-base ${phoneValid ? 'text-tertiary' : 'text-error'}`}>
                        {phoneValid ? 'check_circle' : 'cancel'}
                      </span>
                    )}
                  </div>
                  {form.phone && !phoneValid && (
                    <p className="text-xs text-error mt-1 font-body">Enter a valid number (7–15 digits)</p>
                  )}
                </div>

                {/* Department */}
                <div>
                  <label className="block text-xs font-body text-on-surface-variant mb-2 uppercase tracking-wide">Department</label>
                  <input
                    className="input-field"
                    placeholder="e.g. Computer Science"
                    value={form.department}
                    onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                    id="settings-dept"
                  />
                </div>

                {/* Feedback */}
                <AnimatePresence>
                  {msg.text && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className={`text-sm font-body flex items-center gap-2 ${msg.type === 'success' ? 'text-tertiary' : 'text-error'}`}>
                      <span className="material-icons text-base">
                        {msg.type === 'success' ? 'check_circle' : 'error_outline'}
                      </span>
                      {msg.text}
                    </motion.p>
                  )}
                </AnimatePresence>

                <div className="flex justify-end">
                  <button type="submit" className="btn-primary px-8" id="save-profile" disabled={saving || !phoneValid}>
                    {saving ? <><span className="material-icons animate-spin text-base mr-1">sync</span>Saving...</> : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Security */}
          <div className="card p-6 space-y-4">
            <h2 className="font-headline font-semibold text-on-surface">Security</h2>
            <form onSubmit={handlePassword} className="space-y-3" autoComplete="off">
              <div>
                <label className="block text-xs font-body text-on-surface-variant mb-2 uppercase tracking-wide">Current Password</label>
                <input type="password" className="input-field" value={pwForm.current}
                  onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))}
                  id="pw-current" autoComplete="new-password" required />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-body text-on-surface-variant mb-2 uppercase tracking-wide">New Password</label>
                  <input type="password" className="input-field" value={pwForm.newPw}
                    onChange={e => setPwForm(f => ({ ...f, newPw: e.target.value }))}
                    id="pw-new" autoComplete="new-password" required minLength={8} />
                </div>
                <div>
                  <label className="block text-xs font-body text-on-surface-variant mb-2 uppercase tracking-wide">Confirm Password</label>
                  <input type="password" className={`input-field ${pwForm.confirm && pwForm.newPw !== pwForm.confirm ? 'border-error' : pwForm.confirm && pwForm.newPw === pwForm.confirm ? 'border-tertiary' : ''}`}
                    value={pwForm.confirm}
                    onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
                    id="pw-confirm" autoComplete="new-password" required />
                </div>
              </div>

              <AnimatePresence>
                {pwMsg.text && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className={`text-sm font-body flex items-center gap-2 ${pwMsg.type === 'success' ? 'text-tertiary' : 'text-error'}`}>
                    <span className="material-icons text-base">
                      {pwMsg.type === 'success' ? 'check_circle' : 'error_outline'}
                    </span>
                    {pwMsg.text}
                  </motion.p>
                )}
              </AnimatePresence>

              <div className="flex justify-end">
                <button type="submit" className="btn-secondary text-sm px-6" id="change-password" disabled={pwSaving}>
                  {pwSaving
                    ? <><span className="material-icons animate-spin text-base mr-1">sync</span>Updating...</>
                    : 'Update Password'}
                </button>
              </div>
            </form>
          </div>

          {/* System Info */}
          <div className="card-container p-5 flex items-center gap-4">
            <span className="material-icons text-primary text-xl">support_agent</span>
            <div>
              <p className="font-body font-semibold text-on-surface text-sm">Need Help?</p>
              <p className="text-xs text-on-surface-variant font-body">Institutional support is available 24/7 for account queries.</p>
            </div>
          </div>
        </motion.div>
      </MainContent>
    </div>
  );
};

export default Settings;
