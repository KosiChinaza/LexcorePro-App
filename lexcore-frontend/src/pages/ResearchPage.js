import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState, useCallback } from 'react';
import { BookOpen, Plus, CheckCircle, Clock, Trash2 } from 'lucide-react';
import api from '../services/api';
import { fmt } from '../utils/helpers';
import { PageLoader, EmptyState, Modal, ConfirmModal, PriorityDot, toast } from '../components/ui';
const ResearchPage = () => {
    const [tasks, setTasks] = useState([]);
    const [matters, setMatters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [creating, setCreating] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [resultId, setResultId] = useState(null);
    const [resultText, setResultText] = useState('');
    const [form, setForm] = useState({ title: '', description: '', matterId: '', priority: 'normal', dueDate: '' });
    const load = useCallback(async () => {
        const [tasksRes, mattersRes] = await Promise.all([
            api.get('/research'),
            api.get('/matters?limit=100'),
        ]);
        setTasks(tasksRes.data);
        setMatters(mattersRes.data.data || []);
    }, []);
    useEffect(() => { setLoading(true); load().finally(() => setLoading(false)); }, [load]);
    const handleCreate = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            await api.post('/research', form);
            await load();
            setShowCreate(false);
            setForm({ title: '', description: '', matterId: '', priority: 'normal', dueDate: '' });
            toast.success('Research task created');
        }
        catch {
            toast.error('Failed to create task');
        }
        finally {
            setCreating(false);
        }
    };
    const handleStatus = async (id, status) => {
        try {
            await api.put(`/research/${id}`, { status });
            await load();
            toast.success('Updated');
        }
        catch {
            toast.error('Failed to update');
        }
    };
    const handleSaveResult = async () => {
        if (!resultId)
            return;
        try {
            await api.put(`/research/${resultId}`, { result: resultText, status: 'completed' });
            await load();
            setResultId(null);
            setResultText('');
            toast.success('Result saved and task completed');
        }
        catch {
            toast.error('Failed to save');
        }
    };
    const handleDelete = async () => {
        if (!deleteId)
            return;
        try {
            await api.delete(`/research/${deleteId}`);
            setTasks(p => p.filter(t => t.id !== deleteId));
            setDeleteId(null);
            toast.success('Deleted');
        }
        catch {
            toast.error('Failed to delete');
        }
    };
    const pending = tasks.filter(t => t.status === 'pending');
    const inProgress = tasks.filter(t => t.status === 'in_progress');
    const completed = tasks.filter(t => t.status === 'completed');
    if (loading)
        return _jsx(PageLoader, {});
    const TaskCard = ({ task }) => (_jsx("div", { className: "card p-4 hover:border-slate-600 transition-colors", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(PriorityDot, { priority: task.priority }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "font-medium text-slate-200 text-sm", children: task.title }), task.matter && _jsx("p", { className: "text-xs text-slate-500 font-mono mt-0.5", children: task.matter.matterNo }), task.description && _jsx("p", { className: "text-xs text-slate-400 mt-1 leading-relaxed", children: task.description }), task.result && (_jsxs("div", { className: "mt-2 p-2 bg-emerald-900/20 border border-emerald-800/40 rounded-lg", children: [_jsx("p", { className: "text-xs text-emerald-400 font-medium mb-0.5", children: "Result" }), _jsx("p", { className: "text-xs text-slate-300", children: task.result })] })), task.dueDate && (_jsxs("p", { className: "text-xs text-slate-500 mt-1 flex items-center gap-1", children: [_jsx(Clock, { size: 11 }), " Due ", fmt.date(task.dueDate)] }))] }), _jsxs("div", { className: "flex flex-col gap-1 flex-shrink-0", children: [task.status === 'pending' && (_jsx("button", { onClick: () => handleStatus(task.id, 'in_progress'), className: "text-xs text-blue-400 hover:text-blue-300", children: "Start" })), task.status === 'in_progress' && (_jsx("button", { onClick: () => { setResultId(task.id); setResultText(task.result || ''); }, className: "text-xs text-emerald-400 hover:text-emerald-300", children: "Complete" })), _jsx("button", { onClick: () => setDeleteId(task.id), className: "text-red-500 hover:text-red-400 mt-1", children: _jsx(Trash2, { size: 13 }) })] })] }) }));
    return (_jsxs("div", { className: "space-y-5 animate-fade-in", children: [_jsxs("div", { className: "page-header", children: [_jsxs("div", { children: [_jsx("h1", { className: "page-title", children: "Research" }), _jsxs("p", { className: "page-subtitle", children: [tasks.length, " task", tasks.length !== 1 ? 's' : '', " \u00B7 ", inProgress.length, " in progress"] })] }), _jsxs("button", { onClick: () => setShowCreate(true), className: "btn-primary", children: [_jsx(Plus, { size: 16 }), " New Task"] })] }), tasks.length === 0 ? (_jsx("div", { className: "card card-body", children: _jsx(EmptyState, { icon: _jsx(BookOpen, { size: 48 }), title: "No research tasks yet", description: "Create and track legal research tasks linked to matters.", action: _jsx("button", { onClick: () => setShowCreate(true), className: "btn-primary", children: "Create First Task" }) }) })) : (_jsxs("div", { className: "grid grid-cols-1 xl:grid-cols-3 gap-5", children: [_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx("div", { className: "w-2 h-2 rounded-full bg-slate-500" }), _jsx("h3", { className: "text-sm font-semibold text-slate-300", children: "Pending" }), _jsx("span", { className: "badge-gray ml-auto", children: pending.length })] }), pending.length === 0 && _jsx("div", { className: "card p-4 text-center text-slate-600 text-sm", children: "No pending tasks" }), pending.map(t => _jsx(TaskCard, { task: t }, t.id))] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx("div", { className: "w-2 h-2 rounded-full bg-blue-500" }), _jsx("h3", { className: "text-sm font-semibold text-slate-300", children: "In Progress" }), _jsx("span", { className: "badge-blue ml-auto", children: inProgress.length })] }), inProgress.length === 0 && _jsx("div", { className: "card p-4 text-center text-slate-600 text-sm", children: "None in progress" }), inProgress.map(t => _jsx(TaskCard, { task: t }, t.id))] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx("div", { className: "w-2 h-2 rounded-full bg-emerald-500" }), _jsx("h3", { className: "text-sm font-semibold text-slate-300", children: "Completed" }), _jsx("span", { className: "badge-green ml-auto", children: completed.length })] }), completed.length === 0 && _jsx("div", { className: "card p-4 text-center text-slate-600 text-sm", children: "No completed tasks" }), completed.map(t => _jsx(TaskCard, { task: t }, t.id))] })] })), _jsx(Modal, { open: showCreate, onClose: () => setShowCreate(false), title: "New Research Task", footer: _jsxs(_Fragment, { children: [_jsx("button", { onClick: () => setShowCreate(false), className: "btn-secondary", children: "Cancel" }), _jsx("button", { form: "research-form", type: "submit", className: "btn-primary", disabled: creating, children: creating ? 'Creating…' : 'Create Task' })] }), children: _jsxs("form", { id: "research-form", onSubmit: handleCreate, className: "space-y-4", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Title *" }), _jsx("input", { className: "input", required: true, value: form.title, onChange: e => setForm(f => ({ ...f, title: e.target.value })), placeholder: "e.g. Research CITA exemption provisions" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Linked Matter" }), _jsxs("select", { className: "select", value: form.matterId, onChange: e => setForm(f => ({ ...f, matterId: e.target.value })), children: [_jsx("option", { value: "", children: "No matter linked" }), matters.map(m => _jsxs("option", { value: m.id, children: [m.matterNo, " \u2014 ", m.title] }, m.id))] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Priority" }), _jsx("select", { className: "select", value: form.priority, onChange: e => setForm(f => ({ ...f, priority: e.target.value })), children: ['low', 'normal', 'high', 'urgent'].map(p => _jsx("option", { value: p, children: p }, p)) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Due Date" }), _jsx("input", { type: "date", className: "input", value: form.dueDate, onChange: e => setForm(f => ({ ...f, dueDate: e.target.value })) })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Description" }), _jsx("textarea", { className: "input resize-none", rows: 3, value: form.description, onChange: e => setForm(f => ({ ...f, description: e.target.value })), placeholder: "What needs to be researched?" })] })] }) }), _jsx(Modal, { open: !!resultId, onClose: () => { setResultId(null); setResultText(''); }, title: "Record Research Result", footer: _jsxs(_Fragment, { children: [_jsx("button", { onClick: () => { setResultId(null); setResultText(''); }, className: "btn-secondary", children: "Cancel" }), _jsxs("button", { onClick: handleSaveResult, className: "btn-primary", children: [_jsx(CheckCircle, { size: 14 }), " Save & Complete"] })] }), children: _jsxs("div", { className: "space-y-3", children: [_jsx("p", { className: "text-slate-400 text-sm", children: "Record findings for this research task." }), _jsx("textarea", { className: "input resize-none", rows: 6, value: resultText, onChange: e => setResultText(e.target.value), placeholder: "Summarise the research findings, relevant cases, statutes, or conclusions\u2026" })] }) }), _jsx(ConfirmModal, { open: !!deleteId, title: "Delete Task", message: "Delete this research task permanently?", danger: true, onConfirm: handleDelete, onClose: () => setDeleteId(null), confirmLabel: "Delete" })] }));
};
export default ResearchPage;
