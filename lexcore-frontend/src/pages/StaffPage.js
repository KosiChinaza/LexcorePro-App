import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Edit2, XCircle } from 'lucide-react';
import { usersService } from '../services/api';
import { statusColor } from '../utils/helpers';
import { PageLoader, Modal, Avatar, ConfirmModal, toast } from '../components/ui';
const StaffPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editUser, setEditUser] = useState(null);
    const [deactivateId, setDeactivateId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ name: '', phone: '', position: '', role: 'staff', status: 'active' });
    const load = async () => { const res = await usersService.list(); setUsers(res.data); };
    useEffect(() => { setLoading(true); load().finally(() => setLoading(false)); }, []);
    const openEdit = (u) => {
        setEditUser(u);
        setForm({ name: u.name, phone: u.phone || '', position: u.position || '', role: u.role, status: u.status });
    };
    const handleSave = async (e) => {
        e.preventDefault();
        if (!editUser)
            return;
        setSaving(true);
        try {
            await usersService.update(editUser.id, form);
            await load();
            setEditUser(null);
            toast.success('Staff updated');
        }
        catch {
            toast.error('Failed to update');
        }
        finally {
            setSaving(false);
        }
    };
    const handleDeactivate = async () => {
        if (!deactivateId)
            return;
        try {
            await usersService.deactivate(deactivateId);
            await load();
            setDeactivateId(null);
            toast.success('Staff deactivated');
        }
        catch {
            toast.error('Failed to deactivate');
        }
    };
    if (loading)
        return _jsx(PageLoader, {});
    const active = users.filter(u => u.status === 'active');
    return (_jsxs("div", { className: "space-y-5 animate-fade-in", children: [_jsx("div", { className: "page-header", children: _jsxs("div", { children: [_jsx("h1", { className: "page-title", children: "Staff & HR" }), _jsxs("p", { className: "page-subtitle", children: [active.length, " active staff member", active.length !== 1 ? 's' : ''] })] }) }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4", children: users.map(u => (_jsx("div", { className: `card p-5 ${u.status !== 'active' ? 'opacity-60' : ''}`, children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(Avatar, { name: u.name, size: "lg" }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-slate-100", children: u.name }), _jsx("p", { className: "text-sm text-slate-400", children: u.position || u.role })] }), _jsx("span", { className: u.role === 'admin' ? 'badge-purple' : 'badge-blue', children: u.role })] }), _jsx("p", { className: "text-xs text-slate-500 mt-1", children: u.email }), u.phone && _jsx("p", { className: "text-xs text-slate-500", children: u.phone }), _jsxs("div", { className: "flex items-center justify-between mt-3 pt-3 border-t border-slate-700", children: [_jsx("span", { className: statusColor[u.status] || 'badge-gray', children: u.status }), _jsxs("div", { className: "flex gap-1", children: [_jsx("button", { onClick: () => openEdit(u), className: "btn-ghost btn-sm p-1.5", children: _jsx(Edit2, { size: 14 }) }), u.status === 'active' && (_jsx("button", { onClick: () => setDeactivateId(u.id), className: "btn-ghost btn-sm p-1.5 text-red-400", children: _jsx(XCircle, { size: 14 }) }))] })] })] })] }) }, u.id))) }), _jsx(Modal, { open: !!editUser, onClose: () => setEditUser(null), title: "Edit Staff", footer: _jsxs(_Fragment, { children: [_jsx("button", { onClick: () => setEditUser(null), className: "btn-secondary", children: "Cancel" }), _jsx("button", { form: "staff-form", type: "submit", className: "btn-primary", disabled: saving, children: saving ? 'Saving…' : 'Save Changes' })] }), children: _jsxs("form", { id: "staff-form", onSubmit: handleSave, className: "space-y-4", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Full Name" }), _jsx("input", { className: "input", value: form.name, onChange: e => setForm(f => ({ ...f, name: e.target.value })) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Position" }), _jsx("input", { className: "input", value: form.position, onChange: e => setForm(f => ({ ...f, position: e.target.value })) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Phone" }), _jsx("input", { className: "input", value: form.phone, onChange: e => setForm(f => ({ ...f, phone: e.target.value })) })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Role" }), _jsxs("select", { className: "select", value: form.role, onChange: e => setForm(f => ({ ...f, role: e.target.value })), children: [_jsx("option", { value: "staff", children: "Staff" }), _jsx("option", { value: "admin", children: "Admin" })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Status" }), _jsxs("select", { className: "select", value: form.status, onChange: e => setForm(f => ({ ...f, status: e.target.value })), children: [_jsx("option", { value: "active", children: "Active" }), _jsx("option", { value: "inactive", children: "Inactive" })] })] })] })] }) }), _jsx(ConfirmModal, { open: !!deactivateId, title: "Deactivate Staff", message: "This will prevent the staff member from logging in. You can reactivate them later.", danger: true, onConfirm: handleDeactivate, onClose: () => setDeactivateId(null), confirmLabel: "Deactivate" })] }));
};
export default StaffPage;
