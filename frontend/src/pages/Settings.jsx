import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Settings = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', department: '', phone: '' });
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const handleProfile = async e => {
    e.preventDefault(); setSaving(true); setMsg('');
    try {
      await api.patch('/auth/me', form);
      setMsg('Profile updated successfully');
    } catch (err) { setMsg(err.response?.data?.message || 'Update failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="page-wrapper">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 overflow-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-8">
          <div>
            <h1 className="font-headline font-bold text-3xl text-on-surface">Settings & Profile</h1>
            <p className="text-on-surface-variant font-body mt-1">Manage your account details and preferences.</p>
          </div>

          {/* Profile Card */}
          <div className="card p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-primary-gradient flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold font-headline text-2xl">{user?.name?.charAt(0)}</span>
              </div>
              <div>
                <p className="font-headline font-bold text-on-surface text-xl">{user?.name}</p>
                <p className="text-on-surface-variant font-body text-sm">{user?.email}</p>
                <span className="badge-success capitalize mt-1 inline-flex">{user?.role}</span>
              </div>
            </div>

            <form onSubmit={handleProfile} className="space-y-4">
              <h2 className="font-headline font-semibold text-on-surface text-sm uppercase tracking-wide">Personal Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-body text-on-surface-variant mb-2 uppercase tracking-wide">Full Name</label>
                  <input className="input-field" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} id="settings-name" />
                </div>
                <div>
                  <label className="block text-xs font-body text-on-surface-variant mb-2 uppercase tracking-wide">Campus ID</label>
                  <input className="input-field opacity-60" value={user?.campusId || ''} readOnly id="settings-campusid" />
                </div>
                <div>
                  <label className="block text-xs font-body text-on-surface-variant mb-2 uppercase tracking-wide">Department</label>
                  <input className="input-field" placeholder="e.g. Computer Science" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} id="settings-dept" />
                </div>
                <div>
                  <label className="block text-xs font-body text-on-surface-variant mb-2 uppercase tracking-wide">Phone</label>
                  <input className="input-field" placeholder="+1-555-0000" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} id="settings-phone" />
                </div>
              </div>
              {msg && <p className="text-sm text-tertiary font-body">{msg}</p>}
              <div className="flex justify-end">
                <button type="submit" className="btn-primary px-8" id="save-profile" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Security */}
          <div className="card p-6 space-y-4">
            <h2 className="font-headline font-semibold text-on-surface">Security</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-body text-on-surface-variant mb-2 uppercase tracking-wide">Current Password</label>
                <input type="password" className="input-field" placeholder="••••••••" value={pwForm.current} onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))} id="pw-current" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-body text-on-surface-variant mb-2 uppercase tracking-wide">New Password</label>
                  <input type="password" className="input-field" placeholder="••••••••" value={pwForm.newPw} onChange={e => setPwForm(f => ({ ...f, newPw: e.target.value }))} id="pw-new" />
                </div>
                <div>
                  <label className="block text-xs font-body text-on-surface-variant mb-2 uppercase tracking-wide">Confirm</label>
                  <input type="password" className="input-field" placeholder="••••••••" value={pwForm.confirm} onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} id="pw-confirm" />
                </div>
              </div>
              <button className="btn-secondary text-sm" id="change-password">Update Password</button>
            </div>
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
      </main>
    </div>
  );
};

export default Settings;
