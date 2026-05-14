import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Plus, CheckCircle, XCircle, UserCheck } from 'lucide-react';
import { leaveService } from '../services/api';
import { fmt, statusColor, leaveTypeLabel } from '../utils/helpers';
import { PageLoader, EmptyState, Modal, Avatar, toast } from '../components/ui';
import { useAuth } from '../context/AuthContext';
const LeavePage = () => {
    const { user, isAdmin } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({ type: 'annual', startDate: '', endDate: '', reason: '' });
    const load = async () => {
        const res = await leaveService.list();
        setRequests(res.data);
    };
    useEffect(() => { setLoading(true); load().finally(() => setLoading(false)); }, []);
    const handleCreate = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            await leaveService.create(form);
            await load();
            setShowCreate(false);
            setForm({ type: 'annual', startDate: '', endDate: '', reason: '' });
            toast.success('Leave request submitted');
        }
        catch {
            toast.error('Failed to submit leave request');
        }
        finally {
            setCreating(false);
        }
    };
    const handleApprove = async (id) => {
        try {
            await leaveService.approve(id);
            await load();
            toast.success('Leave approved');
        }
        catch {
            toast.error('Failed to approve');
        }
    };
    const handleReject = async (id) => {
        try {
            await leaveService.reject(id);
            await load();
            toast.success('Leave rejected');
        }
        catch {
            toast.error('Failed to reject');
        }
    };
    const pending = requests.filter(r => r.status === 'pending');
    const mine = requests.filter(r => r.userId === user?.id);
    if (loading)
        return _jsx(PageLoader, {});
    const getDays = (start, end) => {
        const diff = new Date(end).getTime() - new Date(start).getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
    };
    return (_jsxs("div", { className: "space-y-5 animate-fade-in", children: [_jsxs("div", { className: "page-header", children: [_jsxs("div", { children: [_jsx("h1", { className: "page-title", children: "Leave Management" }), _jsxs("p", { className: "page-subtitle", children: [pending.length, " pending request", pending.length !== 1 ? 's' : ''] })] }), _jsxs("button", { onClick: () => setShowCreate(true), className: "btn-primary", children: [_jsx(Plus, { size: 16 }), " Request Leave"] })] }), isAdmin && pending.length > 0 && (_jsxs("div", { className: "card", children: [_jsx("div", { className: "card-header", children: _jsxs("h3", { className: "font-semibold text-slate-200 text-sm", children: ["Pending Approval (", pending.length, ")"] }) }), _jsx("div", { className: "divide-y divide-slate-700/50", children: pending.map(r => (_jsxs("div", { className: "px-5 py-4 flex items-center gap-4", children: [_jsx(Avatar, { name: r.user?.name || '' }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [_jsx("p", { className: "font-medium text-slate-200", children: r.user?.name }), _jsx("span", { className: "badge-yellow", children: leaveTypeLabel[r.type] })] }), _jsxs("p", { className: "text-sm text-slate-400 mt-0.5", children: [fmt.date(r.startDate), " \u2192 ", fmt.date(r.endDate), " \u00B7 ", getDays(r.startDate, r.endDate), " days"] }), r.reason && _jsx("p", { className: "text-xs text-slate-500 mt-0.5", children: r.reason })] }), _jsxs("div", { className: "flex gap-2 flex-shrink-0", children: [_jsxs("button", { onClick: () => handleApprove(r.id), className: "btn-sm bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg flex items-center gap-1", children: [_jsx(CheckCircle, { size: 14 }), " Approve"] }), _jsxs("button", { onClick: () => handleReject(r.id), className: "btn-sm bg-red-700 hover:bg-red-600 text-white rounded-lg flex items-center gap-1", children: [_jsx(XCircle, { size: 14 }), " Reject"] })] })] }, r.id))) })] })), _jsxs("div", { className: "card", children: [_jsx("div", { className: "card-header", children: _jsx("h3", { className: "font-semibold text-slate-200 text-sm", children: isAdmin ? 'All Leave Requests' : 'My Requests' }) }), requests.length === 0 ? (_jsx(EmptyState, { icon: _jsx(UserCheck, { size: 40 }), title: "No leave requests", action: _jsx("button", { onClick: () => setShowCreate(true), className: "btn-primary btn-sm", children: "Request Leave" }) })) : (_jsx("div", { className: "table-wrapper", children: _jsxs("table", { className: "table", children: [_jsx("thead", { children: _jsxs("tr", { children: [isAdmin && _jsx("th", { children: "Staff" }), _jsx("th", { children: "Type" }), _jsx("th", { children: "From" }), _jsx("th", { children: "To" }), _jsx("th", { children: "Days" }), _jsx("th", { children: "Reason" }), _jsx("th", { children: "Status" }), _jsx("th", { children: "Reviewed By" })] }) }), _jsx("tbody", { children: (isAdmin ? requests : mine).map(r => (_jsxs("tr", { children: [isAdmin && _jsx("td", { children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Avatar, { name: r.user?.name || '', size: "sm" }), _jsx("span", { className: "text-slate-300", children: r.user?.name })] }) }), _jsx("td", { children: _jsx("span", { className: "badge-blue", children: leaveTypeLabel[r.type] }) }), _jsx("td", { className: "text-slate-300 text-xs", children: fmt.date(r.startDate) }), _jsx("td", { className: "text-slate-300 text-xs", children: fmt.date(r.endDate) }), _jsx("td", { className: "font-mono text-brand-400", children: getDays(r.startDate, r.endDate) }), _jsx("td", { className: "text-slate-400 text-xs max-w-[150px] truncate", children: r.reason || '—' }), _jsx("td", { children: _jsx("span", { className: statusColor[r.status] || 'badge-gray', children: r.status }) }), _jsx("td", { className: "text-slate-400 text-xs", children: r.reviewedBy || '—' })] }, r.id))) })] }) }))] }), _jsx(Modal, { open: showCreate, onClose: () => setShowCreate(false), title: "Request Leave", footer: _jsxs(_Fragment, { children: [_jsx("button", { onClick: () => setShowCreate(false), className: "btn-secondary", children: "Cancel" }), _jsx("button", { form: "leave-form", type: "submit", className: "btn-primary", disabled: creating, children: creating ? 'Submitting…' : 'Submit Request' })] }), children: _jsxs("form", { id: "leave-form", onSubmit: handleCreate, className: "space-y-4", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Leave Type *" }), _jsx("select", { className: "select", required: true, value: form.type, onChange: e => setForm(f => ({ ...f, type: e.target.value })), children: Object.entries(leaveTypeLabel).map(([k, v]) => _jsx("option", { value: k, children: v }, k)) })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Start Date *" }), _jsx("input", { type: "date", className: "input", required: true, value: form.startDate, onChange: e => setForm(f => ({ ...f, startDate: e.target.value })) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "End Date *" }), _jsx("input", { type: "date", className: "input", required: true, value: form.endDate, onChange: e => setForm(f => ({ ...f, endDate: e.target.value })) })] })] }), form.startDate && form.endDate && (_jsxs("p", { className: "text-sm text-brand-400 font-medium", children: [getDays(form.startDate, form.endDate), " day", getDays(form.startDate, form.endDate) !== 1 ? 's' : '', " requested"] })), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Reason" }), _jsx("textarea", { className: "input resize-none", rows: 3, value: form.reason, onChange: e => setForm(f => ({ ...f, reason: e.target.value })), placeholder: "Brief reason for leave\u2026" })] })] }) })] }));
};
export default LeavePage;
