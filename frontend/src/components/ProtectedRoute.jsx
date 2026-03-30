import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-gradient animate-pulse" />
          <span className="font-headline text-on-surface-variant">Loading...</span>
        </div>
      </div>
    );
  }
  return token ? children : <Navigate to="/" replace />;
};

export const AdminRoute = ({ children }) => {
  const { token, isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!token) return <Navigate to="/" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
};

export default ProtectedRoute;
