import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Briefcase } from 'lucide-react';
import { mattersService, clientsService } from '../services/api';
import { fmt, matterTypeColor, matterTypeLabel, statusColor } from '../utils/helpers';
import { PageLoader, EmptyState, SearchInput, Modal, PriorityDot, toast } from '../components/ui';
const MATTER_TYPES = ['LIT', 'CORP', 'PROP', 'EMP', 'TAX', 'FAM', 'CRIM'];
const STATUSES = ['active', 'urgent', 'on_hold', 'closed'];
const MattersPage = () => {
    const navigate = useNavigate();
    const [matters, setMatters] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterType, setFilterType] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({ title: '', type: 'LIT', clientId: '', description: '', priority: 'normal' });
    const load = useCallback(async () => {
        const params = {};
        if (filterStatus)
            params.status = filterStatus;
        if (filterType)
            params.type = filterType;
        if (search)
            params.search = search;
        const res = await mattersService.list(params);
        setMatters(res.data.data || res.data);
    }, [filterStatus, filterType, search]);
    useEffect(() => {
        setLoading(true);
        Promise.all([load(), clientsService.list().then(r => setClients(r.data))]).finally(() => setLoading(false));
    }, [load]);
    const handleCreate = async (e) => {
        e.preventDefault();
        if (!form.clientId) {
            toast.error('Please select a client');
            return;
        }
        setCreating(true);
        try {
            const res = await mattersService.create(form);
            setMatters(prev => [res.data, ...prev]);
            setShowCreate(false);
            setForm({ title: '', type: 'LIT', clientId: '', description: '', priority: 'normal' });
            toast.success('Matter created');
            navigate(`/matters/${res.data.id}`);
        }
        catch {
            toast.error('Failed to create matter');
        }
        finally {
            setCreating(false);
        }
    };
    if (loading)
        return _jsx(PageLoader, {});
    return (_jsxs("div", { className: "space-y-5 animate-fade-in", children: [_jsxs("div", { className: "page-header", children: [_jsxs("div", { children: [_jsx("h1", { className: "page-title", children: "Matters" }), _jsxs("p", { className: "page-subtitle", children: [matters.length, " matter", matters.length !== 1 ? 's' : '', " found"] })] }), _jsxs("button", { onClick: () => setShowCreate(true), className: "btn-primary", children: [_jsx(Plus, { size: 16 }), " New Matter"] })] }), _jsxs("div", { className: "flex flex-wrap gap-3", children: [_jsx(SearchInput, { value: search, onChange: setSearch, placeholder: "Search matters, clients\u2026", className: "flex-1 min-w-[200px] max-w-sm" }), _jsxs("select", { className: "select w-auto", value: filterStatus, onChange: e => setFilterStatus(e.target.value), children: [_jsx("option", { value: "", children: "All Statuses" }), STATUSES.map(s => _jsx("option", { value: s, children: s.replace('_', ' ') }, s))] }), _jsxs("select", { className: "select w-auto", value: filterType, onChange: e => setFilterType(e.target.value), children: [_jsx("option", { value: "", children: "All Types" }), MATTER_TYPES.map(t => _jsx("option", { value: t, children: matterTypeLabel[t] }, t))] })] }), _jsx("div", { className: "card", children: matters.length === 0 ? (_jsx(EmptyState, { icon: _jsx(Briefcase, { size: 40 }), title: "No matters found", description: "Try adjusting your filters or create a new matter.", action: _jsx("button", { onClick: () => setShowCreate(true), className: "btn-primary btn-sm", children: "New Matter" }) })) : (_jsx("div", { className: "table-wrapper", children: _jsxs("table", { className: "table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Matter" }), _jsx("th", { children: "Client" }), _jsx("th", { children: "Type" }), _jsx("th", { children: "Priority" }), _jsx("th", { children: "Status" }), _jsx("th", { children: "Open Date" }), _jsx("th", { children: "Team" })] }) }), _jsx("tbody", { children: matters.map(m => (_jsxs("tr", { className: "cursor-pointer", onClick: () => navigate(`/matters/${m.id}`), children: [_jsx("td", { children: _jsxs("div", { children: [_jsx("p", { className: "text-slate-200 font-semibold text-xs", children: m.matterNo }), _jsx("p", { className: "text-slate-300 text-sm leading-tight mt-0.5 max-w-[240px] truncate", children: m.title })] }) }), _jsx("td", { className: "text-slate-300", children: m.client.name }), _jsx("td", { children: _jsx("span", { className: matterTypeColor[m.type], children: matterTypeLabel[m.type] }) }), _jsx("td", { children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(PriorityDot, { priority: m.priority }), _jsx("span", { className: "text-slate-300 capitalize text-xs", children: m.priority })] }) }), _jsx("td", { children: _jsx("span", { className: statusColor[m.status], children: m.status.replace('_', ' ') }) }), _jsx("td", { className: "text-slate-400 text-xs", children: fmt.date(m.openDate) }), _jsx("td", { children: _jsxs("div", { className: "flex -space-x-1", children: [m.team.slice(0, 3).map(t => (_jsx("div", { title: t.user.name, className: "w-7 h-7 rounded-full bg-slate-600 border-2 border-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-300", children: t.user.name.split(' ').map(n => n[0]).join('').slice(0, 2) }, t.id))), m.team.length > 3 && _jsxs("div", { className: "w-7 h-7 rounded-full bg-slate-700 border-2 border-slate-800 flex items-center justify-center text-[10px] text-slate-400", children: ["+", m.team.length - 3] })] }) })] }, m.id))) })] }) })) }), _jsx(Modal, { open: showCreate, onClose: () => setShowCreate(false), title: "Open New Matter", footer: _jsxs(_Fragment, { children: [_jsx("button", { onClick: () => setShowCreate(false), className: "btn-secondary", children: "Cancel" }), _jsx("button", { form: "create-matter-form", type: "submit", className: "btn-primary", disabled: creating, children: creating ? 'Creating…' : 'Open Matter' })] }), children: _jsxs("form", { id: "create-matter-form", onSubmit: handleCreate, className: "space-y-4", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Matter Title *" }), _jsx("input", { className: "input", required: true, value: form.title, onChange: e => setForm(f => ({ ...f, title: e.target.value })), placeholder: "e.g. Okafor Holdings v. FIRS" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Type *" }), _jsx("select", { className: "select", value: form.type, onChange: e => setForm(f => ({ ...f, type: e.target.value })), children: MATTER_TYPES.map(t => _jsx("option", { value: t, children: matterTypeLabel[t] }, t)) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Priority" }), _jsx("select", { className: "select", value: form.priority, onChange: e => setForm(f => ({ ...f, priority: e.target.value })), children: ['low', 'normal', 'high', 'urgent'].map(p => _jsx("option", { value: p, children: p }, p)) })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Client *" }), _jsxs("select", { className: "select", required: true, value: form.clientId, onChange: e => setForm(f => ({ ...f, clientId: e.target.value })), children: [_jsx("option", { value: "", children: "Select client\u2026" }), clients.map(c => _jsx("option", { value: c.id, children: c.name }, c.id))] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Description" }), _jsx("textarea", { className: "input min-h-[80px] resize-none", value: form.description, onChange: e => setForm(f => ({ ...f, description: e.target.value })), placeholder: "Brief description of the matter\u2026" })] })] }) })] }));
};
export default MattersPage;
