import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Send, Clock, FileText, FolderOpen, AlertTriangle, Scale, Users } from 'lucide-react';
import { mattersService, timeEntriesService, invoicesService, documentsService, deadlinesService, courtDatesService } from '../services/api';
import { fmt, matterTypeColor, matterTypeLabel, statusColor } from '../utils/helpers';
import { PageLoader, Modal, Avatar, PriorityDot, toast } from '../components/ui';
const MatterDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [matter, setMatter] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('overview');
    const [updateText, setUpdateText] = useState('');
    const [postingUpdate, setPostingUpdate] = useState(false);
    // Modals
    const [showTimeModal, setShowTimeModal] = useState(false);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [showDeadlineModal, setShowDeadlineModal] = useState(false);
    const [showCourtModal, setShowCourtModal] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    // Forms
    const [timeForm, setTimeForm] = useState({ description: '', hours: '', rate: '', date: new Date().toISOString().split('T')[0] });
    const [invoiceForm, setInvoiceForm] = useState({ amount: '', dueDate: '', notes: '' });
    const [deadlineForm, setDeadlineForm] = useState({ title: '', description: '', dueDate: '', priority: 'normal' });
    const [courtForm, setCourtForm] = useState({ title: '', court: '', judge: '', dateTime: '', notes: '' });
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadCategory, setUploadCategory] = useState('');
    const load = useCallback(async () => {
        if (!id)
            return;
        const res = await mattersService.get(id);
        setMatter(res.data);
    }, [id]);
    useEffect(() => {
        setLoading(true);
        load().finally(() => setLoading(false));
    }, [load]);
    const postUpdate = async () => {
        if (!updateText.trim() || !id)
            return;
        setPostingUpdate(true);
        try {
            await mattersService.addUpdate(id, updateText);
            setUpdateText('');
            await load();
            toast.success('Update posted');
        }
        catch {
            toast.error('Failed to post update');
        }
        finally {
            setPostingUpdate(false);
        }
    };
    const logTime = async (e) => {
        e.preventDefault();
        if (!id)
            return;
        setSubmitting(true);
        try {
            await timeEntriesService.create({ matterId: id, ...timeForm, hours: Number(timeForm.hours), rate: timeForm.rate ? Number(timeForm.rate) : undefined });
            await load();
            setShowTimeModal(false);
            setTimeForm({ description: '', hours: '', rate: '', date: new Date().toISOString().split('T')[0] });
            toast.success('Time logged');
        }
        catch {
            toast.error('Failed to log time');
        }
        finally {
            setSubmitting(false);
        }
    };
    const createInvoice = async (e) => {
        e.preventDefault();
        if (!id)
            return;
        setSubmitting(true);
        try {
            await invoicesService.create({ matterId: id, ...invoiceForm, amount: Number(invoiceForm.amount) });
            await load();
            setShowInvoiceModal(false);
            setInvoiceForm({ amount: '', dueDate: '', notes: '' });
            toast.success('Invoice created');
        }
        catch {
            toast.error('Failed to create invoice');
        }
        finally {
            setSubmitting(false);
        }
    };
    const createDeadline = async (e) => {
        e.preventDefault();
        if (!id)
            return;
        setSubmitting(true);
        try {
            await deadlinesService.create({ matterId: id, ...deadlineForm });
            await load();
            setShowDeadlineModal(false);
            setDeadlineForm({ title: '', description: '', dueDate: '', priority: 'normal' });
            toast.success('Deadline added');
        }
        catch {
            toast.error('Failed to add deadline');
        }
        finally {
            setSubmitting(false);
        }
    };
    const createCourtDate = async (e) => {
        e.preventDefault();
        if (!id)
            return;
        setSubmitting(true);
        try {
            await courtDatesService.create({ matterId: id, ...courtForm });
            await load();
            setShowCourtModal(false);
            setCourtForm({ title: '', court: '', judge: '', dateTime: '', notes: '' });
            toast.success('Court date added');
        }
        catch {
            toast.error('Failed to add court date');
        }
        finally {
            setSubmitting(false);
        }
    };
    const uploadDoc = async (e) => {
        e.preventDefault();
        if (!uploadFile)
            return;
        setSubmitting(true);
        try {
            const fd = new FormData();
            fd.append('file', uploadFile);
            fd.append('matterId', id);
            fd.append('category', uploadCategory);
            await documentsService.upload(fd);
            await load();
            setShowUploadModal(false);
            setUploadFile(null);
            toast.success('Document uploaded');
        }
        catch {
            toast.error('Upload failed');
        }
        finally {
            setSubmitting(false);
        }
    };
    if (loading)
        return _jsx(PageLoader, {});
    if (!matter)
        return _jsx("div", { className: "text-slate-400 text-center py-20", children: "Matter not found" });
    const tabs = [
        { key: 'overview', label: 'Overview', icon: _jsx(Users, { size: 14 }) },
        { key: 'time', label: 'Time', icon: _jsx(Clock, { size: 14 }), count: matter._count?.timeEntries },
        { key: 'billing', label: 'Billing', icon: _jsx(FileText, { size: 14 }), count: matter._count?.invoices },
        { key: 'documents', label: 'Documents', icon: _jsx(FolderOpen, { size: 14 }), count: matter._count?.documents },
        { key: 'deadlines', label: 'Deadlines', icon: _jsx(AlertTriangle, { size: 14 }), count: matter._count?.deadlines },
        { key: 'court', label: 'Court Dates', icon: _jsx(Scale, { size: 14 }), count: matter._count?.courtDates },
    ];
    return (_jsxs("div", { className: "space-y-5 animate-fade-in", children: [_jsxs("div", { children: [_jsxs("button", { onClick: () => navigate('/matters'), className: "btn-ghost btn-sm mb-3 -ml-1", children: [_jsx(ArrowLeft, { size: 14 }), " Matters"] }), _jsxs("div", { className: "flex items-start justify-between gap-4", children: [_jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center gap-3 flex-wrap", children: [_jsx("span", { className: "text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded", children: matter.matterNo }), _jsx("span", { className: matterTypeColor[matter.type], children: matterTypeLabel[matter.type] }), _jsx("span", { className: statusColor[matter.status], children: matter.status.replace('_', ' ') }), _jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx(PriorityDot, { priority: matter.priority }), _jsx("span", { className: "text-xs text-slate-400 capitalize", children: matter.priority })] })] }), _jsx("h1", { className: "text-xl font-bold text-slate-100 mt-2 leading-tight", children: matter.title }), _jsxs("p", { className: "text-slate-400 text-sm mt-0.5", children: ["Client: ", _jsx("span", { className: "text-slate-300", children: matter.client.name }), " \u00B7 Opened ", fmt.date(matter.openDate)] })] }), _jsxs("div", { className: "flex gap-2 flex-shrink-0", children: [_jsxs("button", { onClick: () => setShowTimeModal(true), className: "btn-secondary btn-sm", children: [_jsx(Clock, { size: 14 }), " Log Time"] }), _jsxs("button", { onClick: () => setShowInvoiceModal(true), className: "btn-primary btn-sm", children: [_jsx(Plus, { size: 14 }), " Invoice"] })] })] })] }), _jsx("div", { className: "border-b border-slate-700 flex gap-0 overflow-x-auto", children: tabs.map(t => (_jsxs("button", { onClick: () => setTab(t.key), className: `tab ${tab === t.key ? 'tab-active' : 'tab-inactive'} flex items-center gap-1.5`, children: [t.icon, " ", t.label, t.count !== undefined && _jsx("span", { className: "ml-1 bg-slate-700 text-slate-400 text-[10px] rounded-full px-1.5 py-0.5 leading-none", children: t.count })] }, t.key))) }), tab === 'overview' && (_jsxs("div", { className: "grid grid-cols-1 xl:grid-cols-3 gap-5", children: [_jsxs("div", { className: "xl:col-span-2 space-y-5", children: [matter.description && (_jsxs("div", { className: "card card-body", children: [_jsx("h3", { className: "text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2", children: "Description" }), _jsx("p", { className: "text-slate-300 text-sm leading-relaxed", children: matter.description })] })), _jsxs("div", { className: "card", children: [_jsx("div", { className: "card-header", children: _jsx("h3", { className: "font-semibold text-slate-200 text-sm", children: "Matter Journal" }) }), _jsxs("div", { className: "p-4 space-y-3 max-h-80 overflow-y-auto", children: [(!matter.updates || matter.updates.length === 0) && _jsx("p", { className: "text-slate-500 text-sm text-center py-4", children: "No updates yet" }), matter.updates?.map(u => (_jsxs("div", { className: "flex gap-3", children: [_jsx(Avatar, { name: u.author, size: "sm", className: "flex-shrink-0 mt-0.5" }), _jsxs("div", { className: "flex-1 bg-slate-700/30 rounded-lg p-3", children: [_jsxs("div", { className: "flex items-center justify-between mb-1", children: [_jsx("span", { className: "text-xs font-medium text-slate-300", children: u.author }), _jsx("span", { className: "text-xs text-slate-500", children: fmt.relative(u.createdAt) })] }), _jsx("p", { className: "text-sm text-slate-300 leading-relaxed", children: u.content })] })] }, u.id)))] }), _jsx("div", { className: "p-4 border-t border-slate-700", children: _jsxs("div", { className: "flex gap-2", children: [_jsx("textarea", { className: "input flex-1 text-sm resize-none", rows: 2, placeholder: "Add a journal entry\u2026", value: updateText, onChange: e => setUpdateText(e.target.value) }), _jsx("button", { onClick: postUpdate, disabled: !updateText.trim() || postingUpdate, className: "btn-primary self-end", children: _jsx(Send, { size: 14 }) })] }) })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "card card-body", children: [_jsx("h3", { className: "text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3", children: "Client" }), _jsx("p", { className: "text-slate-200 font-medium", children: matter.client.name }), matter.client.email && _jsx("p", { className: "text-slate-400 text-sm mt-1", children: matter.client.email }), matter.client.phone && _jsx("p", { className: "text-slate-400 text-sm", children: matter.client.phone })] }), _jsxs("div", { className: "card card-body", children: [_jsx("h3", { className: "text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3", children: "Team" }), _jsx("div", { className: "space-y-2", children: matter.team.map(t => (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Avatar, { name: t.user.name, size: "sm" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-slate-200", children: t.user.name }), _jsxs("p", { className: "text-xs text-slate-500 capitalize", children: [t.role, " \u00B7 ", t.user.position] })] })] }, t.id))) })] }), _jsxs("div", { className: "card card-body space-y-2", children: [_jsx("h3", { className: "text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1", children: "Summary" }), [
                                        ['Time Entries', matter._count?.timeEntries],
                                        ['Documents', matter._count?.documents],
                                        ['Invoices', matter._count?.invoices],
                                        ['Deadlines', matter._count?.deadlines],
                                        ['Court Dates', matter._count?.courtDates],
                                    ].map(([label, val]) => (_jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsx("span", { className: "text-slate-400", children: label }), _jsx("span", { className: "font-medium text-slate-200", children: val ?? 0 })] }, String(label))))] })] })] })), tab === 'time' && (_jsxs("div", { className: "card", children: [_jsxs("div", { className: "card-header", children: [_jsx("h3", { className: "font-semibold text-slate-200 text-sm", children: "Time Entries" }), _jsxs("button", { onClick: () => setShowTimeModal(true), className: "btn-primary btn-sm", children: [_jsx(Plus, { size: 14 }), " Log Time"] })] }), _jsx("div", { className: "table-wrapper", children: _jsxs("table", { className: "table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Description" }), _jsx("th", { children: "Fee Earner" }), _jsx("th", { children: "Date" }), _jsx("th", { children: "Hours" }), _jsx("th", { children: "Rate" }), _jsx("th", { children: "Value" }), _jsx("th", { children: "Billed" })] }) }), _jsxs("tbody", { children: [(!matter.timeEntries || matter.timeEntries.length === 0) && _jsx("tr", { children: _jsx("td", { colSpan: 7, className: "text-center text-slate-500 py-8", children: "No time entries yet" }) }), matter.timeEntries?.map(e => (_jsxs("tr", { children: [_jsx("td", { className: "max-w-[200px] truncate", children: e.description }), _jsx("td", { children: e.user?.name }), _jsx("td", { className: "text-slate-400 text-xs", children: fmt.date(e.date) }), _jsx("td", { className: "font-mono text-brand-400", children: fmt.hours(e.hours) }), _jsxs("td", { className: "font-mono text-slate-400", children: [fmt.naira(e.rate), "/h"] }), _jsx("td", { className: "font-mono text-emerald-400 font-semibold", children: fmt.naira(e.hours * e.rate) }), _jsx("td", { children: _jsx("span", { className: e.billed ? 'badge-green' : 'badge-gray', children: e.billed ? 'Billed' : 'Unbilled' }) })] }, e.id)))] })] }) }), matter.timeEntries && matter.timeEntries.length > 0 && (_jsxs("div", { className: "px-4 py-3 border-t border-slate-700 flex justify-end gap-8", children: [_jsxs("div", { className: "text-sm", children: [_jsx("span", { className: "text-slate-400", children: "Total hours: " }), _jsx("span", { className: "font-mono text-brand-400 font-semibold", children: fmt.hours(matter.timeEntries.reduce((s, e) => s + e.hours, 0)) })] }), _jsxs("div", { className: "text-sm", children: [_jsx("span", { className: "text-slate-400", children: "Total value: " }), _jsx("span", { className: "font-mono text-emerald-400 font-semibold", children: fmt.naira(matter.timeEntries.reduce((s, e) => s + e.hours * e.rate, 0)) })] })] }))] })), tab === 'billing' && (_jsxs("div", { className: "card", children: [_jsxs("div", { className: "card-header", children: [_jsx("h3", { className: "font-semibold text-slate-200 text-sm", children: "Invoices" }), _jsxs("button", { onClick: () => setShowInvoiceModal(true), className: "btn-primary btn-sm", children: [_jsx(Plus, { size: 14 }), " Create Invoice"] })] }), _jsx("div", { className: "table-wrapper", children: _jsxs("table", { className: "table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Invoice No" }), _jsx("th", { children: "Amount" }), _jsx("th", { children: "VAT" }), _jsx("th", { children: "Total" }), _jsx("th", { children: "Status" }), _jsx("th", { children: "Due Date" })] }) }), _jsxs("tbody", { children: [(!matter.invoices || matter.invoices.length === 0) && _jsx("tr", { children: _jsx("td", { colSpan: 6, className: "text-center text-slate-500 py-8", children: "No invoices yet" }) }), matter.invoices?.map(inv => (_jsxs("tr", { children: [_jsx("td", { className: "font-mono text-slate-200", children: inv.invoiceNo }), _jsx("td", { className: "font-mono", children: fmt.naira(inv.amount) }), _jsx("td", { className: "font-mono text-slate-400", children: fmt.naira(inv.vat) }), _jsx("td", { className: "font-mono font-semibold text-emerald-400", children: fmt.naira(inv.total) }), _jsx("td", { children: _jsx("span", { className: statusColor[inv.status], children: inv.status }) }), _jsx("td", { className: "text-slate-400 text-xs", children: inv.dueDate ? fmt.date(inv.dueDate) : '—' })] }, inv.id)))] })] }) })] })), tab === 'documents' && (_jsxs("div", { className: "card", children: [_jsxs("div", { className: "card-header", children: [_jsx("h3", { className: "font-semibold text-slate-200 text-sm", children: "Documents" }), _jsxs("button", { onClick: () => setShowUploadModal(true), className: "btn-primary btn-sm", children: [_jsx(Plus, { size: 14 }), " Upload"] })] }), _jsxs("div", { className: "p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3", children: [(!matter.documents || matter.documents.length === 0) && _jsx("div", { className: "col-span-full text-center text-slate-500 py-8", children: "No documents uploaded" }), matter.documents?.map(doc => (_jsxs("a", { href: `/api/documents/${doc.id}/download`, target: "_blank", rel: "noreferrer", className: "flex items-center gap-3 p-3 bg-slate-700/40 rounded-lg border border-slate-700 hover:border-brand-500/50 transition-colors group", children: [_jsx("div", { className: "text-2xl flex-shrink-0", children: doc.mimetype.includes('pdf') ? '📄' : doc.mimetype.includes('image') ? '🖼️' : '📝' }), _jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "text-sm text-slate-200 truncate group-hover:text-brand-400", children: doc.name }), _jsxs("p", { className: "text-xs text-slate-500", children: [fmt.fileSize(doc.size), " \u00B7 ", fmt.date(doc.createdAt)] })] })] }, doc.id)))] })] })), tab === 'deadlines' && (_jsxs("div", { className: "card", children: [_jsxs("div", { className: "card-header", children: [_jsx("h3", { className: "font-semibold text-slate-200 text-sm", children: "Deadlines" }), _jsxs("button", { onClick: () => setShowDeadlineModal(true), className: "btn-primary btn-sm", children: [_jsx(Plus, { size: 14 }), " Add Deadline"] })] }), _jsxs("div", { className: "divide-y divide-slate-700/50", children: [(!matter.deadlines || matter.deadlines.length === 0) && _jsx("div", { className: "text-center text-slate-500 py-8", children: "No deadlines set" }), matter.deadlines?.map(d => {
                                const over = new Date(d.dueDate) < new Date();
                                return (_jsxs("div", { className: "px-5 py-4 flex items-center gap-4", children: [_jsx("div", { className: `w-2 h-2 rounded-full flex-shrink-0 ${over ? 'bg-red-500' : d.priority === 'urgent' ? 'bg-red-500' : d.priority === 'high' ? 'bg-orange-500' : 'bg-blue-500'}` }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-slate-200 font-medium text-sm", children: d.title }), d.description && _jsx("p", { className: "text-slate-500 text-xs mt-0.5 truncate", children: d.description })] }), _jsxs("div", { className: "text-right flex-shrink-0", children: [_jsx("p", { className: `text-sm font-medium ${over ? 'text-red-400' : 'text-slate-300'}`, children: fmt.date(d.dueDate) }), _jsx("span", { className: statusColor[d.status], children: d.status })] })] }, d.id));
                            })] })] })), tab === 'court' && (_jsxs("div", { className: "card", children: [_jsxs("div", { className: "card-header", children: [_jsx("h3", { className: "font-semibold text-slate-200 text-sm", children: "Court Dates" }), _jsxs("button", { onClick: () => setShowCourtModal(true), className: "btn-primary btn-sm", children: [_jsx(Plus, { size: 14 }), " Add Court Date"] })] }), _jsxs("div", { className: "divide-y divide-slate-700/50", children: [(!matter.courtDates || matter.courtDates.length === 0) && _jsx("div", { className: "text-center text-slate-500 py-8", children: "No court dates" }), matter.courtDates?.map(c => (_jsxs("div", { className: "px-5 py-4 flex items-start gap-4", children: [_jsxs("div", { className: "bg-blue-900/40 rounded-xl p-2.5 text-center min-w-[52px] flex-shrink-0", children: [_jsx("p", { className: "text-sm font-bold text-blue-400", children: fmt.date(c.dateTime).split(' ')[0] }), _jsx("p", { className: "text-xs text-slate-400", children: fmt.date(c.dateTime).split(' ')[1] }), _jsx("p", { className: "text-xs text-slate-500", children: fmt.time(c.dateTime) })] }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-slate-200 font-medium", children: c.title }), c.court && _jsx("p", { className: "text-slate-400 text-sm mt-0.5", children: c.court }), c.judge && _jsxs("p", { className: "text-slate-500 text-xs", children: ["Before: ", c.judge] }), c.notes && _jsx("p", { className: "text-slate-500 text-xs mt-1 italic", children: c.notes })] }), _jsx("span", { className: statusColor[c.status], children: c.status })] }, c.id)))] })] })), _jsx(Modal, { open: showTimeModal, onClose: () => setShowTimeModal(false), title: "Log Time", footer: _jsxs(_Fragment, { children: [_jsx("button", { onClick: () => setShowTimeModal(false), className: "btn-secondary", children: "Cancel" }), _jsx("button", { form: "time-form", type: "submit", className: "btn-primary", disabled: submitting, children: submitting ? 'Saving…' : 'Log Time' })] }), children: _jsxs("form", { id: "time-form", onSubmit: logTime, className: "space-y-4", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Description *" }), _jsx("textarea", { className: "input resize-none", rows: 2, required: true, value: timeForm.description, onChange: e => setTimeForm(f => ({ ...f, description: e.target.value })), placeholder: "Work performed\u2026" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Hours *" }), _jsx("input", { type: "number", step: "0.25", min: "0.25", className: "input", required: true, value: timeForm.hours, onChange: e => setTimeForm(f => ({ ...f, hours: e.target.value })), placeholder: "2.5" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Rate (\u20A6/hr)" }), _jsx("input", { type: "number", className: "input", value: timeForm.rate, onChange: e => setTimeForm(f => ({ ...f, rate: e.target.value })), placeholder: "75,000" })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Date" }), _jsx("input", { type: "date", className: "input", value: timeForm.date, onChange: e => setTimeForm(f => ({ ...f, date: e.target.value })) })] })] }) }), _jsx(Modal, { open: showInvoiceModal, onClose: () => setShowInvoiceModal(false), title: "Create Invoice", footer: _jsxs(_Fragment, { children: [_jsx("button", { onClick: () => setShowInvoiceModal(false), className: "btn-secondary", children: "Cancel" }), _jsx("button", { form: "invoice-form", type: "submit", className: "btn-primary", disabled: submitting, children: submitting ? 'Creating…' : 'Create Invoice' })] }), children: _jsxs("form", { id: "invoice-form", onSubmit: createInvoice, className: "space-y-4", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Amount (\u20A6) *" }), _jsx("input", { type: "number", className: "input", required: true, value: invoiceForm.amount, onChange: e => setInvoiceForm(f => ({ ...f, amount: e.target.value })), placeholder: "500,000" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Due Date" }), _jsx("input", { type: "date", className: "input", value: invoiceForm.dueDate, onChange: e => setInvoiceForm(f => ({ ...f, dueDate: e.target.value })) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Notes" }), _jsx("textarea", { className: "input resize-none", rows: 2, value: invoiceForm.notes, onChange: e => setInvoiceForm(f => ({ ...f, notes: e.target.value })) })] }), _jsxs("div", { className: "bg-slate-700/40 rounded-lg p-3 text-sm", children: [_jsxs("div", { className: "flex justify-between text-slate-400", children: [_jsx("span", { children: "Amount" }), _jsx("span", { className: "font-mono", children: fmt.naira(Number(invoiceForm.amount) || 0) })] }), _jsxs("div", { className: "flex justify-between text-slate-400 mt-1", children: [_jsx("span", { children: "VAT (7.5%)" }), _jsx("span", { className: "font-mono", children: fmt.naira((Number(invoiceForm.amount) || 0) * 0.075) })] }), _jsxs("div", { className: "flex justify-between text-slate-200 font-semibold mt-2 pt-2 border-t border-slate-600", children: [_jsx("span", { children: "Total" }), _jsx("span", { className: "font-mono text-emerald-400", children: fmt.naira((Number(invoiceForm.amount) || 0) * 1.075) })] })] })] }) }), _jsx(Modal, { open: showDeadlineModal, onClose: () => setShowDeadlineModal(false), title: "Add Deadline", footer: _jsxs(_Fragment, { children: [_jsx("button", { onClick: () => setShowDeadlineModal(false), className: "btn-secondary", children: "Cancel" }), _jsx("button", { form: "deadline-form", type: "submit", className: "btn-primary", disabled: submitting, children: submitting ? 'Saving…' : 'Add Deadline' })] }), children: _jsxs("form", { id: "deadline-form", onSubmit: createDeadline, className: "space-y-4", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Title *" }), _jsx("input", { className: "input", required: true, value: deadlineForm.title, onChange: e => setDeadlineForm(f => ({ ...f, title: e.target.value })) })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Due Date *" }), _jsx("input", { type: "date", className: "input", required: true, value: deadlineForm.dueDate, onChange: e => setDeadlineForm(f => ({ ...f, dueDate: e.target.value })) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Priority" }), _jsxs("select", { className: "select", value: deadlineForm.priority, onChange: e => setDeadlineForm(f => ({ ...f, priority: e.target.value })), children: [_jsx("option", { value: "low", children: "Low" }), _jsx("option", { value: "normal", children: "Normal" }), _jsx("option", { value: "high", children: "High" }), _jsx("option", { value: "urgent", children: "Urgent" })] })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Notes" }), _jsx("textarea", { className: "input resize-none", rows: 2, value: deadlineForm.description, onChange: e => setDeadlineForm(f => ({ ...f, description: e.target.value })) })] })] }) }), _jsx(Modal, { open: showCourtModal, onClose: () => setShowCourtModal(false), title: "Add Court Date", footer: _jsxs(_Fragment, { children: [_jsx("button", { onClick: () => setShowCourtModal(false), className: "btn-secondary", children: "Cancel" }), _jsx("button", { form: "court-form", type: "submit", className: "btn-primary", disabled: submitting, children: submitting ? 'Saving…' : 'Add Court Date' })] }), children: _jsxs("form", { id: "court-form", onSubmit: createCourtDate, className: "space-y-4", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Title *" }), _jsx("input", { className: "input", required: true, value: courtForm.title, onChange: e => setCourtForm(f => ({ ...f, title: e.target.value })), placeholder: "e.g. Pre-trial conference" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Date & Time *" }), _jsx("input", { type: "datetime-local", className: "input", required: true, value: courtForm.dateTime, onChange: e => setCourtForm(f => ({ ...f, dateTime: e.target.value })) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Court" }), _jsx("input", { className: "input", value: courtForm.court, onChange: e => setCourtForm(f => ({ ...f, court: e.target.value })), placeholder: "e.g. Tax Appeal Tribunal, Lagos" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Judge / Tribunal" }), _jsx("input", { className: "input", value: courtForm.judge, onChange: e => setCourtForm(f => ({ ...f, judge: e.target.value })), placeholder: "Hon. Justice \u2026" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Notes" }), _jsx("textarea", { className: "input resize-none", rows: 2, value: courtForm.notes, onChange: e => setCourtForm(f => ({ ...f, notes: e.target.value })) })] })] }) }), _jsx(Modal, { open: showUploadModal, onClose: () => setShowUploadModal(false), title: "Upload Document", footer: _jsxs(_Fragment, { children: [_jsx("button", { onClick: () => setShowUploadModal(false), className: "btn-secondary", children: "Cancel" }), _jsx("button", { form: "upload-form", type: "submit", className: "btn-primary", disabled: submitting || !uploadFile, children: submitting ? 'Uploading…' : 'Upload' })] }), children: _jsxs("form", { id: "upload-form", onSubmit: uploadDoc, className: "space-y-4", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "File *" }), _jsx("input", { type: "file", className: "input", onChange: e => setUploadFile(e.target.files?.[0] || null), accept: ".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Category" }), _jsxs("select", { className: "select", value: uploadCategory, onChange: e => setUploadCategory(e.target.value), children: [_jsx("option", { value: "", children: "Select category\u2026" }), ['contract', 'court_filing', 'correspondence', 'evidence', 'other'].map(c => _jsx("option", { value: c, children: c.replace('_', ' ') }, c))] })] })] }) })] }));
};
export default MatterDetailPage;
