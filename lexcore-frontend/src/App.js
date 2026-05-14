import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
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
const ProtectedRoute = ({ children, adminOnly }) => {
    const { user, isLoading } = useAuth();
    if (isLoading)
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-slate-900", children: _jsx(Spinner, { size: 32, className: "text-brand-500" }) }));
    if (!user)
        return _jsx(Navigate, { to: "/login", replace: true });
    if (adminOnly && user.role !== 'admin')
        return _jsx(Navigate, { to: "/dashboard", replace: true });
    return _jsx(_Fragment, { children: children });
};
const AppRoutes = () => {
    const { user, isLoading } = useAuth();
    if (isLoading)
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-slate-900", children: _jsx(Spinner, { size: 32, className: "text-brand-500" }) }));
    return (_jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: user ? _jsx(Navigate, { to: "/dashboard", replace: true }) : _jsx(LoginPage, {}) }), _jsx(Route, { path: "/signup", element: user ? _jsx(Navigate, { to: "/dashboard", replace: true }) : _jsx(SignupPage, {}) }), _jsxs(Route, { path: "/", element: _jsx(ProtectedRoute, { children: _jsx(AppLayout, {}) }), children: [_jsx(Route, { index: true, element: _jsx(Navigate, { to: "/dashboard", replace: true }) }), _jsx(Route, { path: "dashboard", element: _jsx(DashboardPage, {}) }), _jsx(Route, { path: "matters", element: _jsx(MattersPage, {}) }), _jsx(Route, { path: "matters/:id", element: _jsx(MatterDetailPage, {}) }), _jsx(Route, { path: "clients", element: _jsx(ClientsPage, {}) }), _jsx(Route, { path: "time", element: _jsx(TimePage, {}) }), _jsx(Route, { path: "billing", element: _jsx(BillingPage, {}) }), _jsx(Route, { path: "documents", element: _jsx(DocumentsPage, {}) }), _jsx(Route, { path: "calendar", element: _jsx(CalendarPage, {}) }), _jsx(Route, { path: "alerts", element: _jsx(AlertsPage, {}) }), _jsx(Route, { path: "leave", element: _jsx(LeavePage, {}) }), _jsx(Route, { path: "reports", element: _jsx(ReportsPage, {}) }), _jsx(Route, { path: "research", element: _jsx(ResearchPage, {}) }), _jsx(Route, { path: "staff", element: _jsx(ProtectedRoute, { adminOnly: true, children: _jsx(StaffPage, {}) }) }), _jsx(Route, { path: "users", element: _jsx(ProtectedRoute, { adminOnly: true, children: _jsx(UsersPage, {}) }) }), _jsx(Route, { path: "audit", element: _jsx(ProtectedRoute, { adminOnly: true, children: _jsx(AuditPage, {}) }) }), _jsx(Route, { path: "settings", element: _jsx(ProtectedRoute, { adminOnly: true, children: _jsx(SettingsPage, {}) }) })] }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/dashboard", replace: true }) })] }));
};
const App = () => (_jsx(BrowserRouter, { children: _jsxs(AuthProvider, { children: [_jsx(AppRoutes, {}), _jsx(ToastContainer, {})] }) }));
export default App;
