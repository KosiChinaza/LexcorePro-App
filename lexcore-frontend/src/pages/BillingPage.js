import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState, useCallback } from 'react';
import { Plus, FileText, CheckCircle, Send } from 'lucide-react';
import { invoicesService, mattersService } from '../services/api';
import { fmt, statusColor } from '../utils/helpers';
import { PageLoader, EmptyState, Modal, ConfirmModal, StatCard, toast } from '../components/ui';
const BillingPage = () => {
    const [invoices, setInvoices] = useState([]);
    const [matters, setMatters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    const [creating, setCreating] = useState(false);
    const [payId, setPayId] = useState(null);
    const [paying, setPaying] = useState(false);
    const [form, setForm] = useState({ matterId: '', amount: '', dueDate: '', notes: '' });
    const load = useCallback(async () => {
        const params = {};
        if (filterStatus)
            params.status = filterStatus;
        const [invRes, matRes] = await Promise.all([invoicesService.list(params), mattersService.list({ limit: '100' })]);
        setInvoices(invRes.data);
        setMatters(matRes.data.data || []);
    }, [filterStatus]);
    useEffect(() => { setLoading(true); load().finally(() => setLoading(false)); }, [load]);
    const handleCreate = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            await invoicesService.create({ ...form, amount: Number(form.amount) });
            await load();
            setShowCreate(false);
            setForm({ matterId: '', amount: '', dueDate: '', notes: '' });
            toast.success('Invoice created');
        }
        catch {
            toast.error('Failed to create invoice');
        }
        finally {
            setCreating(false);
        }
    };
    const handleMarkPaid = async () => {
        if (!payId)
            return;
        setPaying(true);
        try {
            await invoicesService.markPaid(payId);
            await load();
            setPayId(null);
            toast.success('Invoice marked as paid');
        }
        catch {
            toast.error('Failed to update invoice');
        }
        finally {
            setPaying(false);
        }
    };
    const handleStatusUpdate = async (id, status) => {
        try {
            await invoicesService.update(id, { status });
            await load();
            toast.success(`Invoice marked as ${status}`);
        }
        catch {
            toast.error('Failed to update');
        }
    };
    const totalPaid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0);
    const totalPending = invoices.filter(i => ['sent', 'overdue'].includes(i.status)).reduce((s, i) => s + i.total, 0);
    const totalDraft = invoices.filter(i => i.status === 'draft').reduce((s, i) => s + i.total, 0);
    if (loading)
        return _jsx(PageLoader, {});
    return (_jsxs("div", { className: "space-y-5 animate-fade-in", children: [_jsxs("div", { className: "page-header", children: [_jsxs("div", { children: [_jsx("h1", { className: "page-title", children: "Billing" }), _jsxs("p", { className: "page-subtitle", children: [invoices.length, " invoice", invoices.length !== 1 ? 's' : ''] })] }), _jsxs("button", { onClick: () => setShowCreate(true), className: "btn-primary", children: [_jsx(Plus, { size: 16 }), " New Invoice"] })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [_jsx(StatCard, { label: "Revenue Collected", value: fmt.naira(totalPaid), icon: _jsx(CheckCircle, { size: 20, className: "text-emerald-400" }), iconBg: "bg-emerald-900/40" }), _jsx(StatCard, { label: "Outstanding", value: fmt.naira(totalPending), icon: _jsx(Send, { size: 20, className: "text-blue-400" }), iconBg: "bg-blue-900/40" }), _jsx(StatCard, { label: "Draft", value: fmt.naira(totalDraft), icon: _jsx(FileText, { size: 20, className: "text-slate-400" }), iconBg: "bg-slate-700" })] }), _jsx("div", { className: "flex gap-3", children: ['', 'draft', 'sent', 'paid', 'overdue', 'cancelled'].map(s => (_jsx("button", { onClick: () => setFilterStatus(s), className: `btn-sm rounded-full ${filterStatus === s ? 'bg-brand-500 text-slate-900' : 'btn-secondary'}`, children: s || 'All' }, s))) }), _jsx("div", { className: "card", children: invoices.length === 0 ? (_jsx(EmptyState, { icon: _jsx(FileText, { size: 40 }), title: "No invoices", action: _jsx("button", { onClick: () => setShowCreate(true), className: "btn-primary btn-sm", children: "Create Invoice" }) })) : (_jsx("div", { className: "table-wrapper", children: _jsxs("table", { className: "table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Invoice" }), _jsx("th", { children: "Client" }), _jsx("th", { children: "Matter" }), _jsx("th", { children: "Amount" }), _jsx("th", { children: "VAT" }), _jsx("th", { children: "Total" }), _jsx("th", { children: "Status" }), _jsx("th", { children: "Due" }), _jsx("th", { children: "Actions" })] }) }), _jsx("tbody", { children: invoices.map(inv => (_jsxs("tr", { children: [_jsx("td", { className: "font-mono text-slate-200 font-medium", children: inv.invoiceNo }), _jsx("td", { className: "text-slate-300", children: inv.matter?.client.name }), _jsx("td", { className: "text-xs text-slate-400", children: inv.matter?.matterNo }), _jsx("td", { className: "font-mono", children: fmt.naira(inv.amount) }), _jsx("td", { className: "font-mono text-slate-400", children: fmt.naira(inv.vat) }), _jsx("td", { className: "font-mono font-semibold text-emerald-400", children: fmt.naira(inv.total) }), _jsx("td", { children: _jsx("span", { className: statusColor[inv.status], children: inv.status }) }), _jsx("td", { className: "text-xs text-slate-400", children: inv.dueDate ? fmt.date(inv.dueDate) : '—' }), _jsx("td", { children: _jsxs("div", { className: "flex gap-1", children: [inv.status === 'draft' && _jsx("button", { onClick: () => handleStatusUpdate(inv.id, 'sent'), className: "btn-ghost btn-sm text-blue-400 px-2", children: "Send" }), ['sent', 'overdue'].includes(inv.status) && _jsx("button", { onClick: () => setPayId(inv.id), className: "btn-ghost btn-sm text-emerald-400 px-2", children: "Mark Paid" })] }) })] }, inv.id))) })] }) })) }), _jsx(Modal, { open: showCreate, onClose: () => setShowCreate(false), title: "Create Invoice", footer: _jsxs(_Fragment, { children: [_jsx("button", { onClick: () => setShowCreate(false), className: "btn-secondary", children: "Cancel" }), _jsx("button", { form: "inv-form", type: "submit", className: "btn-primary", disabled: creating, children: creating ? 'Creating…' : 'Create' })] }), children: _jsxs("form", { id: "inv-form", onSubmit: handleCreate, className: "space-y-4", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Matter *" }), _jsxs("select", { className: "select", required: true, value: form.matterId, onChange: e => setForm(f => ({ ...f, matterId: e.target.value })), children: [_jsx("option", { value: "", children: "Select matter\u2026" }), matters.map(m => _jsxs("option", { value: m.id, children: [m.matterNo, " \u2014 ", m.client.name] }, m.id))] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Amount (\u20A6) *" }), _jsx("input", { type: "number", className: "input", required: true, value: form.amount, onChange: e => setForm(f => ({ ...f, amount: e.target.value })) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Due Date" }), _jsx("input", { type: "date", className: "input", value: form.dueDate, onChange: e => setForm(f => ({ ...f, dueDate: e.target.value })) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Notes" }), _jsx("textarea", { className: "input resize-none", rows: 2, value: form.notes, onChange: e => setForm(f => ({ ...f, notes: e.target.value })) })] }), form.amount && (_jsxs("div", { className: "bg-slate-700/40 rounded-lg p-3 space-y-1 text-sm", children: [_jsxs("div", { className: "flex justify-between text-slate-400", children: [_jsx("span", { children: "Amount" }), _jsx("span", { className: "font-mono", children: fmt.naira(Number(form.amount)) })] }), _jsxs("div", { className: "flex justify-between text-slate-400", children: [_jsx("span", { children: "VAT (7.5%)" }), _jsx("span", { className: "font-mono", children: fmt.naira(Number(form.amount) * 0.075) })] }), _jsxs("div", { className: "flex justify-between text-slate-200 font-semibold pt-1 border-t border-slate-600", children: [_jsx("span", { children: "Total" }), _jsx("span", { className: "font-mono text-emerald-400", children: fmt.naira(Number(form.amount) * 1.075) })] })] }))] }) }), _jsx(ConfirmModal, { open: !!payId, title: "Mark as Paid", message: "Confirm this invoice has been paid in full?", onConfirm: handleMarkPaid, onClose: () => setPayId(null), confirmLabel: "Confirm Payment", loading: paying })] }));
};
export default BillingPage;
