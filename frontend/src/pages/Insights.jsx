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
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Vibrant neon palette
const PIE_COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#06b6d4'];

const tooltipStyle = {
  borderRadius: 14,
  border: '1px solid rgba(99,102,241,0.3)',
  background: 'rgba(9,9,18,0.95)',
  backdropFilter: 'blur(12px)',
  boxShadow: '0 8px 32px rgba(99,102,241,0.25)',
  fontFamily: 'Inter',
  color: '#f4f4f5',
  padding: '10px 16px',
};

const axisStyle = { fontSize: 11, fill: '#71717a', fontFamily: 'Inter' };

const fmt = n => `$${(n || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

// Custom bar shape with glow
const GlowBar = (props) => {
  const { x, y, width, height, fill } = props;
  if (!height || height <= 0) return null;
  return (
    <g>
      <defs>
        <filter id={`glow-${x}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <rect x={x} y={y} width={width} height={height} rx={6} ry={6} fill={fill} filter={`url(#glow-${x})`} />
    </g>
  );
};

// Custom dot for area chart
const GlowDot = (props) => {
  const { cx, cy, stroke } = props;
  return (
    <g>
      <circle cx={cx} cy={cy} r={5} fill={stroke} opacity={0.3} />
      <circle cx={cx} cy={cy} r={3} fill={stroke} />
    </g>
  );
};

// Custom pie label
const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null;
  const R = innerRadius + (outerRadius - innerRadius) * 0.5;
  const rad = (midAngle * Math.PI) / 180;
  const x = cx + R * Math.cos(-rad);
  const y = cy + R * Math.sin(-rad);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central"
      fontSize={11} fontWeight={700} fontFamily="Inter">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

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
        const sentMap = {}, recvMap = {};
        (m.data.monthly.sent || []).forEach(d => { sentMap[`${d._id.year}-${d._id.month}`] = d.spent; });
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
  const maxDay = weekly.reduce((best, d) => d.spent > best.spent ? d : best, { day: '—', spent: 0 });

  return (
    <div className="page-wrapper">
      <Sidebar />
      <MainContent>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-8">

          {/* Header */}
          <div>
            <p className="text-xs uppercase tracking-widest text-on-surface-variant font-body mb-1">Financial Intelligence</p>
            <h1 className="font-headline font-bold text-3xl text-on-surface">Insights & Analytics</h1>
            <p className="font-body mt-1" style={{ color: '#6366f1' }}>
              Understand your spending patterns and financial health.
            </p>
          </div>

          {loading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3].map(i => <div key={i} className="h-64 skeleton rounded-2xl" />)}
            </div>
          ) : (
            <>
              {/* KPI Strip */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'This Week', value: fmt(totalSpent), sub: 'Total spent', icon: 'trending_down', color: '#ec4899' },
                  { label: 'Busiest Day', value: maxDay.day, sub: fmt(maxDay.spent) + ' spent', icon: 'bolt', color: '#f59e0b' },
                  { label: 'Categories', value: byCategory.length || '—', sub: 'Spending types', icon: 'category', color: '#6366f1' },
                ].map(k => (
                  <motion.div key={k.label}
                    whileHover={{ y: -3 }}
                    className="rounded-2xl p-5 flex items-center gap-4"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${k.color}18` }}>
                      <span className="material-icons text-xl" style={{ color: k.color }}>{k.icon}</span>
                    </div>
                    <div>
                      <p className="font-headline font-bold text-xl text-on-surface">{k.value}</p>
                      <p className="text-xs text-on-surface-variant font-body">{k.sub}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* ── Weekly Spending Bar Chart ── */}
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="rounded-2xl p-6"
                style={{ background: 'linear-gradient(145deg, rgba(236,72,153,0.06) 0%, rgba(9,9,18,0.95) 60%)', border: '1px solid rgba(236,72,153,0.15)' }}
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="font-headline font-bold text-lg text-on-surface">Weekly Spending</h2>
                    <p className="text-xs text-on-surface-variant font-body mt-0.5">Last 7 days expenditure</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
                    style={{ background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.2)' }}>
                    <span className="material-icons text-sm" style={{ color: '#ec4899' }}>bar_chart</span>
                    <span className="text-xs font-body font-semibold" style={{ color: '#ec4899' }}>Daily View</span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={weekly} margin={{ top: 8, right: 8, bottom: 4, left: 4 }} barCategoryGap="35%">
                    <defs>
                      <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ec4899" stopOpacity={1} />
                        <stop offset="100%" stopColor="#9333ea" stopOpacity={0.8} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="day" tick={axisStyle} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={fmt} tick={axisStyle} axisLine={false} tickLine={false} width={48} />
                    <Tooltip
                      formatter={v => [fmt(v), 'Spent']}
                      contentStyle={tooltipStyle}
                      cursor={{ fill: 'rgba(236,72,153,0.06)', radius: 8 }}
                    />
                    <Bar dataKey="spent" fill="url(#barGrad)" radius={[8, 8, 0, 0]} name="Spent" shape={<GlowBar />} />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>

              {/* ── Monthly Cash Flow Area Chart ── */}
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="rounded-2xl p-6"
                style={{ background: 'linear-gradient(145deg, rgba(99,102,241,0.07) 0%, rgba(9,9,18,0.95) 60%)', border: '1px solid rgba(99,102,241,0.15)' }}
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="font-headline font-bold text-lg text-on-surface">Monthly Cash Flow</h2>
                    <p className="text-xs text-on-surface-variant font-body mt-0.5">Sent vs received over the last 6 months</p>
                  </div>
                  <div className="flex gap-4">
                    {[{ label: 'Spent', color: '#ec4899' }, { label: 'Received', color: '#6366f1' }].map(l => (
                      <div key={l.label} className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
                        <span className="text-xs font-body text-on-surface-variant">{l.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={monthly} margin={{ top: 8, right: 8, bottom: 4, left: 4 }}>
                    <defs>
                      <linearGradient id="areaSpent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ec4899" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="#ec4899" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="areaReceived" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={fmt} tick={axisStyle} axisLine={false} tickLine={false} width={48} />
                    <Tooltip
                      formatter={(v, name) => [fmt(v), name]}
                      contentStyle={tooltipStyle}
                      cursor={{ stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1, strokeDasharray: '4' }}
                    />
                    <Area type="monotoneX" dataKey="spent" name="Spent" stroke="#ec4899"
                      fill="url(#areaSpent)" strokeWidth={2.5} dot={<GlowDot />} activeDot={{ r: 5, fill: '#ec4899', strokeWidth: 0 }} />
                    <Area type="monotoneX" dataKey="received" name="Received" stroke="#6366f1"
                      fill="url(#areaReceived)" strokeWidth={2.5} dot={<GlowDot />} activeDot={{ r: 5, fill: '#6366f1', strokeWidth: 0 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>

              {/* ── Spending by Category Donut ── */}
              {byCategory.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  className="rounded-2xl p-6"
                  style={{ background: 'linear-gradient(145deg, rgba(16,185,129,0.06) 0%, rgba(9,9,18,0.95) 60%)', border: '1px solid rgba(16,185,129,0.15)' }}
                >
                  <div className="mb-6">
                    <h2 className="font-headline font-bold text-lg text-on-surface">Spending by Category</h2>
                    <p className="text-xs text-on-surface-variant font-body mt-0.5">Distribution by transaction type</p>
                  </div>
                  <div className="flex items-center gap-10">
                    {/* Donut */}
                    <div className="relative flex-shrink-0">
                      <ResponsiveContainer width={220} height={220}>
                        <PieChart>
                          <defs>
                            {PIE_COLORS.map((c, i) => (
                              <radialGradient key={i} id={`pieGrad${i}`} cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stopColor={c} stopOpacity={1} />
                                <stop offset="100%" stopColor={c} stopOpacity={0.7} />
                              </radialGradient>
                            ))}
                          </defs>
                          <Pie
                            data={byCategory}
                            cx="50%" cy="50%"
                            innerRadius={68} outerRadius={95}
                            dataKey="value"
                            paddingAngle={3}
                            labelLine={false}
                            label={renderPieLabel}
                            stroke="none"
                          >
                            {byCategory.map((_, i) => (
                              <Cell key={i} fill={`url(#pieGrad${i})`} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={v => [fmt(v), 'Amount']}
                            contentStyle={tooltipStyle}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      {/* Center label */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <p className="text-xs text-on-surface-variant font-body">Total</p>
                        <p className="font-headline font-bold text-lg text-on-surface">
                          {fmt(byCategory.reduce((s, c) => s + c.value, 0))}
                        </p>
                      </div>
                    </div>

                    {/* Legend */}
                    <div className="flex-1 space-y-3">
                      {byCategory.map((c, i) => {
                        const total = byCategory.reduce((s, d) => s + d.value, 0);
                        const pct = total > 0 ? ((c.value / total) * 100).toFixed(1) : 0;
                        return (
                          <div key={c.name}>
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full flex-shrink-0"
                                  style={{ background: PIE_COLORS[i % PIE_COLORS.length], boxShadow: `0 0 6px ${PIE_COLORS[i % PIE_COLORS.length]}` }} />
                                <span className="text-sm font-body text-on-surface capitalize">{c.name}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-on-surface-variant font-body">{pct}%</span>
                                <span className="text-sm font-headline font-bold text-on-surface">{fmt(c.value)}</span>
                              </div>
                            </div>
                            {/* Progress bar */}
                            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.8, delay: 0.3 + i * 0.1, ease: 'easeOut' }}
                                className="h-full rounded-full"
                                style={{ background: `linear-gradient(90deg, ${PIE_COLORS[i % PIE_COLORS.length]}, ${PIE_COLORS[(i + 1) % PIE_COLORS.length]})` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </motion.div>
      </MainContent>
    </div>
  );
};

export default Insights;
