import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import Sidebar from '../components/Sidebar';
import MainContent from '../components/MainContent';
import api from '../api/axios';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Screenshot-accurate palette
const CYAN  = '#00e5ff';
const PINK  = '#ff2d6d';
const GREEN = '#00e676';
const PIE_COLORS = [CYAN, PINK, GREEN, '#f59e0b', '#a855f7'];

const axisStyle = { fontSize: 11, fill: '#6b7280', fontFamily: 'Inter' };
const fmt = n => `$${(n || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

/* ── Custom Tooltip matching the screenshot ── */
const CashFlowTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const spent    = payload.find(p => p.dataKey === 'spent')?.value    || 0;
  const received = payload.find(p => p.dataKey === 'received')?.value || 0;
  return (
    <div style={{
      background: '#111',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 12,
      padding: '12px 16px',
      minWidth: 180,
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    }}>
      <p style={{ color: '#fff', fontWeight: 700, marginBottom: 8, fontFamily: 'Inter', fontSize: 14 }}>{label}</p>
      <p style={{ color: PINK,  fontFamily: 'Inter', fontSize: 13, marginBottom: 4 }}>
        Spent : <strong>{fmt(spent)}</strong>
      </p>
      <p style={{ color: CYAN, fontFamily: 'Inter', fontSize: 13 }}>
        Received : <strong>{fmt(received)}</strong>
      </p>
    </div>
  );
};

/* ── Custom active dot ── */
const ActiveDotCyan  = (props) => <circle {...props} r={5} fill={CYAN}  stroke={CYAN}  strokeWidth={2} />;
const ActiveDotPink  = (props) => <circle {...props} r={5} fill={PINK}  stroke={PINK}  strokeWidth={2} />;

/* ── Glow bar for weekly chart ── */
const GlowBar = ({ x, y, width, height, fill }) => {
  if (!height || height <= 0) return null;
  return (
    <g>
      <defs>
        <filter id={`gbar-${x}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <rect x={x} y={y} width={width} height={height} rx={6} ry={6} fill={fill} filter={`url(#gbar-${x})`} />
    </g>
  );
};

const Insights = () => {
  const [weekly, setWeekly]       = useState([]);
  const [monthly, setMonthly]     = useState([]);
  const [byCategory, setByCategory] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([api.get('/insights/weekly'), api.get('/insights/monthly')])
      .then(([w, m]) => {
        const weekData = Array(7).fill(0).map((_, i) => ({ day: DAYS[i], spent: 0 }));
        w.data.weekly.forEach(d => { const idx = (d._id.day - 1) % 7; weekData[idx].spent = d.total; });
        setWeekly(weekData);
        setByCategory((w.data.byCategory || []).map(c => ({ name: c._id, value: c.total })));

        const sentMap = {}, recvMap = {};
        (m.data.monthly.sent     || []).forEach(d => { sentMap[`${d._id.year}-${d._id.month}`] = d.spent;    });
        (m.data.monthly.received || []).forEach(d => { recvMap[`${d._id.year}-${d._id.month}`] = d.received; });
        const keys = [...new Set([...Object.keys(sentMap), ...Object.keys(recvMap)])].sort();
        setMonthly(keys.map(k => {
          const [, mo] = k.split('-');
          return { month: MONTHS[parseInt(mo) - 1], spent: sentMap[k] || 0, received: recvMap[k] || 0 };
        }));
      })
      .finally(() => setLoading(false));
  }, []);

  const totalSpent = weekly.reduce((s, d) => s + d.spent, 0);
  const maxDay     = weekly.reduce((best, d) => d.spent > best.spent ? d : best, { day: '—', spent: 0 });

  return (
    <div className="page-wrapper">
      <Sidebar />
      <MainContent>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-6">

          {/* Header */}
          <div>
            <p className="text-xs uppercase tracking-widest text-on-surface-variant font-body mb-1">Financial Intelligence</p>
            <h1 className="font-headline font-bold text-2xl lg:text-3xl text-on-surface">Insights & Analytics</h1>
            <p className="font-body mt-1 text-sm" style={{ color: '#6366f1' }}>Understand your spending patterns and financial health.</p>
          </div>

          {loading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3].map(i => <div key={i} className="h-64 skeleton rounded-2xl" />)}
            </div>
          ) : (
            <>
              {/* KPI Strip */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { label: 'This Week',   value: fmt(totalSpent),  sub: 'Total spent',    icon: 'trending_down', color: PINK  },
                  { label: 'Busiest Day', value: maxDay.day,        sub: fmt(maxDay.spent)+ ' spent', icon: 'bolt', color: '#f59e0b' },
                  { label: 'Categories',  value: byCategory.length || '—', sub: 'Spending types', icon: 'category', color: CYAN },
                ].map(k => (
                  <motion.div key={k.label} whileHover={{ y: -3 }}
                    className="rounded-2xl p-4 lg:p-5 flex items-center gap-4"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${k.color}18` }}>
                      <span className="material-icons text-xl" style={{ color: k.color }}>{k.icon}</span>
                    </div>
                    <div>
                      <p className="font-headline font-bold text-lg lg:text-xl text-on-surface">{k.value}</p>
                      <p className="text-xs text-on-surface-variant font-body">{k.sub}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* ── Monthly Cash Flow ── */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="rounded-2xl p-5 lg:p-6"
                style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="mb-5">
                  <h2 className="font-headline font-bold text-base lg:text-lg text-on-surface">Monthly Cash Flow</h2>
                  <p className="text-xs text-on-surface-variant font-body mt-0.5">Sent vs received over the last 6 months</p>
                </div>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={monthly} margin={{ top: 10, right: 8, bottom: 0, left: 4 }}>
                    <defs>
                      <linearGradient id="gradSpent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor={PINK} stopOpacity={0.4} />
                        <stop offset="100%" stopColor={PINK} stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient id="gradReceived" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor={CYAN} stopOpacity={0.35} />
                        <stop offset="100%" stopColor={CYAN} stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={fmt} tick={axisStyle} axisLine={false} tickLine={false} width={52} />
                    <Tooltip content={<CashFlowTooltip />}
                      cursor={{ stroke: 'rgba(255,255,255,0.15)', strokeWidth: 1 }} />
                    <Area type="monotone" dataKey="spent"    name="Spent"
                      stroke={PINK} strokeWidth={2.5} fill="url(#gradSpent)"
                      dot={false} activeDot={<ActiveDotPink />} />
                    <Area type="monotone" dataKey="received" name="Received"
                      stroke={CYAN} strokeWidth={2.5} fill="url(#gradReceived)"
                      dot={false} activeDot={<ActiveDotCyan />} />
                  </AreaChart>
                </ResponsiveContainer>
                {/* Legend */}
                <div className="flex items-center justify-center gap-6 mt-4">
                  {[{ label: 'Spent', color: PINK }, { label: 'Received', color: CYAN }].map(l => (
                    <div key={l.label} className="flex items-center gap-2">
                      <div className="w-4 h-0.5 rounded-full" style={{ background: l.color }} />
                      <div className="w-2 h-2 rounded-full" style={{ background: l.color }} />
                      <div className="w-4 h-0.5 rounded-full" style={{ background: l.color }} />
                      <span className="text-xs font-body" style={{ color: l.color }}>{l.label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* ── Spending by Category Donut ── */}
              {byCategory.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className="rounded-2xl p-5 lg:p-6"
                  style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="mb-5">
                    <h2 className="font-headline font-bold text-base lg:text-lg text-on-surface">Spending by Category</h2>
                    <p className="text-xs text-on-surface-variant font-body mt-0.5">Distribution by transaction type</p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-8">
                    {/* Donut */}
                    <div className="relative flex-shrink-0">
                      <ResponsiveContainer width={200} height={200}>
                        <PieChart>
                          <Pie data={byCategory} cx="50%" cy="50%"
                            innerRadius={62} outerRadius={90}
                            dataKey="value" paddingAngle={4}
                            startAngle={90} endAngle={-270}
                            stroke="none">
                            {byCategory.map((_, i) => (
                              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={v => [fmt(v), 'Amount']}
                            contentStyle={{
                              background: '#111', border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: 10, fontFamily: 'Inter',
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Legend — matches screenshot exactly */}
                    <div className="flex-1 w-full space-y-4">
                      {byCategory.map((c, i) => (
                        <div key={c.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ background: PIE_COLORS[i % PIE_COLORS.length],
                                boxShadow: `0 0 8px ${PIE_COLORS[i % PIE_COLORS.length]}` }} />
                            <span className="font-body text-sm text-on-surface capitalize">{c.name}</span>
                          </div>
                          <span className="font-headline font-semibold text-sm text-on-surface">{fmt(c.value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── Weekly Spending Bar Chart ── */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="rounded-2xl p-5 lg:p-6"
                style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="mb-5">
                  <h2 className="font-headline font-bold text-base lg:text-lg text-on-surface">Weekly Spending</h2>
                  <p className="text-xs text-on-surface-variant font-body mt-0.5">Last 7 days expenditure</p>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={weekly} margin={{ top: 8, right: 8, bottom: 4, left: 4 }} barCategoryGap="40%">
                    <defs>
                      <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor={PINK} stopOpacity={1}   />
                        <stop offset="100%" stopColor="#9333ea" stopOpacity={0.8} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="day"  tick={axisStyle} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={fmt} tick={axisStyle} axisLine={false} tickLine={false} width={48} />
                    <Tooltip
                      formatter={v => [fmt(v), 'Spent']}
                      contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontFamily: 'Inter' }}
                      cursor={{ fill: 'rgba(255,45,109,0.06)', radius: 8 }}
                    />
                    <Bar dataKey="spent" fill="url(#barGrad)" radius={[8, 8, 0, 0]} shape={<GlowBar />} />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            </>
          )}
        </motion.div>
      </MainContent>
    </div>
  );
};

export default Insights;
