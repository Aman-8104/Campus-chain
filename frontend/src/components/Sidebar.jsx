import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';

const adminNavItems = [
  { icon: 'admin_panel_settings', label: 'Institutional Overview', to: '/admin' },
  { icon: 'receipt_long', label: 'Global Ledger', to: '/transactions' },
  { icon: 'payments', label: 'Fund Distribution', to: '/admin/fund' },
  { icon: 'notifications', label: 'Notifications', to: '/notifications' },
  { icon: 'settings', label: 'System Settings', to: '/settings' },
];

const userNavItems = [
  { icon: 'dashboard', label: 'Dashboard', to: '/dashboard' },
  { icon: 'account_balance_wallet', label: 'Wallet', to: '/wallet' },
  { icon: 'receipt_long', label: 'Transactions', to: '/transactions' },
  { icon: 'send', label: 'Send Money', to: '/send' },
  { icon: 'qr_code_scanner', label: 'Receive', to: '/receive' },
  { icon: 'analytics', label: 'Insights', to: '/insights' },
  { icon: 'autorenew', label: 'Recurring', to: '/recurring' },
  { icon: 'notifications', label: 'Notifications', to: '/notifications' },
  { icon: 'settings', label: 'Settings', to: '/settings' },
];

const Sidebar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { isOpen, toggle } = useSidebar();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = isAdmin ? adminNavItems : userNavItems;

  const avatarBase = `flex items-center justify-center rounded-full font-bold font-headline flex-shrink-0 cursor-pointer
    transition-all duration-200 hover:scale-105 active:scale-95 select-none
    ${isAdmin ? 'bg-amber-500/20 text-amber-400' : 'bg-primary-gradient text-white'}`;

  return (
    <motion.aside
      animate={{ width: isOpen ? 256 : 64 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={`fixed left-0 top-0 h-full flex flex-col z-50 shadow-ambient overflow-hidden
        ${isAdmin ? 'bg-[#0a0a1a] border-r border-amber-500/20' : 'bg-surface-lowest border-r border-surface-container'}`}
    >
      {/* Logo row */}
      <div className={`flex items-center gap-3 p-4 border-b flex-shrink-0
        ${isAdmin ? 'border-amber-500/20' : 'border-surface-container'}`}>
        <div
          onClick={() => navigate(isAdmin ? '/admin' : '/dashboard')}
          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity
            ${isAdmin ? 'bg-amber-500/20' : 'bg-primary-gradient'}`}
        >
          <span className={`material-icons text-lg ${isAdmin ? 'text-amber-400' : 'text-white'}`}>link</span>
        </div>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <p className={`font-headline font-bold text-base leading-none whitespace-nowrap
                ${isAdmin ? 'text-amber-400' : 'text-navy'}`}>CampusChain</p>
              <p className={`text-xs mt-0.5 whitespace-nowrap
                ${isAdmin ? 'text-amber-400/50' : 'text-on-surface-variant'}`}>
                {isAdmin ? 'Admin Console' : 'Institutional Grade'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Admin Mode Badge */}
      {isAdmin && isOpen && (
        <div className="mx-3 mt-3 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30
          flex items-center gap-2 flex-shrink-0">
          <span className="material-icons text-amber-400 text-sm">shield</span>
          <span className="text-xs font-headline font-bold text-amber-400 tracking-widest uppercase">Admin Mode</span>
          <div className="ml-auto w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        </div>
      )}

      {/* ── User Avatar — clicking this toggles the sidebar ── */}
      <div className={`px-3 py-3 flex-shrink-0 ${isOpen ? '' : 'flex justify-center'}`}>
        {isOpen ? (
          /* Expanded: full info card, avatar click collapses */
          <div className={`flex items-center gap-3 p-3 rounded-xl
            ${isAdmin ? 'bg-amber-500/5 border border-amber-500/10' : 'bg-surface-low'}`}>
            <div
              onClick={toggle}
              title="Click to collapse sidebar"
              className={`w-10 h-10 ${avatarBase} ring-2 ring-offset-2
                ${isAdmin ? 'ring-amber-400/30 ring-offset-[#0a0a1a]' : 'ring-primary/20 ring-offset-surface-lowest'}`}
            >
              <span className="text-sm">{user?.name?.charAt(0) || 'U'}</span>
            </div>
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                exit={{ opacity: 0 }} className="min-w-0"
              >
                <p className="font-headline font-semibold text-on-surface text-sm truncate">{user?.name}</p>
                <p className={`text-xs capitalize ${isAdmin ? 'text-amber-400/70' : 'text-on-surface-variant'}`}>
                  {user?.role}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        ) : (
          /* Collapsed: just the avatar, clicking it expands */
          <div
            onClick={toggle}
            title={`${user?.name} — click to expand`}
            className={`w-10 h-10 ${avatarBase} ring-2 ring-offset-2
              ${isAdmin ? 'ring-amber-400/40 ring-offset-[#0a0a1a]' : 'ring-primary/30 ring-offset-surface-lowest'}`}
          >
            <span className="text-sm">{user?.name?.charAt(0) || 'U'}</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-2 overflow-y-auto space-y-1">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/admin'}
            title={!isOpen ? item.label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-xl font-body font-medium text-sm transition-all duration-200
              ${!isOpen ? 'justify-center' : ''}
              ${isActive
                ? isAdmin
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'bg-primary/10 text-primary'
                : isAdmin
                  ? 'text-amber-400/60 hover:bg-amber-500/5 hover:text-amber-400'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`material-icons text-xl flex-shrink-0
                  ${isActive ? (isAdmin ? 'text-amber-400' : 'text-primary') : ''}`}>
                  {item.icon}
                </span>
                <AnimatePresence>
                  {isOpen && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className={`p-2 border-t flex-shrink-0
        ${isAdmin ? 'border-amber-500/20' : 'border-surface-container'}`}>
        <button
          onClick={handleLogout}
          title={!isOpen ? 'Logout' : undefined}
          className={`flex items-center gap-3 w-full px-3 py-3 rounded-xl font-body font-medium text-sm
            hover:bg-error/10 transition-all duration-200 text-error
            ${!isOpen ? 'justify-center' : ''}`}
        >
          <span className="material-icons text-xl flex-shrink-0">logout</span>
          <AnimatePresence>
            {isOpen && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden whitespace-nowrap"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
