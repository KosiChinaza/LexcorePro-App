import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { ClipboardList, CheckCircle, XCircle, Copy, UserPlus, X, Mail, AlertCircle } from 'lucide-react';
import { usersService } from '../services/api';
import { fmt } from '../utils/helpers';
import { PageLoader, toast } from '../components/ui';
const ROLES = ['staff', 'admin'];
const UsersPage = () => {
    const [tab, setTab] = useState('users');
    // Data
    const [users, setUsers] = useState([]);
    const [requests, setRequests] = useState([]);
    const [codes, setCodes] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    // Approval state
    const [approving, setApproving] = useState(null);
    const [approvedCode, setApprovedCode] = useState(null);
    // Add user modal
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', role: 'staff', position: '', phone: '' });
    const [submitting, setSubmitting] = useState(false);
    const [inviteResult, setInviteResult] = useState(null);
    const load = async () => {
        const [userRes, reqRes, codeRes, sessRes] = await Promise.all([
            usersService.list(),
            usersService.pendingRequests(),
            usersService.validationCodes(),
            usersService.sessions(),
        ]);
        setUsers(userRes.data);
        setRequests(reqRes.data);
        setCodes(codeRes.data);
        setSessions(sessRes.data);
    };
    useEffect(() => { setLoading(true); load().finally(() => setLoading(false)); }, []);
    // ── Approve pending request ──────────────────────────────────────────────
    const handleApprove = async (id) => {
        setApproving(id);
        try {
            const res = await usersService.approveRequest(id);
            setApprovedCode({ code: res.data.code, email: res.data.email, emailSent: res.data.emailSent });
            await load();
            toast.success(res.data.emailSent
                ? 'Request approved — activation email sent'
                : 'Request approved — email failed, share code manually');
        }
        catch {
            toast.error('Failed to approve');
        }
        finally {
            setApproving(null);
        }
    };
    const handleReject = async (id) => {
        try {
            await usersService.rejectRequest(id);
            await load();
            toast.success('Request rejected');
        }
        catch {
            toast.error('Failed to reject');
        }
    };
    // ── Direct-create user ───────────────────────────────────────────────────
    const handleCreateUser = async () => {
        if (!form.name.trim() || !form.email.trim()) {
            toast.error('Name and email are required');
            return;
        }
        setSubmitting(true);
        try {
            const res = await usersService.createUser(form);
            setInviteResult({ code: res.data.code, email: res.data.email, emailSent: res.data.emailSent });
            setForm({ name: '', email: '', role: 'staff', position: '', phone: '' });
            await load();
            toast.success(res.data.emailSent ? 'Invitation sent!' : 'User created — share code manually');
        }
        catch (err) {
            const msg = err?.response?.data?.error || 'Failed to create user';
            toast.error(msg);
        }
        finally {
            setSubmitting(false);
        }
    };
    const copyCode = (code) => { navigator.clipboard.writeText(code); toast.success('Code copied!'); };
    const closeModal = () => { setShowModal(false); setInviteResult(null); setForm({ name: '', email: '', role: 'staff', position: '', phone: '' }); };
    if (loading)
        return _jsx(PageLoader, {});
    return (_jsxs("div", { className: "space-y-5 animate-fade-in", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "page-title", children: "User Management" }), _jsx("p", { className: "page-subtitle", children: "Manage users, access requests, activation codes and sessions" })] }), _jsxs("button", { onClick: () => setShowModal(true), className: "btn-primary flex items-center gap-2", children: [_jsx(UserPlus, { size: 16 }), " Add User"] })] }), approvedCode && (_jsx("div", { className: "bg-emerald-900/30 border border-emerald-700 rounded-xl p-5", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "font-semibold text-emerald-300 mb-1", children: "\u2713 Request Approved!" }), approvedCode.emailSent === false && (_jsxs("p", { className: "text-yellow-400 text-sm mb-2 flex items-center gap-1", children: [_jsx(AlertCircle, { size: 13 }), " Email failed \u2014 share this code manually with ", _jsx("strong", { children: approvedCode.email }), ":"] })), approvedCode.emailSent !== false && (_jsxs("p", { className: "text-emerald-400 text-sm", children: ["Activation email sent to ", _jsx("strong", { children: approvedCode.email }), ". Code for your records:"] })), _jsxs("div", { className: "flex items-center gap-3 mt-3", children: [_jsx("code", { className: "bg-slate-900 text-brand-400 text-2xl font-bold font-mono px-4 py-2 rounded-lg tracking-widest", children: approvedCode.code }), _jsxs("button", { onClick: () => copyCode(approvedCode.code), className: "btn-secondary btn-sm", children: [_jsx(Copy, { size: 14 }), " Copy"] })] }), _jsx("p", { className: "text-emerald-600 text-xs mt-2", children: "Code expires in 3 days" })] }), _jsx("button", { onClick: () => setApprovedCode(null), className: "text-emerald-600 hover:text-emerald-400 text-xl", children: "\u00D7" })] }) })), _jsx("div", { className: "border-b border-slate-700 flex gap-0", children: [
                    ['users', `All Users (${users.length})`],
                    ['requests', `Requests (${requests.length})`],
                    ['codes', 'Activation Codes'],
                    ['sessions', 'Active Sessions'],
                ].map(([key, label]) => (_jsx("button", { onClick: () => setTab(key), className: `tab ${tab === key ? 'tab-active' : 'tab-inactive'}`, children: label }, key))) }), tab === 'users' && (_jsx("div", { className: "card", children: _jsx("div", { className: "table-wrapper", children: _jsxs("table", { className: "table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Name" }), _jsx("th", { children: "Email" }), _jsx("th", { children: "Role" }), _jsx("th", { children: "Position" }), _jsx("th", { children: "Status" }), _jsx("th", { children: "Joined" })] }) }), _jsxs("tbody", { children: [users.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 6, className: "text-center text-slate-500 py-8", children: "No users found" }) })), users.map(u => (_jsxs("tr", { children: [_jsx("td", { className: "text-slate-200 font-medium", children: u.name }), _jsx("td", { className: "text-slate-400", children: u.email }), _jsx("td", { children: _jsx("span", { className: u.role === 'admin' ? 'badge-yellow' : 'badge-blue', children: u.role === 'admin' ? 'Admin' : 'Staff' }) }), _jsx("td", { className: "text-slate-400", children: u.position || '—' }), _jsx("td", { children: _jsx("span", { className: u.status === 'active' ? 'badge-green' : 'badge-red', children: u.status }) }), _jsx("td", { className: "text-xs text-slate-500", children: fmt.date(u.createdAt) })] }, u.id)))] })] }) }) })), tab === 'requests' && (_jsx("div", { className: "card", children: requests.length === 0 ? (_jsxs("div", { className: "card-body text-center text-slate-500 py-8", children: [_jsx(ClipboardList, { size: 32, className: "mx-auto mb-2 opacity-30" }), _jsx("p", { children: "No pending access requests" })] })) : (_jsx("div", { className: "table-wrapper", children: _jsxs("table", { className: "table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Name" }), _jsx("th", { children: "Email" }), _jsx("th", { children: "Phone" }), _jsx("th", { children: "Position" }), _jsx("th", { children: "Requested" }), _jsx("th", { children: "Actions" })] }) }), _jsx("tbody", { children: requests.map(r => (_jsxs("tr", { children: [_jsx("td", { className: "text-slate-200 font-medium", children: r.name }), _jsx("td", { className: "text-slate-400", children: r.email }), _jsx("td", { className: "text-slate-400", children: r.phone || '—' }), _jsx("td", { className: "text-slate-400", children: r.position || '—' }), _jsx("td", { className: "text-xs text-slate-500", children: fmt.relative(r.createdAt) }), _jsx("td", { children: _jsxs("div", { className: "flex gap-2", children: [_jsxs("button", { onClick: () => handleApprove(r.id), disabled: approving === r.id, className: "btn-sm bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg flex items-center gap-1", children: [_jsx(CheckCircle, { size: 13 }), " ", approving === r.id ? '…' : 'Approve'] }), _jsxs("button", { onClick: () => handleReject(r.id), className: "btn-sm bg-red-800 hover:bg-red-700 text-white rounded-lg flex items-center gap-1", children: [_jsx(XCircle, { size: 13 }), " Reject"] })] }) })] }, r.id))) })] }) })) })), tab === 'codes' && (_jsx("div", { className: "card", children: _jsx("div", { className: "table-wrapper", children: _jsxs("table", { className: "table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Email" }), _jsx("th", { children: "Code" }), _jsx("th", { children: "Status" }), _jsx("th", { children: "Expires" }), _jsx("th", { children: "Issued" })] }) }), _jsxs("tbody", { children: [codes.length === 0 && _jsx("tr", { children: _jsx("td", { colSpan: 5, className: "text-center text-slate-500 py-8", children: "No activation codes issued" }) }), codes.map(c => (_jsxs("tr", { children: [_jsx("td", { className: "text-slate-300", children: c.email }), _jsx("td", { children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("code", { className: `font-mono font-bold tracking-widest text-sm ${c.used ? 'text-slate-600 line-through' : 'text-brand-400'}`, children: c.code }), !c.used && _jsx("button", { onClick: () => copyCode(c.code), className: "text-slate-500 hover:text-slate-300", children: _jsx(Copy, { size: 12 }) })] }) }), _jsx("td", { children: _jsx("span", { className: c.used ? 'badge-gray' : new Date(c.expiresAt) < new Date() ? 'badge-red' : 'badge-green', children: c.used ? 'Used' : new Date(c.expiresAt) < new Date() ? 'Expired' : 'Active' }) }), _jsx("td", { className: "text-xs text-slate-400", children: fmt.dateTime(c.expiresAt) }), _jsx("td", { className: "text-xs text-slate-500", children: fmt.relative(c.createdAt) })] }, c.id)))] })] }) }) })), tab === 'sessions' && (_jsx("div", { className: "card", children: _jsx("div", { className: "table-wrapper", children: _jsxs("table", { className: "table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "User" }), _jsx("th", { children: "IP Address" }), _jsx("th", { children: "Logged In" }), _jsx("th", { children: "Expires" }), _jsx("th", { children: "Device" })] }) }), _jsxs("tbody", { children: [sessions.length === 0 && _jsx("tr", { children: _jsx("td", { colSpan: 5, className: "text-center text-slate-500 py-8", children: "No active sessions" }) }), sessions.map(s => (_jsxs("tr", { children: [_jsx("td", { children: _jsxs("div", { children: [_jsx("p", { className: "text-slate-200 font-medium", children: s.user.name }), _jsx("p", { className: "text-xs text-slate-500", children: s.user.email })] }) }), _jsx("td", { className: "font-mono text-slate-400", children: s.ip || '—' }), _jsx("td", { className: "text-xs text-slate-400", children: fmt.relative(s.createdAt) }), _jsx("td", { className: "text-xs text-slate-400", children: fmt.date(s.expiresAt) }), _jsx("td", { className: "text-xs text-slate-500 max-w-[150px] truncate", children: s.userAgent?.split('(')[0] || '—' })] }, s.id)))] })] }) }) })), showModal && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm", children: _jsxs("div", { className: "bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl", children: [_jsxs("div", { className: "flex items-center justify-between px-6 py-5 border-b border-slate-700", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-lg font-semibold text-slate-100", children: "Add New User" }), _jsx("p", { className: "text-slate-400 text-sm mt-0.5", children: "They'll receive an email to set their password" })] }), _jsx("button", { onClick: closeModal, className: "text-slate-500 hover:text-slate-300 transition-colors", children: _jsx(X, { size: 20 }) })] }), _jsx("div", { className: "px-6 py-5 space-y-4", children: inviteResult ? (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: `rounded-xl p-4 border ${inviteResult.emailSent ? 'bg-emerald-900/30 border-emerald-700' : 'bg-yellow-900/20 border-yellow-700'}`, children: [_jsx("div", { className: "flex items-center gap-2 mb-2", children: inviteResult.emailSent
                                                    ? _jsxs(_Fragment, { children: [_jsx(Mail, { size: 16, className: "text-emerald-400" }), _jsx("span", { className: "font-semibold text-emerald-300", children: "Invitation email sent!" })] })
                                                    : _jsxs(_Fragment, { children: [_jsx(AlertCircle, { size: 16, className: "text-yellow-400" }), _jsx("span", { className: "font-semibold text-yellow-300", children: "Email failed \u2014 share code manually" })] }) }), _jsx("p", { className: "text-sm text-slate-400 mb-3", children: inviteResult.emailSent
                                                    ? `An activation email has been sent to ${inviteResult.email}. Keep this code for your records:`
                                                    : `Share this activation code with ${inviteResult.email}:` }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("code", { className: "bg-slate-900 text-brand-400 text-2xl font-bold font-mono px-4 py-2 rounded-lg tracking-widest flex-1 text-center", children: inviteResult.code }), _jsxs("button", { onClick: () => copyCode(inviteResult.code), className: "btn-secondary btn-sm", children: [_jsx(Copy, { size: 14 }), " Copy"] })] }), _jsx("p", { className: "text-xs text-slate-500 mt-2 text-center", children: "Code expires in 3 days" })] }), _jsxs("div", { className: "flex gap-3", children: [_jsx("button", { onClick: () => setInviteResult(null), className: "btn-secondary flex-1", children: "Add Another User" }), _jsx("button", { onClick: closeModal, className: "btn-primary flex-1", children: "Done" })] })] })) : (
                            /* Form state */
                            _jsxs(_Fragment, { children: [_jsxs("div", { className: "form-group", children: [_jsxs("label", { className: "label", children: ["Full Name ", _jsx("span", { className: "text-red-400", children: "*" })] }), _jsx("input", { type: "text", className: "input", placeholder: "e.g. Amara Okonkwo", value: form.name, onChange: e => setForm(f => ({ ...f, name: e.target.value })) })] }), _jsxs("div", { className: "form-group", children: [_jsxs("label", { className: "label", children: ["Email Address ", _jsx("span", { className: "text-red-400", children: "*" })] }), _jsx("input", { type: "email", className: "input", placeholder: "amara@example.com", value: form.email, onChange: e => setForm(f => ({ ...f, email: e.target.value })) })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Role" }), _jsx("select", { className: "input", value: form.role, onChange: e => setForm(f => ({ ...f, role: e.target.value })), children: ROLES.map(r => _jsx("option", { value: r, children: r === 'admin' ? 'Admin' : 'Staff' }, r)) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Position" }), _jsx("input", { type: "text", className: "input", placeholder: "e.g. Associate", value: form.position, onChange: e => setForm(f => ({ ...f, position: e.target.value })) })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Phone" }), _jsx("input", { type: "tel", className: "input", placeholder: "+234 800 000 0000", value: form.phone, onChange: e => setForm(f => ({ ...f, phone: e.target.value })) })] }), _jsxs("div", { className: "bg-slate-700/40 rounded-lg px-4 py-3 text-xs text-slate-400 flex items-start gap-2", children: [_jsx(Mail, { size: 13, className: "mt-0.5 shrink-0 text-slate-500" }), _jsx("span", { children: "An activation email with a 6-character code will be sent to this address. The user sets their own password \u2014 you never see it." })] }), _jsxs("div", { className: "flex gap-3 pt-1", children: [_jsx("button", { onClick: closeModal, className: "btn-secondary flex-1", children: "Cancel" }), _jsx("button", { onClick: handleCreateUser, disabled: submitting, className: "btn-primary flex-1 justify-center", children: submitting ? 'Sending…' : 'Send Invitation' })] })] })) })] }) }))] }));
};
export default UsersPage;
