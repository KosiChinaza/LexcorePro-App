import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Briefcase, Users, Clock, FileText, FolderOpen, Calendar, BarChart3, Settings, Bell, LogOut, Scale, UserCog, ClipboardList, BookOpen, ChevronLeft, ChevronRight, UserCheck, } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui';
import { usersService } from '../../services/api';
const navItems = [
    { to: '/dashboard', icon: _jsx(LayoutDashboard, { size: 18 }), label: 'Dashboard' },
    { to: '/matters', icon: _jsx(Briefcase, { size: 18 }), label: 'Matters' },
    { to: '/clients', icon: _jsx(Users, { size: 18 }), label: 'Clients' },
    { to: '/time', icon: _jsx(Clock, { size: 18 }), label: 'Time Recording' },
    { to: '/billing', icon: _jsx(FileText, { size: 18 }), label: 'Billing' },
    { to: '/documents', icon: _jsx(FolderOpen, { size: 18 }), label: 'Documents' },
    { to: '/calendar', icon: _jsx(Calendar, { size: 18 }), label: 'Calendar' },
    { to: '/alerts', icon: _jsx(Bell, { size: 18 }), label: 'Alerts' },
    { to: '/leave', icon: _jsx(UserCheck, { size: 18 }), label: 'Leave' },
    { to: '/reports', icon: _jsx(BarChart3, { size: 18 }), label: 'Reports' },
    { to: '/research', icon: _jsx(BookOpen, { size: 18 }), label: 'Research' },
];
const Sidebar = ({ collapsed, onToggle }) => {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [pendingCount, setPendingCount] = useState(0);
    // ── Poll pending requests every 60 s (admin only) ────────────────────────
    useEffect(() => {
        if (!isAdmin)
            return;
        const fetchPending = async () => {
            try {
                const res = await usersService.pendingRequests();
                setPendingCount(res.data.length ?? 0);
            }
            catch {
                // silently ignore — sidebar badge is non-critical
            }
        };
        fetchPending();
        const interval = setInterval(fetchPending, 60000);
        return () => clearInterval(interval);
    }, [isAdmin]);
    const adminItems = [
        { to: '/staff', icon: _jsx(UserCog, { size: 18 }), label: 'Staff & HR', adminOnly: true },
        { to: '/users', icon: _jsx(ClipboardList, { size: 18 }), label: 'User Mgmt', adminOnly: true, badge: pendingCount },
        { to: '/audit', icon: _jsx(Scale, { size: 18 }), label: 'Audit Log', adminOnly: true },
        { to: '/settings', icon: _jsx(Settings, { size: 18 }), label: 'Settings', adminOnly: true },
    ];
    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };
    return (_jsxs("aside", { className: `flex flex-col bg-sidebar border-r border-slate-800 transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'} min-h-screen flex-shrink-0`, children: [_jsxs("div", { className: "flex items-center gap-3 px-4 py-5 border-b border-slate-800", children: [_jsx("div", { className: "w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center flex-shrink-0", children: _jsx(Scale, { size: 16, className: "text-slate-900" }) }), !collapsed && (_jsxs("div", { className: "min-w-0", children: [_jsx("div", { className: "font-bold text-slate-100 text-sm leading-tight", children: "LexCore Pro" }), _jsx("div", { className: "text-xs text-slate-500 truncate", children: "Peters & Associates" })] })), _jsx("button", { onClick: onToggle, className: "ml-auto text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0", children: collapsed ? _jsx(ChevronRight, { size: 16 }) : _jsx(ChevronLeft, { size: 16 }) })] }), _jsxs("nav", { className: "flex-1 overflow-y-auto py-3 px-2 space-y-0.5", children: [navItems.map(item => (_jsxs(NavLink, { to: item.to, className: ({ isActive }) => `sidebar-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`, title: collapsed ? item.label : undefined, children: [_jsx("span", { className: "flex-shrink-0", children: item.icon }), !collapsed && _jsx("span", { className: "truncate", children: item.label })] }, item.to))), isAdmin && (_jsxs(_Fragment, { children: [_jsx("div", { className: `pt-3 pb-1 ${collapsed ? 'hidden' : ''}`, children: _jsx("p", { className: "text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-3", children: "Admin" }) }), adminItems.map(item => (_jsxs(NavLink, { to: item.to, className: ({ isActive }) => `sidebar-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`, title: collapsed ? item.label : undefined, children: [_jsxs("span", { className: "relative flex-shrink-0", children: [item.icon, collapsed && item.badge && item.badge > 0 ? (_jsx("span", { className: "absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" })) : null] }), !collapsed && (_jsxs(_Fragment, { children: [_jsx("span", { className: "truncate flex-1", children: item.label }), item.badge && item.badge > 0 ? (_jsx("span", { className: "ml-auto flex-shrink-0 bg-red-500 text-white text-[10px] font-bold\n                                       leading-none px-1.5 py-0.5 rounded-full min-w-[18px] text-center", children: item.badge > 99 ? '99+' : item.badge })) : null] }))] }, item.to)))] }))] }), _jsxs("div", { className: `border-t border-slate-800 p-3 ${collapsed ? 'flex flex-col items-center gap-2' : ''}`, children: [!collapsed && user && (_jsxs("div", { className: "flex items-center gap-3 mb-2 px-1", children: [_jsx(Avatar, { name: user.name, size: "sm" }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsx("p", { className: "text-sm font-medium text-slate-200 truncate", children: user.name }), _jsx("p", { className: "text-xs text-slate-500 truncate", children: user.position || user.role })] })] })), collapsed && user && _jsx(Avatar, { name: user.name, size: "sm" }), _jsxs("button", { onClick: handleLogout, className: `sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-900/20 ${collapsed ? 'justify-center px-2' : ''}`, title: collapsed ? 'Logout' : undefined, children: [_jsx(LogOut, { size: 16 }), !collapsed && _jsx("span", { children: "Logout" })] })] })] }));
};
export default Sidebar;
