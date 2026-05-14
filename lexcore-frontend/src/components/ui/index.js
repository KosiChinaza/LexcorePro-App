import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { getInitials, getAvatarColor } from '../../utils/helpers';
// ─── Badge ────────────────────────────────────────────────────────────────
export const Badge = ({ className = 'badge-gray', children }) => (_jsx("span", { className: className, children: children }));
// ─── Status Badge ─────────────────────────────────────────────────────────
export const StatusBadge = ({ status, colorMap, labelMap, }) => (_jsx("span", { className: colorMap[status] || 'badge-gray', children: labelMap?.[status] || status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ') }));
// ─── Avatar ───────────────────────────────────────────────────────────────
export const Avatar = ({ name, size = 'md', className = '', }) => {
    const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base' };
    return (_jsx("div", { className: `${sizes[size]} ${getAvatarColor(name)} rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0 ${className}`, children: getInitials(name) }));
};
// ─── Spinner ──────────────────────────────────────────────────────────────
export const Spinner = ({ size = 20, className = '' }) => (_jsx(Loader2, { size: size, className: `animate-spin ${className}` }));
export const PageLoader = () => (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsxs("div", { className: "text-center", children: [_jsx(Spinner, { size: 32, className: "text-brand-500 mx-auto mb-3" }), _jsx("p", { className: "text-slate-400 text-sm", children: "Loading..." })] }) }));
// ─── Empty State ──────────────────────────────────────────────────────────
export const EmptyState = ({ icon, title, description, action }) => (_jsxs("div", { className: "flex flex-col items-center justify-center py-16 px-4 text-center", children: [icon && _jsx("div", { className: "text-slate-600 mb-4", children: icon }), _jsx("h3", { className: "text-slate-300 font-medium mb-1", children: title }), description && _jsx("p", { className: "text-slate-500 text-sm mb-4 max-w-xs", children: description }), action] }));
// ─── Confirm Modal ────────────────────────────────────────────────────────
export const ConfirmModal = ({ open, title, message, confirmLabel = 'Confirm', danger = false, onConfirm, onClose, loading }) => {
    if (!open)
        return null;
    return (_jsx("div", { className: "modal-overlay", onClick: onClose, children: _jsxs("div", { className: "modal max-w-md", onClick: e => e.stopPropagation(), children: [_jsxs("div", { className: "modal-header", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: `p-2 rounded-lg ${danger ? 'bg-red-900/40' : 'bg-slate-700'}`, children: _jsx(AlertTriangle, { size: 18, className: danger ? 'text-red-400' : 'text-slate-300' }) }), _jsx("h3", { className: "font-semibold text-slate-100", children: title })] }), _jsx("button", { onClick: onClose, className: "btn-ghost btn-sm p-1.5", children: _jsx(X, { size: 16 }) })] }), _jsx("div", { className: "modal-body", children: _jsx("p", { className: "text-slate-300 text-sm", children: message }) }), _jsxs("div", { className: "modal-footer", children: [_jsx("button", { onClick: onClose, className: "btn-secondary", children: "Cancel" }), _jsxs("button", { onClick: onConfirm, className: danger ? 'btn-danger' : 'btn-primary', disabled: loading, children: [loading ? _jsx(Spinner, { size: 14 }) : null, confirmLabel] })] })] }) }));
};
// ─── Modal Wrapper ────────────────────────────────────────────────────────
export const Modal = ({ open, onClose, title, subtitle, children, footer, maxWidth = 'max-w-lg' }) => {
    if (!open)
        return null;
    return (_jsx("div", { className: "modal-overlay", onClick: onClose, children: _jsxs("div", { className: `modal ${maxWidth} w-full`, onClick: e => e.stopPropagation(), children: [_jsxs("div", { className: "modal-header", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-slate-100", children: title }), subtitle && _jsx("p", { className: "text-xs text-slate-400 mt-0.5", children: subtitle })] }), _jsx("button", { onClick: onClose, className: "btn-ghost btn-sm p-1.5", children: _jsx(X, { size: 16 }) })] }), _jsx("div", { className: "modal-body", children: children }), footer && _jsx("div", { className: "modal-footer", children: footer })] }) }));
};
// ─── Search Input ─────────────────────────────────────────────────────────
export const SearchInput = ({ value, onChange, placeholder = 'Search...', className = '' }) => (_jsxs("div", { className: `relative ${className}`, children: [_jsxs("svg", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-slate-400", width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [_jsx("circle", { cx: "11", cy: "11", r: "8" }), _jsx("path", { d: "m21 21-4.35-4.35" })] }), _jsx("input", { type: "text", value: value, onChange: e => onChange(e.target.value), placeholder: placeholder, className: "input pl-8" })] }));
// ─── Priority Dot ─────────────────────────────────────────────────────────
export const PriorityDot = ({ priority }) => {
    const colors = { urgent: 'bg-red-500', high: 'bg-orange-500', normal: 'bg-blue-500', low: 'bg-slate-500' };
    return _jsx("span", { className: `inline-block w-2 h-2 rounded-full ${colors[priority] || 'bg-slate-500'}` });
};
// ─── Stat Card ────────────────────────────────────────────────────────────
export const StatCard = ({ label, value, icon, iconBg = 'bg-slate-700', sub, subColor = 'text-slate-400' }) => (_jsxs("div", { className: "stat-card", children: [_jsx("div", { className: `stat-icon ${iconBg}`, children: icon }), _jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "text-xs text-slate-400 font-medium", children: label }), _jsx("p", { className: "text-2xl font-bold text-slate-100 leading-tight mt-0.5", children: value }), sub && _jsx("p", { className: `text-xs mt-0.5 ${subColor}`, children: sub })] })] }));
// ─── Section Header ───────────────────────────────────────────────────────
export const SectionHeader = ({ title, action }) => (_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h3", { className: "font-semibold text-slate-200 text-sm", children: title }), action] }));
let toastFn = null;
export const ToastContainer = () => {
    const [toasts, setToasts] = React.useState([]);
    toastFn = (t) => {
        const id = Math.random().toString(36).slice(2);
        setToasts(prev => [...prev, { ...t, id }]);
        setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), 3500);
    };
    return (_jsx("div", { className: "fixed bottom-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none", children: toasts.map(t => (_jsxs("div", { className: `flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border text-sm font-medium animate-slide-in pointer-events-auto
          ${t.type === 'success' ? 'bg-emerald-900 border-emerald-700 text-emerald-100' :
                t.type === 'error' ? 'bg-red-900 border-red-700 text-red-100' :
                    'bg-slate-800 border-slate-600 text-slate-100'}`, children: [_jsx("span", { children: t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ' }), t.message] }, t.id))) }));
};
export const toast = {
    success: (message) => toastFn?.({ message, type: 'success' }),
    error: (message) => toastFn?.({ message, type: 'error' }),
    info: (message) => toastFn?.({ message, type: 'info' }),
};
