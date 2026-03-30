import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/notifications').then(({ data }) => { setNotifications(data.notifications); setUnreadCount(data.unreadCount); }).finally(() => setLoading(false));
  }, []);

  const markRead = async (id) => {
    await api.patch(`/notifications/${id}/read`);
    setNotifications(ns => ns.map(n => n._id === id ? { ...n, read: true } : n));
    setUnreadCount(c => Math.max(0, c - 1));
  };

  const markAllRead = async () => {
    await api.patch('/notifications/read-all');
    setNotifications(ns => ns.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const iconMap = { transaction: 'payments', system: 'info', alert: 'warning', promo: 'local_offer' };
  const colorMap = { transaction: 'text-tertiary bg-tertiary/10', system: 'text-secondary bg-secondary/10', alert: 'text-error bg-error/10', promo: 'text-primary bg-primary/10' };
  const fmtDate = d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="page-wrapper">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 overflow-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-headline font-bold text-3xl text-on-surface">Notifications</h1>
              <p className="text-on-surface-variant font-body mt-1">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="btn-tertiary text-sm" id="mark-all-read">Mark all read</button>
            )}
          </div>

          {loading ? (
            <div className="space-y-3 animate-pulse">{[1,2,3,4].map(i => <div key={i} className="h-20 skeleton rounded-xl" />)}</div>
          ) : notifications.length === 0 ? (
            <div className="card p-12 text-center text-on-surface-variant font-body">
              <span className="material-icons text-4xl mb-3 block">notifications_none</span>
              No notifications yet
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((n, i) => (
                <motion.div key={n._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  onClick={() => !n.read && markRead(n._id)}
                  className={`card p-4 flex items-start gap-4 cursor-pointer hover:shadow-float transition-all duration-200 ${!n.read ? 'border-l-2 border-primary' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorMap[n.type] || colorMap.system}`}>
                    <span className="material-icons text-xl">{iconMap[n.type] || 'info'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`font-body font-medium text-sm ${!n.read ? 'text-on-surface' : 'text-on-surface-variant'}`}>{n.title}</p>
                      {!n.read && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />}
                    </div>
                    <p className="text-xs text-on-surface-variant font-body mt-0.5">{n.body}</p>
                    <p className="text-xs text-outline mt-1 font-body">{fmtDate(n.createdAt)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default Notifications;
