import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer } from './components/ui';
import AppLayout from './components/layout/AppLayout';
import { Spinner } from './components/ui';

// Pages
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import MattersPage from './pages/MattersPage';
import MatterDetailPage from './pages/MatterDetailPage';
import ClientsPage from './pages/ClientsPage';
import TimePage from './pages/TimePage';
import BillingPage from './pages/BillingPage';
import DocumentsPage from './pages/DocumentsPage';
import CalendarPage from './pages/CalendarPage';
import AlertsPage from './pages/AlertsPage';
import LeavePage from './pages/LeavePage';
import ReportsPage from './pages/ReportsPage';
import ResearchPage from './pages/ResearchPage';
import StaffPage from './pages/StaffPage';
import UsersPage from './pages/UsersPage';
import AuditPage from './pages/AuditPage';
import SettingsPage from './pages/SettingsPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({ children, adminOnly }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <Spinner size={32} className="text-brand-500" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <Spinner size={32} className="text-brand-500" />
    </div>
  );
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <SignupPage />} />
      <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="matters" element={<MattersPage />} />
        <Route path="matters/:id" element={<MatterDetailPage />} />
        <Route path="clients" element={<ClientsPage />} />
        <Route path="time" element={<TimePage />} />
        <Route path="billing" element={<BillingPage />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="alerts" element={<AlertsPage />} />
        <Route path="leave" element={<LeavePage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="research" element={<ResearchPage />} />
        <Route path="staff" element={<ProtectedRoute adminOnly><StaffPage /></ProtectedRoute>} />
        <Route path="users" element={<ProtectedRoute adminOnly><UsersPage /></ProtectedRoute>} />
        <Route path="audit" element={<ProtectedRoute adminOnly><AuditPage /></ProtectedRoute>} />
        <Route path="settings" element={<ProtectedRoute adminOnly><SettingsPage /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

const App: React.FC = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppRoutes />
      <ToastContainer />
    </AuthProvider>
  </BrowserRouter>
);

export default App;
