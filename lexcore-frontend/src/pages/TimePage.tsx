import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Plus, Clock, Play, Square, Trash2 } from 'lucide-react';
import { timeEntriesService, mattersService } from '../services/api';
import { TimeEntry, Matter } from '../types';
import { fmt } from '../utils/helpers';
import { PageLoader, Modal, ConfirmModal, Avatar, toast } from '../components/ui';
import { useAuth } from '../context/AuthContext';

const TimePage: React.FC = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [matters, setMatters] = useState<Matter[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ matterId: '', description: '', hours: '', rate: '', date: new Date().toISOString().split('T')[0] });

  // Live timer
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerMatter, setTimerMatter] = useState('');
  const [timerDesc, setTimerDesc] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
    if (!timerMatter) { toast.error('Select a matter first'); return; }
    setTimerRunning(true);
    intervalRef.current = setInterval(() => setTimerSeconds(s => s + 1), 1000);
  };

  const stopTimer = async () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTimerRunning(false);
    const hours = timerSeconds / 3600;
    if (hours < 0.05) { toast.info('Timer stopped (< 3 min)'); setTimerSeconds(0); return; }
    try {
      await timeEntriesService.create({ matterId: timerMatter, description: timerDesc || 'Time recorded via timer', hours: parseFloat(hours.toFixed(2)) });
      toast.success(`${fmt.hours(hours)} logged`);
      setTimerSeconds(0);
      setTimerDesc('');
      await load();
    } catch { toast.error('Failed to save timer'); }
  };

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const formatTimer = (s: number) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await timeEntriesService.create({ ...form, hours: Number(form.hours), rate: form.rate ? Number(form.rate) : undefined });
      setShowModal(false);
      setForm({ matterId: '', description: '', hours: '', rate: '', date: new Date().toISOString().split('T')[0] });
      await load();
      toast.success('Time logged');
    } catch { toast.error('Failed to log time'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await timeEntriesService.delete(deleteId);
      setEntries(prev => prev.filter(e => e.id !== deleteId));
      setDeleteId(null);
      toast.success('Entry deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const totalHours = entries.reduce((s, e) => s + e.hours, 0);
  const totalValue = entries.reduce((s, e) => s + e.hours * e.rate, 0);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="page-header">
        <div><h1 className="page-title">Time Recording</h1><p className="page-subtitle">{fmt.hours(totalHours)} recorded · {fmt.naira(totalValue)} total value</p></div>
        <button onClick={() => setShowModal(true)} className="btn-primary"><Plus size={16} /> Log Time</button>
      </div>

      {/* Live Timer */}
      <div className="card p-5">
        <h3 className="font-semibold text-slate-200 text-sm mb-4 flex items-center gap-2"><Clock size={16} className="text-brand-400" /> Live Timer</h3>
        <div className="flex flex-wrap items-center gap-4">
          <div className={`font-mono text-4xl font-bold tabular-nums ${timerRunning ? 'text-brand-400' : 'text-slate-400'}`}>{formatTimer(timerSeconds)}</div>
          <div className="flex-1 min-w-[200px] space-y-2">
            <select className="select text-sm" value={timerMatter} onChange={e => setTimerMatter(e.target.value)} disabled={timerRunning}>
              <option value="">Select matter…</option>
              {matters.map(m => <option key={m.id} value={m.id}>{m.matterNo} — {m.title}</option>)}
            </select>
            <input className="input text-sm" placeholder="Description (optional)" value={timerDesc} onChange={e => setTimerDesc(e.target.value)} disabled={timerRunning} />
          </div>
          {!timerRunning ? (
            <button onClick={startTimer} className="btn-primary gap-2"><Play size={16} /> Start Timer</button>
          ) : (
            <button onClick={stopTimer} className="btn-danger gap-2"><Square size={16} /> Stop & Save</button>
          )}
        </div>
        {timerRunning && timerMatter && (
          <div className="mt-3 flex items-center gap-2 text-sm text-slate-400">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Recording on: <span className="text-slate-200">{matters.find(m => m.id === timerMatter)?.matterNo}</span>
            · Billable value: <span className="text-emerald-400 font-mono">{fmt.naira((timerSeconds / 3600) * 75000)}</span>
          </div>
        )}
      </div>

      {/* Entries Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold text-slate-200 text-sm">All Time Entries</h3>
          <div className="flex gap-4 text-sm">
            <span className="text-slate-400">Total: <span className="text-brand-400 font-mono font-semibold">{fmt.hours(totalHours)}</span></span>
            <span className="text-slate-400">Value: <span className="text-emerald-400 font-mono font-semibold">{fmt.naira(totalValue)}</span></span>
          </div>
        </div>
        <div className="table-wrapper">
          <table className="table">
            <thead><tr><th>Description</th><th>Matter</th><th>Date</th><th>Hours</th><th>Rate</th><th>Value</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {entries.length === 0 && <tr><td colSpan={8} className="text-center text-slate-500 py-8">No time entries yet</td></tr>}
              {entries.map(e => (
                <tr key={e.id}>
                  <td className="max-w-[200px] truncate text-slate-300">{e.description}</td>
                  <td className="text-xs text-slate-400">{e.matter?.matterNo}</td>
                  <td className="text-slate-400 text-xs">{fmt.date(e.date)}</td>
                  <td className="font-mono text-brand-400 font-semibold">{fmt.hours(e.hours)}</td>
                  <td className="font-mono text-slate-400 text-xs">{fmt.naira(e.rate)}/h</td>
                  <td className="font-mono text-emerald-400 font-semibold">{fmt.naira(e.hours * e.rate)}</td>
                  <td><span className={e.billed ? 'badge-green' : 'badge-gray'}>{e.billed ? 'Billed' : 'Unbilled'}</span></td>
                  <td><button onClick={() => setDeleteId(e.id)} className="text-slate-600 hover:text-red-400 transition-colors"><Trash2 size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Log Time"
        footer={<><button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button><button form="time-log-form" type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Saving…' : 'Log Time'}</button></>}>
        <form id="time-log-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group"><label className="label">Matter *</label>
            <select className="select" required value={form.matterId} onChange={e => setForm(f => ({ ...f, matterId: e.target.value }))}>
              <option value="">Select matter…</option>
              {matters.map(m => <option key={m.id} value={m.id}>{m.matterNo} — {m.title}</option>)}
            </select>
          </div>
          <div className="form-group"><label className="label">Description *</label><textarea className="input resize-none" rows={2} required value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Work performed…" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group"><label className="label">Hours *</label><input type="number" step="0.25" min="0.25" className="input" required value={form.hours} onChange={e => setForm(f => ({ ...f, hours: e.target.value }))} placeholder="2.5" /></div>
            <div className="form-group"><label className="label">Rate (₦/hr)</label><input type="number" className="input" value={form.rate} onChange={e => setForm(f => ({ ...f, rate: e.target.value }))} placeholder="Default rate" /></div>
          </div>
          <div className="form-group"><label className="label">Date</label><input type="date" className="input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></div>
          {form.hours && <div className="bg-slate-700/40 rounded-lg p-3 text-sm flex justify-between"><span className="text-slate-400">Estimated value</span><span className="font-mono text-emerald-400 font-semibold">{fmt.naira(Number(form.hours) * (Number(form.rate) || 75000))}</span></div>}
        </form>
      </Modal>

      <ConfirmModal open={!!deleteId} title="Delete Entry" message="Delete this time entry? This cannot be undone." danger
        onConfirm={handleDelete} onClose={() => setDeleteId(null)} confirmLabel="Delete" />
    </div>
  );
};

export default TimePage;
