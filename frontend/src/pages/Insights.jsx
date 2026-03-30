import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const COLORS = ['#00f0ff', '#ff0055', '#00ff66', '#a5b4fc', '#f472b6'];

const Insights = () => {
  const [weekly, setWeekly] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [byCategory, setByCategory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/insights/weekly'), api.get('/insights/monthly')])
      .then(([w, m]) => {
        const weekData = Array(7).fill(0).map((_, i) => ({ day: DAYS[i], spent: 0 }));
        w.data.weekly.forEach(d => { const idx = (d._id.day - 1) % 7; weekData[idx].spent = d.total; });
        setWeekly(weekData);
        setByCategory((w.data.byCategory || []).map(c => ({ name: c._id, value: c.total })));
        const sentMap = {};
        const recvMap = {};
        (m.data.monthly.sent || []).forEach(d => { sentMap[`${d._id.year}-${d._id.month}`] = d.spent; });
        (m.data.monthly.received || []).forEach(d => { recvMap[`${d._id.year}-${d._id.month}`] = d.received; });
        const keys = [...new Set([...Object.keys(sentMap), ...Object.keys(recvMap)])].sort();
        setMonthly(keys.map(k => {
          const [y, mo] = k.split('-');
          return { month: MONTHS[parseInt(mo) - 1], spent: sentMap[k] || 0, received: recvMap[k] || 0 };
        }));
      })
      .finally(() => setLoading(false));
  }, []);

  const fmt = n => `$${(n || 0).toFixed(0)}`;

  return (
    <div className="page-wrapper">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 overflow-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-8">
          <div>
            <h1 className="font-headline font-bold text-3xl text-on-surface">Insights & Analytics</h1>
            <p className="text-on-surface-variant font-body mt-1">Understand your spending patterns and financial health.</p>
          </div>

          {loading ? (
            <div className="space-y-4 animate-pulse">{[1,2,3].map(i => <div key={i} className="h-48 skeleton rounded-xl" />)}</div>
          ) : (
            <>
              {/* Weekly Bar Chart */}
              <div className="card p-6">
                <h2 className="font-headline font-semibold text-on-surface mb-1">Weekly Spending</h2>
                <p className="text-xs text-on-surface-variant font-body mb-6">Last 7 days expenditure</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={weekly} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#a1a1aa', fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={fmt} tick={{ fontSize: 11, fill: '#a1a1aa', fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={v => fmt(v)} contentStyle={{ borderRadius: 12, border: '1px solid #27272a', background: '#050505', boxShadow: '0 0 10px rgba(0,240,255,0.2)', fontFamily: 'Inter', color: '#f4f4f5' }} />
                    <Bar dataKey="spent" fill="#ff0055" radius={[6, 6, 0, 0]} name="Spent" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Monthly Area Chart */}
              <div className="card p-6">
                <h2 className="font-headline font-semibold text-on-surface mb-1">Monthly Cash Flow</h2>
                <p className="text-xs text-on-surface-variant font-body mb-6">Sent vs received over the last 6 months</p>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={monthly} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                    <defs>
                      <linearGradient id="gradSpent" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ff0055" stopOpacity={0.4} /><stop offset="100%" stopColor="#ff0055" stopOpacity={0} /></linearGradient>
                      <linearGradient id="gradReceived" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#00f0ff" stopOpacity={0.4} /><stop offset="100%" stopColor="#00f0ff" stopOpacity={0} /></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#a1a1aa', fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={fmt} tick={{ fontSize: 11, fill: '#a1a1aa', fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={v => fmt(v)} contentStyle={{ borderRadius: 12, border: '1px solid #27272a', background: '#050505', boxShadow: '0 0 10px rgba(0,240,255,0.2)', fontFamily: 'Inter', color: '#f4f4f5' }} />
                    <Legend wrapperStyle={{ color: '#a1a1aa' }} />
                    <Area type="monotone" dataKey="spent" name="Spent" stroke="#ff0055" fill="url(#gradSpent)" strokeWidth={2} dot={false} />
                    <Area type="monotone" dataKey="received" name="Received" stroke="#00f0ff" fill="url(#gradReceived)" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Categories Pie */}
              {byCategory.length > 0 && (
                <div className="card p-6">
                  <h2 className="font-headline font-semibold text-on-surface mb-1">Spending by Category</h2>
                  <p className="text-xs text-on-surface-variant font-body mb-6">Distribution by transaction type</p>
                  <div className="flex items-center gap-8">
                    <ResponsiveContainer width="40%" height={200}>
                      <PieChart>
                        <Pie data={byCategory} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value" paddingAngle={4}>
                          {byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={v => fmt(v)} contentStyle={{ borderRadius: 12, border: '1px solid #27272a', background: '#050505', color: '#f4f4f5' }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-3 flex-1">
                      {byCategory.map((c, i) => (
                        <div key={c.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                            <span className="text-sm font-body text-on-surface capitalize">{c.name}</span>
                          </div>
                          <span className="text-sm font-headline font-semibold text-on-surface">{fmt(c.value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default Insights;
