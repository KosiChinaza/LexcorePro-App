import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Scale, AlertTriangle, Plus } from 'lucide-react';
import { courtDatesService, deadlinesService, mattersService } from '../services/api';
import { fmt } from '../utils/helpers';
import { PageLoader, Modal, toast } from '../components/ui';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday } from 'date-fns';
const CalendarPage = () => {
    const [courtDates, setCourtDates] = useState([]);
    const [deadlines, setDeadlines] = useState([]);
    const [matters, setMatters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState(null);
    const [showCourtModal, setShowCourtModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [courtForm, setCourtForm] = useState({ matterId: '', title: '', court: '', judge: '', dateTime: '', notes: '' });
    useEffect(() => {
        setLoading(true);
        Promise.all([
            courtDatesService.list(),
            deadlinesService.list(),
            mattersService.list({ limit: '100' }),
        ]).then(([cd, dl, mat]) => {
            setCourtDates(cd.data);
            setDeadlines(dl.data);
            setMatters(mat.data.data || []);
        }).finally(() => setLoading(false));
    }, []);
    const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
    const firstDayOfWeek = startOfMonth(currentMonth).getDay();
    const eventsOnDay = (day) => {
        const courts = courtDates.filter(c => isSameDay(new Date(c.dateTime), day));
        const deads = deadlines.filter(d => isSameDay(new Date(d.dueDate), day));
        return { courts, deads };
    };
    const selectedEvents = selectedDay ? eventsOnDay(selectedDay) : null;
    const handleCreateCourtDate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await courtDatesService.create(courtForm);
            const res = await courtDatesService.list();
            setCourtDates(res.data);
            setShowCourtModal(false);
            setCourtForm({ matterId: '', title: '', court: '', judge: '', dateTime: '', notes: '' });
            toast.success('Court date added');
        }
        catch {
            toast.error('Failed to add court date');
        }
        finally {
            setSubmitting(false);
        }
    };
    if (loading)
        return _jsx(PageLoader, {});
    return (_jsxs("div", { className: "space-y-5 animate-fade-in", children: [_jsxs("div", { className: "page-header", children: [_jsxs("div", { children: [_jsx("h1", { className: "page-title", children: "Calendar" }), _jsx("p", { className: "page-subtitle", children: "Court dates & deadlines" })] }), _jsxs("button", { onClick: () => setShowCourtModal(true), className: "btn-primary", children: [_jsx(Plus, { size: 16 }), " Add Court Date"] })] }), _jsxs("div", { className: "grid grid-cols-1 xl:grid-cols-3 gap-5", children: [_jsxs("div", { className: "xl:col-span-2 card", children: [_jsxs("div", { className: "card-header", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("button", { onClick: () => setCurrentMonth(m => subMonths(m, 1)), className: "btn-ghost btn-sm p-1.5", children: _jsx(ChevronLeft, { size: 16 }) }), _jsx("h3", { className: "font-semibold text-slate-200", children: format(currentMonth, 'MMMM yyyy') }), _jsx("button", { onClick: () => setCurrentMonth(m => addMonths(m, 1)), className: "btn-ghost btn-sm p-1.5", children: _jsx(ChevronRight, { size: 16 }) })] }), _jsx("button", { onClick: () => setCurrentMonth(new Date()), className: "btn-secondary btn-sm", children: "Today" })] }), _jsxs("div", { className: "p-4", children: [_jsx("div", { className: "grid grid-cols-7 mb-2", children: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (_jsx("div", { className: "text-center text-xs text-slate-500 font-medium py-1", children: d }, d))) }), _jsxs("div", { className: "grid grid-cols-7 gap-1", children: [Array(firstDayOfWeek).fill(null).map((_, i) => _jsx("div", {}, `empty-${i}`)), days.map(day => {
                                                const { courts, deads } = eventsOnDay(day);
                                                const hasEvents = courts.length > 0 || deads.length > 0;
                                                const selected = selectedDay && isSameDay(day, selectedDay);
                                                const today = isToday(day);
                                                return (_jsxs("button", { onClick: () => setSelectedDay(day), className: `relative p-1.5 rounded-lg text-sm transition-colors min-h-[52px] text-left
                      ${selected ? 'bg-brand-500/20 border border-brand-500/50' : 'hover:bg-slate-700/50'}
                      ${today ? 'ring-1 ring-brand-500' : ''}`, children: [_jsx("span", { className: `text-xs font-medium ${today ? 'text-brand-400' : selected ? 'text-slate-100' : 'text-slate-400'}`, children: format(day, 'd') }), _jsxs("div", { className: "flex flex-wrap gap-0.5 mt-1", children: [courts.slice(0, 2).map(c => _jsx("div", { className: "w-1.5 h-1.5 rounded-full bg-blue-500" }, c.id)), deads.slice(0, 2).map(d => _jsx("div", { className: "w-1.5 h-1.5 rounded-full bg-red-500" }, d.id))] })] }, day.toISOString()));
                                            })] })] }), _jsxs("div", { className: "px-4 pb-3 flex gap-4", children: [_jsxs("div", { className: "flex items-center gap-2 text-xs text-slate-400", children: [_jsx("div", { className: "w-2 h-2 rounded-full bg-blue-500" }), " Court Date"] }), _jsxs("div", { className: "flex items-center gap-2 text-xs text-slate-400", children: [_jsx("div", { className: "w-2 h-2 rounded-full bg-red-500" }), " Deadline"] })] })] }), _jsxs("div", { className: "space-y-4", children: [selectedDay ? (_jsxs("div", { className: "card", children: [_jsx("div", { className: "card-header", children: _jsx("h3", { className: "font-semibold text-slate-200 text-sm", children: format(selectedDay, 'EEEE, dd MMMM yyyy') }) }), _jsxs("div", { className: "p-4 space-y-3", children: [(!selectedEvents?.courts.length && !selectedEvents?.deads.length) && (_jsx("p", { className: "text-slate-500 text-sm text-center py-4", children: "No events this day" })), selectedEvents?.courts.map(c => (_jsxs("div", { className: "p-3 bg-blue-900/20 border border-blue-800/40 rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx(Scale, { size: 14, className: "text-blue-400" }), _jsx("span", { className: "badge-blue", children: "Court" })] }), _jsx("p", { className: "text-slate-200 font-medium text-sm", children: c.title }), c.court && _jsx("p", { className: "text-slate-400 text-xs mt-0.5", children: c.court }), c.judge && _jsx("p", { className: "text-slate-500 text-xs", children: c.judge }), _jsx("p", { className: "text-slate-400 text-xs mt-1", children: fmt.time(c.dateTime) })] }, c.id))), selectedEvents?.deads.map(d => (_jsxs("div", { className: "p-3 bg-red-900/20 border border-red-800/40 rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx(AlertTriangle, { size: 14, className: "text-red-400" }), _jsx("span", { className: "badge-red", children: "Deadline" })] }), _jsx("p", { className: "text-slate-200 font-medium text-sm", children: d.title }), _jsx("p", { className: "text-slate-400 text-xs mt-0.5", children: d.matter?.matterNo })] }, d.id)))] })] })) : (_jsxs("div", { className: "card card-body text-center text-slate-500 text-sm py-8", children: [_jsx(Calendar, { size: 32, className: "mx-auto mb-2 opacity-30" }), "Click a day to see events"] })), _jsxs("div", { className: "card", children: [_jsx("div", { className: "card-header", children: _jsx("h3", { className: "font-semibold text-slate-200 text-sm", children: "Upcoming Court Dates" }) }), _jsxs("div", { className: "divide-y divide-slate-700/50", children: [courtDates.filter(c => new Date(c.dateTime) >= new Date()).slice(0, 5).map(c => (_jsxs("div", { className: "px-4 py-3", children: [_jsx("p", { className: "text-slate-200 text-sm font-medium", children: c.title }), _jsx("p", { className: "text-xs text-slate-400 mt-0.5", children: fmt.dateTime(c.dateTime) }), c.court && _jsx("p", { className: "text-xs text-slate-500", children: c.court })] }, c.id))), courtDates.filter(c => new Date(c.dateTime) >= new Date()).length === 0 && (_jsx("div", { className: "px-4 py-6 text-center text-slate-500 text-sm", children: "No upcoming court dates" }))] })] })] })] }), _jsx(Modal, { open: showCourtModal, onClose: () => setShowCourtModal(false), title: "Add Court Date", footer: _jsxs(_Fragment, { children: [_jsx("button", { onClick: () => setShowCourtModal(false), className: "btn-secondary", children: "Cancel" }), _jsx("button", { form: "court-cal-form", type: "submit", className: "btn-primary", disabled: submitting, children: submitting ? 'Saving…' : 'Add' })] }), children: _jsxs("form", { id: "court-cal-form", onSubmit: handleCreateCourtDate, className: "space-y-4", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Matter *" }), _jsxs("select", { className: "select", required: true, value: courtForm.matterId, onChange: e => setCourtForm(f => ({ ...f, matterId: e.target.value })), children: [_jsx("option", { value: "", children: "Select matter\u2026" }), matters.map(m => _jsxs("option", { value: m.id, children: [m.matterNo, " \u2014 ", m.title] }, m.id))] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Title *" }), _jsx("input", { className: "input", required: true, value: courtForm.title, onChange: e => setCourtForm(f => ({ ...f, title: e.target.value })) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Date & Time *" }), _jsx("input", { type: "datetime-local", className: "input", required: true, value: courtForm.dateTime, onChange: e => setCourtForm(f => ({ ...f, dateTime: e.target.value })) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Court" }), _jsx("input", { className: "input", value: courtForm.court, onChange: e => setCourtForm(f => ({ ...f, court: e.target.value })) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Judge" }), _jsx("input", { className: "input", value: courtForm.judge, onChange: e => setCourtForm(f => ({ ...f, judge: e.target.value })) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "label", children: "Notes" }), _jsx("textarea", { className: "input resize-none", rows: 2, value: courtForm.notes, onChange: e => setCourtForm(f => ({ ...f, notes: e.target.value })) })] })] }) })] }));
};
export default CalendarPage;
