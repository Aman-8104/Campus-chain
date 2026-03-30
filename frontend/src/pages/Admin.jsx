import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const COLORS = ['#00f0ff', '#ff0055', '#00ff66'];
const fmt = n => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(n || 0);
const fmtFull = n => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0);

const Admin = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [txs, setTxs] = useState([]);

  useEffect(() => {
    Promise.all([api.get('/admin/stats'), api.get('/admin/users'), api.get('/admin/transactions?limit=8')])
      .then(([s, u, t]) => { setStats(s.data.stats); setUsers(u.data.users); setTxs(t.data.transactions); })
      .finally(() => setLoading(false));
  }, []);

  const searchUsers = async () => {
    const { data } = await api.get(`/admin/users?search=${search}`);
    setUsers(data.users);
  };

  const updateRole = async (id, role) => {
    const { data } = await api.patch(`/admin/users/${id}`, { role });
    setUsers(u => u.map(usr => usr._id === id ? { ...usr, role: data.user.role } : usr));
  };

  const toggleStatus = async (id, currentStatus) => {
    const { data } = await api.patch(`/admin/users/${id}`, { isActive: !currentStatus });
    setUsers(u => u.map(usr => usr._id === id ? { ...usr, isActive: data.user.isActive } : usr));
  };

  const monthlyData = (stats?.monthlyData || []).map(d => ({
    month: MONTHS[d._id.month - 1], volume: d.volume, count: d.count
  }));

  const volumeByType = (stats?.volumeByType || []).map(v => ({ name: v._id, value: v.total }));

  return (
    <div className="page-wrapper">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 overflow-auto">
        {loading ? (
          <div className="max-w-6xl mx-auto space-y-4 animate-pulse">{[1,2,3].map(i => <div key={i} className="h-28 skeleton rounded-xl" />)}</div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div>
              <p className="text-xs uppercase tracking-widest text-on-surface-variant font-body mb-1">Institutional Overview</p>
              <h1 className="font-headline font-bold text-3xl text-on-surface">Admin Dashboard</h1>
              <p className="text-on-surface-variant font-body mt-1">Real-time ecosystem health and governance metrics.</p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Total Active Users', value: stats?.totalUsers?.toLocaleString(), icon: 'group', color: 'text-primary' },
                { label: 'Gross Revenue', value: fmt(stats?.grossVolume), icon: 'payments', color: 'text-tertiary' },
                { label: 'System Integrity', value: `${stats?.systemIntegrity}%`, icon: 'shield', color: 'text-secondary' },
                { label: 'Active Nodes', value: stats?.activeNodes?.toLocaleString(), icon: 'device_hub', color: 'text-primary' },
              ].map(s => (
                <div key={s.label} className="stat-card">
                  <div className={`w-9 h-9 rounded-xl ${s.color.replace('text-', 'bg-')}/10 flex items-center justify-center mb-3`}>
                    <span className={`material-icons text-xl ${s.color}`}>{s.icon}</span>
                  </div>
                  <p className="stat-value">{s.value}</p>
                  <p className="stat-label">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-3 gap-4">
              <div className="card p-6 col-span-2">
                <h2 className="font-headline font-semibold text-on-surface mb-1">Spending Trends</h2>
                <p className="text-xs text-on-surface-variant font-body mb-4">Daily volume across all departments</p>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={monthlyData} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eaeff1" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#a1a1aa', fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={v => fmt(v)} tick={{ fontSize: 10, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={v => fmtFull(v)} contentStyle={{ borderRadius: 12, border: '1px solid #27272a', background: '#050505', boxShadow: '0 0 10px rgba(0,240,255,0.2)', fontFamily: 'Inter', color: '#f4f4f5' }} />
                    <Bar dataKey="volume" fill="#00f0ff" radius={[6, 6, 0, 0]} name="Volume" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="card p-6">
                <h2 className="font-headline font-semibold text-on-surface mb-1">Volume Source</h2>
                <p className="text-xs text-on-surface-variant font-body mb-4">By transaction type</p>
                {volumeByType.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={100}>
                      <PieChart>
                        <Pie data={volumeByType} cx="50%" cy="50%" innerRadius={30} outerRadius={44} dataKey="value" paddingAngle={3}>
                          {volumeByType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2 mt-3">
                      {volumeByType.map((v, i) => (
                        <div key={v.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                            <span className="text-xs font-body text-on-surface capitalize">{v.name}</span>
                          </div>
                          <span className="text-xs font-headline font-semibold">{fmt(v.value)}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : <p className="text-xs text-on-surface-variant font-body">No data yet</p>}
              </div>
            </div>

            {/* User Management */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-headline font-semibold text-on-surface">User Management</h2>
                <div className="flex gap-2">
                  <input className="input-field text-sm w-56" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && searchUsers()} id="admin-search" />
                  <button onClick={searchUsers} className="btn-primary text-sm px-4" id="admin-search-btn">Search</button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-body">
                  <thead>
                    <tr className="text-xs uppercase tracking-wide text-on-surface-variant">
                      <th className="text-left pb-3 font-medium">User</th>
                      <th className="text-left pb-3 font-medium">Campus ID</th>
                      <th className="text-left pb-3 font-medium">Balance</th>
                      <th className="text-left pb-3 font-medium">Role</th>
                      <th className="text-left pb-3 font-medium">Status</th>
                      <th className="text-left pb-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container">
                    {users.map(u => (
                      <tr key={u._id} className="hover:bg-surface-low transition-colors">
                        <td className="py-3">
                          <div>
                            <p className="font-medium text-on-surface">{u.name}</p>
                            <p className="text-xs text-on-surface-variant">{u.email}</p>
                          </div>
                        </td>
                        <td className="py-3 font-mono text-xs">{u.campusId}</td>
                        <td className="py-3 font-headline font-semibold">{fmtFull(u.balance)}</td>
                        <td className="py-3">
                          <span className={`badge-${u.role === 'admin' ? 'success' : u.role === 'vendor' ? 'pending' : 'success'} capitalize`}>{u.role}</span>
                        </td>
                        <td className="py-3">
                          <span className={`badge-${u.isActive !== false ? 'success' : 'error'} capitalize`}>
                            {u.isActive !== false ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex gap-2 items-center">
                            <select value={u.role} onChange={e => updateRole(u._id, e.target.value)}
                              className="text-xs bg-surface-container border border-surface-container-high px-2 py-1.5 rounded-lg font-body focus:outline-none focus:border-primary text-on-surface">
                              <option value="student">Student</option>
                              <option value="admin">Admin</option>
                              <option value="vendor">Vendor</option>
                            </select>
                            <button onClick={() => toggleStatus(u._id, u.isActive !== false)} 
                              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${u.isActive !== false ? 'bg-error/10 text-error hover:bg-error/20 border border-error/20' : 'bg-tertiary/10 text-tertiary hover:bg-tertiary/20 border border-tertiary/20'}`}>
                              {u.isActive !== false ? 'Suspend' : 'Activate'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Ledger Activity */}
            <div className="card p-6">
              <h2 className="font-headline font-semibold text-on-surface mb-4">Recent Ledger Activity</h2>
              <div className="space-y-1">
                {txs.map(tx => (
                  <div key={tx._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-low transition-colors">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="material-icons text-primary text-sm">receipt</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-body text-on-surface">{tx.senderId?.name} → {tx.receiverId?.name}</p>
                      <p className="text-xs text-on-surface-variant font-mono">{tx.txHash?.slice(0, 30)}...</p>
                    </div>
                    <p className="font-headline font-semibold text-sm text-on-surface">{fmtFull(tx.amount)}</p>
                    <span className={`badge-${tx.status === 'completed' ? 'success' : 'pending'}`}>{tx.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Admin;
