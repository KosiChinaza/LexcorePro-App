import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Scale, AlertTriangle, Plus } from 'lucide-react';
import { courtDatesService, deadlinesService, mattersService } from '../services/api';
import { CourtDate, Deadline, Matter } from '../types';
import { fmt, statusColor } from '../utils/helpers';
import { PageLoader, Modal, toast } from '../components/ui';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday } from 'date-fns';

const CalendarPage: React.FC = () => {
  const [courtDates, setCourtDates] = useState<CourtDate[]>([]);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [matters, setMatters] = useState<Matter[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
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

  const eventsOnDay = (day: Date) => {
    const courts = courtDates.filter(c => isSameDay(new Date(c.dateTime), day));
    const deads = deadlines.filter(d => isSameDay(new Date(d.dueDate), day));
    return { courts, deads };
  };

  const selectedEvents = selectedDay ? eventsOnDay(selectedDay) : null;

  const handleCreateCourtDate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await courtDatesService.create(courtForm as Record<string, unknown>);
      const res = await courtDatesService.list();
      setCourtDates(res.data);
      setShowCourtModal(false);
      setCourtForm({ matterId: '', title: '', court: '', judge: '', dateTime: '', notes: '' });
      toast.success('Court date added');
    } catch { toast.error('Failed to add court date'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="page-header">
        <div><h1 className="page-title">Calendar</h1><p className="page-subtitle">Court dates & deadlines</p></div>
        <button onClick={() => setShowCourtModal(true)} className="btn-primary"><Plus size={16} /> Add Court Date</button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Calendar */}
        <div className="xl:col-span-2 card">
          <div className="card-header">
            <div className="flex items-center gap-3">
              <button onClick={() => setCurrentMonth(m => subMonths(m, 1))} className="btn-ghost btn-sm p-1.5"><ChevronLeft size={16} /></button>
              <h3 className="font-semibold text-slate-200">{format(currentMonth, 'MMMM yyyy')}</h3>
              <button onClick={() => setCurrentMonth(m => addMonths(m, 1))} className="btn-ghost btn-sm p-1.5"><ChevronRight size={16} /></button>
            </div>
            <button onClick={() => setCurrentMonth(new Date())} className="btn-secondary btn-sm">Today</button>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-7 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="text-center text-xs text-slate-500 font-medium py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array(firstDayOfWeek).fill(null).map((_, i) => <div key={`empty-${i}`} />)}
              {days.map(day => {
                const { courts, deads } = eventsOnDay(day);
                const hasEvents = courts.length > 0 || deads.length > 0;
                const selected = selectedDay && isSameDay(day, selectedDay);
                const today = isToday(day);
                return (
                  <button key={day.toISOString()} onClick={() => setSelectedDay(day)}
                    className={`relative p-1.5 rounded-lg text-sm transition-colors min-h-[52px] text-left
                      ${selected ? 'bg-brand-500/20 border border-brand-500/50' : 'hover:bg-slate-700/50'}
                      ${today ? 'ring-1 ring-brand-500' : ''}`}>
                    <span className={`text-xs font-medium ${today ? 'text-brand-400' : selected ? 'text-slate-100' : 'text-slate-400'}`}>
                      {format(day, 'd')}
                    </span>
                    <div className="flex flex-wrap gap-0.5 mt-1">
                      {courts.slice(0, 2).map(c => <div key={c.id} className="w-1.5 h-1.5 rounded-full bg-blue-500" />)}
                      {deads.slice(0, 2).map(d => <div key={d.id} className="w-1.5 h-1.5 rounded-full bg-red-500" />)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="px-4 pb-3 flex gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-400"><div className="w-2 h-2 rounded-full bg-blue-500" /> Court Date</div>
            <div className="flex items-center gap-2 text-xs text-slate-400"><div className="w-2 h-2 rounded-full bg-red-500" /> Deadline</div>
          </div>
        </div>

        {/* Event detail */}
        <div className="space-y-4">
          {selectedDay ? (
            <div className="card">
              <div className="card-header">
                <h3 className="font-semibold text-slate-200 text-sm">{format(selectedDay, 'EEEE, dd MMMM yyyy')}</h3>
              </div>
              <div className="p-4 space-y-3">
                {(!selectedEvents?.courts.length && !selectedEvents?.deads.length) && (
                  <p className="text-slate-500 text-sm text-center py-4">No events this day</p>
                )}
                {selectedEvents?.courts.map(c => (
                  <div key={c.id} className="p-3 bg-blue-900/20 border border-blue-800/40 rounded-lg">
                    <div className="flex items-center gap-2 mb-1"><Scale size={14} className="text-blue-400" /><span className="badge-blue">Court</span></div>
                    <p className="text-slate-200 font-medium text-sm">{c.title}</p>
                    {c.court && <p className="text-slate-400 text-xs mt-0.5">{c.court}</p>}
                    {c.judge && <p className="text-slate-500 text-xs">{c.judge}</p>}
                    <p className="text-slate-400 text-xs mt-1">{fmt.time(c.dateTime)}</p>
                  </div>
                ))}
                {selectedEvents?.deads.map(d => (
                  <div key={d.id} className="p-3 bg-red-900/20 border border-red-800/40 rounded-lg">
                    <div className="flex items-center gap-2 mb-1"><AlertTriangle size={14} className="text-red-400" /><span className="badge-red">Deadline</span></div>
                    <p className="text-slate-200 font-medium text-sm">{d.title}</p>
                    <p className="text-slate-400 text-xs mt-0.5">{d.matter?.matterNo}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card card-body text-center text-slate-500 text-sm py-8">
              <Calendar size={32} className="mx-auto mb-2 opacity-30" />
              Click a day to see events
            </div>
          )}

          {/* Upcoming */}
          <div className="card">
            <div className="card-header"><h3 className="font-semibold text-slate-200 text-sm">Upcoming Court Dates</h3></div>
            <div className="divide-y divide-slate-700/50">
              {courtDates.filter(c => new Date(c.dateTime) >= new Date()).slice(0, 5).map(c => (
                <div key={c.id} className="px-4 py-3">
                  <p className="text-slate-200 text-sm font-medium">{c.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{fmt.dateTime(c.dateTime)}</p>
                  {c.court && <p className="text-xs text-slate-500">{c.court}</p>}
                </div>
              ))}
              {courtDates.filter(c => new Date(c.dateTime) >= new Date()).length === 0 && (
                <div className="px-4 py-6 text-center text-slate-500 text-sm">No upcoming court dates</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal open={showCourtModal} onClose={() => setShowCourtModal(false)} title="Add Court Date"
        footer={<><button onClick={() => setShowCourtModal(false)} className="btn-secondary">Cancel</button><button form="court-cal-form" type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Saving…' : 'Add'}</button></>}>
        <form id="court-cal-form" onSubmit={handleCreateCourtDate} className="space-y-4">
          <div className="form-group"><label className="label">Matter *</label>
            <select className="select" required value={courtForm.matterId} onChange={e => setCourtForm(f => ({ ...f, matterId: e.target.value }))}>
              <option value="">Select matter…</option>
              {matters.map(m => <option key={m.id} value={m.id}>{m.matterNo} — {m.title}</option>)}
            </select>
          </div>
          <div className="form-group"><label className="label">Title *</label><input className="input" required value={courtForm.title} onChange={e => setCourtForm(f => ({ ...f, title: e.target.value }))} /></div>
          <div className="form-group"><label className="label">Date & Time *</label><input type="datetime-local" className="input" required value={courtForm.dateTime} onChange={e => setCourtForm(f => ({ ...f, dateTime: e.target.value }))} /></div>
          <div className="form-group"><label className="label">Court</label><input className="input" value={courtForm.court} onChange={e => setCourtForm(f => ({ ...f, court: e.target.value }))} /></div>
          <div className="form-group"><label className="label">Judge</label><input className="input" value={courtForm.judge} onChange={e => setCourtForm(f => ({ ...f, judge: e.target.value }))} /></div>
          <div className="form-group"><label className="label">Notes</label><textarea className="input resize-none" rows={2} value={courtForm.notes} onChange={e => setCourtForm(f => ({ ...f, notes: e.target.value }))} /></div>
        </form>
      </Modal>
    </div>
  );
};

export default CalendarPage;
