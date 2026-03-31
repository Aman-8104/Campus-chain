import React from 'react';
import { useSidebar } from '../context/SidebarContext';
import { useAuth } from '../context/AuthContext';

const MainContent = ({ children, className = '' }) => {
  const { isOpen, toggle } = useSidebar();
  const { user, isAdmin } = useAuth();

  return (
    <>
      {/* ── Mobile top bar (hidden on desktop) ── */}
      <header className={`lg:hidden fixed top-0 left-0 right-0 z-30 flex items-center gap-3 px-4 h-14
        ${isAdmin ? 'bg-[#0a0a1a] border-b border-amber-500/20' : 'bg-surface-lowest border-b border-surface-container'}`}>
        <button
          onClick={toggle}
          id="mobile-menu-btn"
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all
            ${isAdmin ? 'text-amber-400 hover:bg-amber-500/10' : 'text-on-surface-variant hover:bg-surface-container'}`}
        >
          <span className="material-icons">menu</span>
        </button>
        <div className="flex items-center gap-2 flex-1">
          <span className={`font-headline font-bold text-base ${isAdmin ? 'text-amber-400' : 'text-navy'}`}>
            CampusChain
          </span>
          {isAdmin && (
            <span className="text-xs px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20">
              ADMIN
            </span>
          )}
        </div>
        {/* Avatar in mobile header */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0
          ${isAdmin ? 'bg-amber-500/20 text-amber-400' : 'bg-primary-gradient text-white'}`}>
          {user?.name?.charAt(0) || 'U'}
        </div>
      </header>

      {/* ── Main content area ── */}
      <main
        className={`
          flex-1 overflow-auto transition-all duration-300
          pt-14 lg:pt-0
          px-4 py-6 lg:p-8
          ${isOpen ? 'lg:ml-64' : 'lg:ml-16'}
          ${className}
        `}
      >
        {children}
      </main>
    </>
  );
};

export default MainContent;
