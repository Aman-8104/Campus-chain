import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { SidebarProvider } from './context/SidebarContext';
import ProtectedRoute, { AdminRoute, UserOnlyRoute } from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Wallet from './pages/Wallet';
import SendMoney from './pages/SendMoney';
import ReceiveMoney from './pages/ReceiveMoney';
import Transactions from './pages/Transactions';
import TransactionDetail from './pages/TransactionDetail';
import Insights from './pages/Insights';
import Recurring from './pages/Recurring';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import Admin from './pages/Admin';
import AdminFund from './pages/AdminFund';
import Signup from './pages/Signup';
import VendorSignup from './pages/VendorSignup';

const App = () => (
  <AuthProvider>
    <SidebarProvider>
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/vendor-signup" element={<VendorSignup />} />

          {/* ── Admin-only ───────────────────────────── */}
          <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
          <Route path="/admin/fund" element={<AdminRoute><AdminFund /></AdminRoute>} />

          {/* ── Shared pages (admin + users) ────────── */}
          <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
          <Route path="/transactions/:id" element={<ProtectedRoute><TransactionDetail /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

          {/* ── User-only (admin is blocked) ────────── */}
          <Route path="/dashboard" element={<UserOnlyRoute><Dashboard /></UserOnlyRoute>} />
          <Route path="/wallet" element={<UserOnlyRoute><Wallet /></UserOnlyRoute>} />
          <Route path="/send" element={<UserOnlyRoute><SendMoney /></UserOnlyRoute>} />
          <Route path="/receive" element={<UserOnlyRoute><ReceiveMoney /></UserOnlyRoute>} />
          <Route path="/insights" element={<UserOnlyRoute><Insights /></UserOnlyRoute>} />
          <Route path="/recurring" element={<UserOnlyRoute><Recurring /></UserOnlyRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
    </SidebarProvider>
  </AuthProvider>
);

export default App;
