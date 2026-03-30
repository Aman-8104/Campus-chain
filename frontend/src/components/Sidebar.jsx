import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { icon: 'dashboard', label: 'Dashboard', to: '/dashboard' },
  { icon: 'account_balance_wallet', label: 'Wallet', to: '/wallet' },
  { icon: 'receipt_long', label: 'Transactions', to: '/transactions' },
  { icon: 'send', label: 'Send Money', to: '/send' },
  { icon: 'qr_code_scanner', label: 'Receive', to: '/receive' },
  { icon: 'analytics', label: 'Insights', to: '/insights' },
  { icon: 'autorenew', label: 'Recurring', to: '/recurring' },
  { icon: 'notifications', label: 'Notifications', to: '/notifications' },
  { icon: 'admin_panel_settings', label: 'Admin Panel', to: '/admin', adminOnly: true },
  { icon: 'settings', label: 'Settings', to: '/settings' },
];

const Sidebar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const visibleItems = navItems.filter(item => !item.adminOnly || (item.adminOnly && isAdmin));

  return (
    <motion.aside
      initial={{ x: -280, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="fixed left-0 top-0 h-full w-64 bg-surface-lowest shadow-ambient flex flex-col z-50"
    >
      {/* Logo */}
      <div className="p-6 pb-4 border-b border-surface-container">
        <div
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary-gradient flex items-center justify-center shadow-ambient">
            <span className="material-icons text-white text-3xl">link</span>
          </div>
          <div>
            <h1 className="font-headline font-bold text-navy text-2xl leading-none">CampusChain</h1>
            <p className="text-sm text-on-surface-variant mt-1">Institutional Grade</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-low">
          <div className="w-12 h-12 rounded-full bg-primary-gradient flex items-center justify-center flex-shrink-0">
            <span className="text-white text-lg font-bold font-headline">
              {user?.name?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="min-w-0">
            <p className="font-headline font-semibold text-on-surface text-base truncate">{user?.name}</p>
            <p className="text-sm text-on-surface-variant capitalize">{user?.role}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 overflow-y-auto space-y-2">
        {visibleItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-4 rounded-xl font-body font-medium text-base transition-all duration-200 ${isActive
                ? 'bg-primary/10 text-primary'
                : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`material-icons text-2xl ${isActive ? 'text-primary' : ''}`}>{item.icon}</span>
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-surface-container">
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 w-full px-4 py-4 rounded-xl text-error font-body font-medium text-base
                     hover:bg-error/10 transition-all duration-200"
        >
          <span className="material-icons text-2xl">logout</span>
          Logout
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
