import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, Clock, Scale } from 'lucide-react';
import { deadlinesService, courtDatesService } from '../services/api';
import { fmt, isDueSoon, isOverdue } from '../utils/helpers';
import { PageLoader, toast } from '../components/ui';
const AlertsPage = () => {
    const [deadlines, setDeadlines] = useState([]);
    const [courtDates, setCourtDates] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        setLoading(true);
        Promise.all([deadlinesService.list({ upcoming: 'true' }), courtDatesService.list({ upcoming: 'true' })])
            .then(([dl, cd]) => { setDeadlines(dl.data); setCourtDates(cd.data); })
            .finally(() => setLoading(false));
    }, []);
    const handleComplete = async (id) => {
        try {
            await deadlinesService.update(id, { status: 'completed' });
            setDeadlines(prev => prev.map(d => d.id === id ? { ...d, status: 'completed' } : d));
            toast.success('Marked as complete');
        }
        catch {
            toast.error('Failed to update');
        }
    };
    const urgent = deadlines.filter(d => d.priority === 'urgent' && d.status === 'pending');
    const dueSoon = deadlines.filter(d => isDueSoon(d.dueDate) && d.priority !== 'urgent' && d.status === 'pending');
    const overdue = deadlines.filter(d => isOverdue(d.dueDate) && d.status === 'pending');
    const upcoming = courtDates.filter(c => c.status === 'scheduled');
    if (loading)
        return _jsx(PageLoader, {});
    const AlertSection = ({ title, items, color, icon }) => {
        if (items.length === 0)
            return null;
        return (_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2 mb-3", children: [icon, _jsx("h2", { className: "font-semibold text-slate-200", children: title }), _jsx("span", { className: "badge-gray", children: items.length })] }), _jsx("div", { className: "space-y-2", children: items.map(d => (_jsxs("div", { className: `card p-4 flex items-center gap-4 border-l-4 ${color}`, children: [_jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [_jsx("p", { className: "font-medium text-slate-200", children: d.title }), _jsx("span", { className: "text-xs text-slate-500 font-mono", children: d.matter?.matterNo })] }), d.description && _jsx("p", { className: "text-slate-400 text-sm mt-0.5 truncate", children: d.description }), _jsx("p", { className: "text-xs text-slate-500 mt-1", children: d.matter?.client?.name })] }), _jsxs("div", { className: "text-right flex-shrink-0", children: [_jsx("p", { className: "font-medium text-sm text-slate-300", children: fmt.date(d.dueDate) }), _jsx("p", { className: "text-xs text-slate-500 mt-0.5", children: fmt.relative(d.dueDate) })] }), d.status === 'pending' && (_jsx("button", { onClick: () => handleComplete(d.id), className: "btn-ghost btn-sm text-emerald-400 flex-shrink-0", title: "Mark complete", children: _jsx(CheckCircle, { size: 16 }) }))] }, d.id))) })] }));
    };
    return (_jsxs("div", { className: "space-y-6 animate-fade-in", children: [_jsxs("div", { children: [_jsx("h1", { className: "page-title", children: "Alerts" }), _jsxs("p", { className: "page-subtitle", children: [deadlines.length + courtDates.length, " active alerts"] })] }), overdue.length === 0 && urgent.length === 0 && dueSoon.length === 0 && upcoming.length === 0 && (_jsxs("div", { className: "card card-body text-center py-16", children: [_jsx(CheckCircle, { size: 48, className: "text-emerald-400 mx-auto mb-4" }), _jsx("h3", { className: "text-xl font-bold text-slate-200 mb-2", children: "You're all clear!" }), _jsx("p", { className: "text-slate-400", children: "No urgent deadlines or upcoming court dates." })] })), _jsx(AlertSection, { title: "Overdue", items: overdue, color: "border-red-600", icon: _jsx(AlertTriangle, { size: 18, className: "text-red-400" }) }), _jsx(AlertSection, { title: "Urgent Deadlines", items: urgent, color: "border-orange-500", icon: _jsx(AlertTriangle, { size: 18, className: "text-orange-400" }) }), _jsx(AlertSection, { title: "Due Within 3 Days", items: dueSoon, color: "border-yellow-500", icon: _jsx(Clock, { size: 18, className: "text-yellow-400" }) }), upcoming.length > 0 && (_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2 mb-3", children: [_jsx(Scale, { size: 18, className: "text-blue-400" }), _jsx("h2", { className: "font-semibold text-slate-200", children: "Upcoming Court Dates" }), _jsx("span", { className: "badge-gray", children: upcoming.length })] }), _jsx("div", { className: "space-y-2", children: upcoming.map(c => (_jsxs("div", { className: "card p-4 flex items-center gap-4 border-l-4 border-blue-600", children: [_jsxs("div", { className: "bg-blue-900/40 rounded-xl p-2 text-center min-w-[48px] flex-shrink-0", children: [_jsx("p", { className: "text-sm font-bold text-blue-400", children: fmt.date(c.dateTime).split(' ')[0] }), _jsx("p", { className: "text-xs text-slate-400", children: fmt.date(c.dateTime).split(' ')[1] })] }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "font-medium text-slate-200", children: c.title }), c.court && _jsx("p", { className: "text-slate-400 text-sm", children: c.court }), c.judge && _jsx("p", { className: "text-slate-500 text-xs", children: c.judge })] }), _jsxs("div", { className: "text-right flex-shrink-0", children: [_jsx("p", { className: "font-medium text-sm text-slate-300", children: fmt.time(c.dateTime) }), _jsx("p", { className: "text-xs text-slate-500", children: fmt.relative(c.dateTime) })] })] }, c.id))) })] }))] }));
};
export default AlertsPage;
