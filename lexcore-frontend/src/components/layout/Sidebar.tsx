import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Briefcase, Users, Clock, FileText, FolderOpen,
  Calendar, BarChart3, Settings, Bell, LogOut, Scale, UserCog,
  ClipboardList, BookOpen, ChevronLeft, ChevronRight, UserCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui';
import { usersService } from '../../services/api';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { to: '/dashboard',  icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { to: '/matters',    icon: <Briefcase size={18} />,       label: 'Matters' },
  { to: '/clients',    icon: <Users size={18} />,           label: 'Clients' },
  { to: '/time',       icon: <Clock size={18} />,           label: 'Time Recording' },
  { to: '/billing',    icon: <FileText size={18} />,        label: 'Billing' },
  { to: '/documents',  icon: <FolderOpen size={18} />,      label: 'Documents' },
  { to: '/calendar',   icon: <Calendar size={18} />,        label: 'Calendar' },
  { to: '/alerts',     icon: <Bell size={18} />,            label: 'Alerts' },
  { to: '/leave',      icon: <UserCheck size={18} />,       label: 'Leave' },
  { to: '/reports',    icon: <BarChart3 size={18} />,       label: 'Reports' },
  { to: '/research',   icon: <BookOpen size={18} />,        label: 'Research' },
];

const Sidebar: React.FC<{ collapsed: boolean; onToggle: () => void }> = ({ collapsed, onToggle }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState(0);

  // ── Poll pending requests every 60 s (admin only) ────────────────────────
  useEffect(() => {
    if (!isAdmin) return;

    const fetchPending = async () => {
      try {
        const res = await usersService.pendingRequests();
        setPendingCount(res.data.length ?? 0);
      } catch {
        // silently ignore — sidebar badge is non-critical
      }
    };

    fetchPending();
    const interval = setInterval(fetchPending, 60_000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  const adminItems: NavItem[] = [
    { to: '/staff',    icon: <UserCog size={18} />,      label: 'Staff & HR',  adminOnly: true },
    { to: '/users',    icon: <ClipboardList size={18} />, label: 'User Mgmt',  adminOnly: true, badge: pendingCount },
    { to: '/audit',    icon: <Scale size={18} />,         label: 'Audit Log',  adminOnly: true },
    { to: '/settings', icon: <Settings size={18} />,      label: 'Settings',   adminOnly: true },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className={`flex flex-col bg-sidebar border-r border-slate-800 transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'} min-h-screen flex-shrink-0`}>

      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-800">
        <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <Scale size={16} className="text-slate-900" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="font-bold text-slate-100 text-sm leading-tight">LexCore Pro</div>
            <div className="text-xs text-slate-500 truncate">Peters & Associates</div>
          </div>
        )}
        <button
          onClick={onToggle}
          className="ml-auto text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`
            }
            title={collapsed ? item.label : undefined}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <div className={`pt-3 pb-1 ${collapsed ? 'hidden' : ''}`}>
              <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-3">Admin</p>
            </div>

            {adminItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`
                }
                title={collapsed ? item.label : undefined}
              >
                {/* Icon + optional dot badge when collapsed */}
                <span className="relative flex-shrink-0">
                  {item.icon}
                  {collapsed && item.badge && item.badge > 0 ? (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                  ) : null}
                </span>

                {/* Label + pill badge when expanded */}
                {!collapsed && (
                  <>
                    <span className="truncate flex-1">{item.label}</span>
                    {item.badge && item.badge > 0 ? (
                      <span className="ml-auto flex-shrink-0 bg-red-500 text-white text-[10px] font-bold
                                       leading-none px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    ) : null}
                  </>
                )}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* User */}
      <div className={`border-t border-slate-800 p-3 ${collapsed ? 'flex flex-col items-center gap-2' : ''}`}>
        {!collapsed && user && (
          <div className="flex items-center gap-3 mb-2 px-1">
            <Avatar name={user.name} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-200 truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">{user.position || user.role}</p>
            </div>
          </div>
        )}
        {collapsed && user && <Avatar name={user.name} size="sm" />}
        <button
          onClick={handleLogout}
          className={`sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-900/20 ${collapsed ? 'justify-center px-2' : ''}`}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut size={16} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;