import React from 'react';
import { useSidebar } from '../context/SidebarContext';
import { useAuth } from '../context/AuthContext';

const MainContent = ({ children, className = '' }) => {
  const { isOpen } = useSidebar();

  return (
    <main
      className={`flex-1 ${isOpen ? 'ml-64' : 'ml-16'} p-8 overflow-auto transition-all duration-300 ${className}`}
    >
      {children}
    </main>
  );
};

export default MainContent;
