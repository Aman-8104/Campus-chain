import React, { createContext, useContext, useState, useEffect } from 'react';

const SidebarContext = createContext(null);

export const SidebarProvider = ({ children }) => {
  // On mobile start closed, on desktop start open
  const [isOpen, setIsOpen] = useState(() => window.innerWidth >= 1024);
  const toggle = () => setIsOpen(o => !o);
  const close  = () => setIsOpen(false);
  const open   = () => setIsOpen(true);

  // When screen resizes to desktop, keep sidebar open; on mobile, close it
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsOpen(true);
      else setIsOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <SidebarContext.Provider value={{ isOpen, toggle, close, open }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebar must be used within SidebarProvider');
  return ctx;
};
