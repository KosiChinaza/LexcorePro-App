import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState, useCallback } from 'react';
import { Users, Plus, Building2, User } from 'lucide-react';
import { clientsService } from '../services/api';
import { statusColor } from '../utils/helpers';
import { PageLoader, EmptyState, SearchInput, Modal, toast } from '../components/ui';
const ClientsPage = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', type: 'corporate' });
    const load = useCallback(async () => {
        const params = {};
        if (search)
            params.search = search;
        const res = await clientsService.list(params);
        setClients(res.data);
    }, [search]);
    useEffect(() => { setLoading(true); load().finally(() => setLoading(false)); }, [load]);
    const handleCreate = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            const res = await clientsService.create(form);
            setClients(prev => [res.data, ...prev]);
            setShowCreate(false);
            setForm({ name: '', email: '', phone: '', address: '', type: 'corporate' });
            toast.success('Client created');
        }
        catch {
            toast.error('Failed to create client');
        }
        finally {
            setCreating(false);
        }
    };
    if (loading)
        return _jsx(PageLoader, {});
    return (_jsxs("div", { className: "space-y-5 animate-fade-in", children: [_jsxs("div", { className: "page-header", children: [_jsxs("div", { children: [_jsx("h1", { className: "page-title", children: "Clients" }), _jsxs("p", { className: "page-subtitle", children: [clients.length, " client", clients.length !== 1 ? 's' : ''] })] }), _jsxs("button", { onClick: () => setShowCreate(true), className: "btn-primary", children: [_jsx(Plus, { size: 16 }), " New Client"] })] }), _jsx(SearchInput, { value: search, onChange: setSearch, placeholder: "Search clients\u2026", className: "max-w-sm" }), clients.length === 0 ? (_jsx(EmptyState, { icon: _jsx(Users, { size: 40 }), title: "No clients found", action: _jsx("button", { onClick: () => setShowCreate(true), className: "btn-primary btn-sm", children: "Add Client" }) })) : (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4", children: clients.map(c => (_jsx("div", { className: "card p-5 hover:border-slate-600 transition-colors", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: `p-2.5 rounded-xl flex-shrink-0 ${c.type === 'corporate' ? 'bg-blue-900/40' : 'bg-purple-900/40'}`, children: c.type === 'corporate' ? _jsx(Building2, { size: 18, className: "text-blue-400" }) : _jsx(User, { size: 18, className: "text-purple-400" }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-start justify-between gap-2", children: [_jsx("h3", { className: "font-semibold text-slate-100 leading-tight truncate", children: c.name }), _jsx("span", { className: statusColor[c.type] || 'badge-gray', children: c.type })] }), c.email && _jsx("p", { className: "text-slate-400 text-sm mt-1 truncate", children: c.email }), c.phone && _jsx("p", { className: "text-slate-500 text-xs mt-0.5", children: c.phone }), c.address && _jsx("p", { className: "text-slate-500 text-xs mt-0.5 truncate", children: c.address }), _jsxs("div", { className: "flex items-center justify-between mt-3 pt-3 border-t border-slate-700", children: [_jsxs("span", { className: statusColor[c.kycStatus] || 'badge-gray', children: ["KYC: ", c.kycStatus] }), _jsxs("span", { className: "text-xs text-slate-500", children: [c._count?.matters ?? 0, " matter", c._count?.matters !== 1 ? 's' : ''] })] })] })] }) }, c.id))) })), _jsx(Modal, { open: showCreate, onClose: () => setShowCreate(false), title: "New Client", footer: _jsxs(_Fragment, { children: [_jsx("button", { onClick: () => setShowCreate(false), className: "btn-secondary", children: "Cancel" }), _jsx("button", { form: "client-form", type: "submit", className: "btn-primary", disabled: creating, children: creating ? 'Creating…' : 'Create Client' })] }), children: _jsxs("form", { id: "client-form", onSubmit: handleCreate, className: "space-y-4", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Full Name / Company Name *" }), _jsx("input", { className: "input", required: true, value: form.name, onChange: e => setForm(f => ({ ...f, name: e.target.value })), placeholder: "Okafor Holdings Ltd" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Type" }), _jsxs("select", { className: "select", value: form.type, onChange: e => setForm(f => ({ ...f, type: e.target.value })), children: [_jsx("option", { value: "corporate", children: "Corporate" }), _jsx("option", { value: "individual", children: "Individual" })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Email" }), _jsx("input", { type: "email", className: "input", value: form.email, onChange: e => setForm(f => ({ ...f, email: e.target.value })) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Phone" }), _jsx("input", { className: "input", value: form.phone, onChange: e => setForm(f => ({ ...f, phone: e.target.value })), placeholder: "+234 800 000 0000" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Address" }), _jsx("textarea", { className: "input resize-none", rows: 2, value: form.address, onChange: e => setForm(f => ({ ...f, address: e.target.value })) })] })] }) })] }));
};
export default ClientsPage;
