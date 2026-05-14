import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState, useCallback, useRef } from 'react';
import { Plus, Clock, Play, Square, Trash2 } from 'lucide-react';
import { timeEntriesService, mattersService } from '../services/api';
import { fmt } from '../utils/helpers';
import { PageLoader, Modal, ConfirmModal, toast } from '../components/ui';
import { useAuth } from '../context/AuthContext';
const TimePage = () => {
    const { user } = useAuth();
    const [entries, setEntries] = useState([]);
    const [matters, setMatters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [form, setForm] = useState({ matterId: '', description: '', hours: '', rate: '', date: new Date().toISOString().split('T')[0] });
    // Live timer
    const [timerRunning, setTimerRunning] = useState(false);
    const [timerSeconds, setTimerSeconds] = useState(0);
    const [timerMatter, setTimerMatter] = useState('');
    const [timerDesc, setTimerDesc] = useState('');
    const intervalRef = useRef(null);
    const load = useCallback(async () => {
        const [entriesRes, mattersRes] = await Promise.all([
            timeEntriesService.list(),
            mattersService.list({ limit: '100' }),
        ]);
        setEntries(entriesRes.data.data || []);
        setMatters(mattersRes.data.data || []);
    }, []);
    useEffect(() => { setLoading(true); load().finally(() => setLoading(false)); }, [load]);
    const startTimer = () => {
        if (!timerMatter) {
            toast.error('Select a matter first');
            return;
        }
        setTimerRunning(true);
        intervalRef.current = setInterval(() => setTimerSeconds(s => s + 1), 1000);
    };
    const stopTimer = async () => {
        if (intervalRef.current)
            clearInterval(intervalRef.current);
        setTimerRunning(false);
        const hours = timerSeconds / 3600;
        if (hours < 0.05) {
            toast.info('Timer stopped (< 3 min)');
            setTimerSeconds(0);
            return;
        }
        try {
            await timeEntriesService.create({ matterId: timerMatter, description: timerDesc || 'Time recorded via timer', hours: parseFloat(hours.toFixed(2)) });
            toast.success(`${fmt.hours(hours)} logged`);
            setTimerSeconds(0);
            setTimerDesc('');
            await load();
        }
        catch {
            toast.error('Failed to save timer');
        }
    };
    useEffect(() => () => { if (intervalRef.current)
        clearInterval(intervalRef.current); }, []);
    const formatTimer = (s) => {
        const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await timeEntriesService.create({ ...form, hours: Number(form.hours), rate: form.rate ? Number(form.rate) : undefined });
            setShowModal(false);
            setForm({ matterId: '', description: '', hours: '', rate: '', date: new Date().toISOString().split('T')[0] });
            await load();
            toast.success('Time logged');
        }
        catch {
            toast.error('Failed to log time');
        }
        finally {
            setSubmitting(false);
        }
    };
    const handleDelete = async () => {
        if (!deleteId)
            return;
        try {
            await timeEntriesService.delete(deleteId);
            setEntries(prev => prev.filter(e => e.id !== deleteId));
            setDeleteId(null);
            toast.success('Entry deleted');
        }
        catch {
            toast.error('Failed to delete');
        }
    };
    const totalHours = entries.reduce((s, e) => s + e.hours, 0);
    const totalValue = entries.reduce((s, e) => s + e.hours * e.rate, 0);
    if (loading)
        return _jsx(PageLoader, {});
    return (_jsxs("div", { className: "space-y-5 animate-fade-in", children: [_jsxs("div", { className: "page-header", children: [_jsxs("div", { children: [_jsx("h1", { className: "page-title", children: "Time Recording" }), _jsxs("p", { className: "page-subtitle", children: [fmt.hours(totalHours), " recorded \u00B7 ", fmt.naira(totalValue), " total value"] })] }), _jsxs("button", { onClick: () => setShowModal(true), className: "btn-primary", children: [_jsx(Plus, { size: 16 }), " Log Time"] })] }), _jsxs("div", { className: "card p-5", children: [_jsxs("h3", { className: "font-semibold text-slate-200 text-sm mb-4 flex items-center gap-2", children: [_jsx(Clock, { size: 16, className: "text-brand-400" }), " Live Timer"] }), _jsxs("div", { className: "flex flex-wrap items-center gap-4", children: [_jsx("div", { className: `font-mono text-4xl font-bold tabular-nums ${timerRunning ? 'text-brand-400' : 'text-slate-400'}`, children: formatTimer(timerSeconds) }), _jsxs("div", { className: "flex-1 min-w-[200px] space-y-2", children: [_jsxs("select", { className: "select text-sm", value: timerMatter, onChange: e => setTimerMatter(e.target.value), disabled: timerRunning, children: [_jsx("option", { value: "", children: "Select matter\u2026" }), matters.map(m => _jsxs("option", { value: m.id, children: [m.matterNo, " \u2014 ", m.title] }, m.id))] }), _jsx("input", { className: "input text-sm", placeholder: "Description (optional)", value: timerDesc, onChange: e => setTimerDesc(e.target.value), disabled: timerRunning })] }), !timerRunning ? (_jsxs("button", { onClick: startTimer, className: "btn-primary gap-2", children: [_jsx(Play, { size: 16 }), " Start Timer"] })) : (_jsxs("button", { onClick: stopTimer, className: "btn-danger gap-2", children: [_jsx(Square, { size: 16 }), " Stop & Save"] }))] }), timerRunning && timerMatter && (_jsxs("div", { className: "mt-3 flex items-center gap-2 text-sm text-slate-400", children: [_jsx("div", { className: "w-2 h-2 rounded-full bg-red-500 animate-pulse" }), "Recording on: ", _jsx("span", { className: "text-slate-200", children: matters.find(m => m.id === timerMatter)?.matterNo }), "\u00B7 Billable value: ", _jsx("span", { className: "text-emerald-400 font-mono", children: fmt.naira((timerSeconds / 3600) * 75000) })] }))] }), _jsxs("div", { className: "card", children: [_jsxs("div", { className: "card-header", children: [_jsx("h3", { className: "font-semibold text-slate-200 text-sm", children: "All Time Entries" }), _jsxs("div", { className: "flex gap-4 text-sm", children: [_jsxs("span", { className: "text-slate-400", children: ["Total: ", _jsx("span", { className: "text-brand-400 font-mono font-semibold", children: fmt.hours(totalHours) })] }), _jsxs("span", { className: "text-slate-400", children: ["Value: ", _jsx("span", { className: "text-emerald-400 font-mono font-semibold", children: fmt.naira(totalValue) })] })] })] }), _jsx("div", { className: "table-wrapper", children: _jsxs("table", { className: "table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Description" }), _jsx("th", { children: "Matter" }), _jsx("th", { children: "Date" }), _jsx("th", { children: "Hours" }), _jsx("th", { children: "Rate" }), _jsx("th", { children: "Value" }), _jsx("th", { children: "Status" }), _jsx("th", {})] }) }), _jsxs("tbody", { children: [entries.length === 0 && _jsx("tr", { children: _jsx("td", { colSpan: 8, className: "text-center text-slate-500 py-8", children: "No time entries yet" }) }), entries.map(e => (_jsxs("tr", { children: [_jsx("td", { className: "max-w-[200px] truncate text-slate-300", children: e.description }), _jsx("td", { className: "text-xs text-slate-400", children: e.matter?.matterNo }), _jsx("td", { className: "text-slate-400 text-xs", children: fmt.date(e.date) }), _jsx("td", { className: "font-mono text-brand-400 font-semibold", children: fmt.hours(e.hours) }), _jsxs("td", { className: "font-mono text-slate-400 text-xs", children: [fmt.naira(e.rate), "/h"] }), _jsx("td", { className: "font-mono text-emerald-400 font-semibold", children: fmt.naira(e.hours * e.rate) }), _jsx("td", { children: _jsx("span", { className: e.billed ? 'badge-green' : 'badge-gray', children: e.billed ? 'Billed' : 'Unbilled' }) }), _jsx("td", { children: _jsx("button", { onClick: () => setDeleteId(e.id), className: "text-slate-600 hover:text-red-400 transition-colors", children: _jsx(Trash2, { size: 14 }) }) })] }, e.id)))] })] }) })] }), _jsx(Modal, { open: showModal, onClose: () => setShowModal(false), title: "Log Time", footer: _jsxs(_Fragment, { children: [_jsx("button", { onClick: () => setShowModal(false), className: "btn-secondary", children: "Cancel" }), _jsx("button", { form: "time-log-form", type: "submit", className: "btn-primary", disabled: submitting, children: submitting ? 'Saving…' : 'Log Time' })] }), children: _jsxs("form", { id: "time-log-form", onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Matter *" }), _jsxs("select", { className: "select", required: true, value: form.matterId, onChange: e => setForm(f => ({ ...f, matterId: e.target.value })), children: [_jsx("option", { value: "", children: "Select matter\u2026" }), matters.map(m => _jsxs("option", { value: m.id, children: [m.matterNo, " \u2014 ", m.title] }, m.id))] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Description *" }), _jsx("textarea", { className: "input resize-none", rows: 2, required: true, value: form.description, onChange: e => setForm(f => ({ ...f, description: e.target.value })), placeholder: "Work performed\u2026" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Hours *" }), _jsx("input", { type: "number", step: "0.25", min: "0.25", className: "input", required: true, value: form.hours, onChange: e => setForm(f => ({ ...f, hours: e.target.value })), placeholder: "2.5" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Rate (\u20A6/hr)" }), _jsx("input", { type: "number", className: "input", value: form.rate, onChange: e => setForm(f => ({ ...f, rate: e.target.value })), placeholder: "Default rate" })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Date" }), _jsx("input", { type: "date", className: "input", value: form.date, onChange: e => setForm(f => ({ ...f, date: e.target.value })) })] }), form.hours && _jsxs("div", { className: "bg-slate-700/40 rounded-lg p-3 text-sm flex justify-between", children: [_jsx("span", { className: "text-slate-400", children: "Estimated value" }), _jsx("span", { className: "font-mono text-emerald-400 font-semibold", children: fmt.naira(Number(form.hours) * (Number(form.rate) || 75000)) })] })] }) }), _jsx(ConfirmModal, { open: !!deleteId, title: "Delete Entry", message: "Delete this time entry? This cannot be undone.", danger: true, onConfirm: handleDelete, onClose: () => setDeleteId(null), confirmLabel: "Delete" })] }));
};
export default TimePage;
