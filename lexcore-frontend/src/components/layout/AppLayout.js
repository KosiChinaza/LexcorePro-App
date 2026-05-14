import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
const AppLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    return (_jsxs("div", { className: "flex h-screen overflow-hidden bg-slate-900", children: [_jsx(Sidebar, { collapsed: collapsed, onToggle: () => setCollapsed(p => !p) }), _jsx("main", { className: "flex-1 overflow-y-auto", children: _jsx("div", { className: "p-6 min-h-full", children: _jsx(Outlet, {}) }) })] }));
};
export default AppLayout;
