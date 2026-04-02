import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Send, Clock, FileText, FolderOpen, AlertTriangle, Scale, Users } from 'lucide-react';
import { mattersService, timeEntriesService, invoicesService, documentsService, deadlinesService, courtDatesService } from '../services/api';
import { Matter } from '../types';
import { fmt, matterTypeColor, matterTypeLabel, statusColor } from '../utils/helpers';
import { PageLoader, Modal, Avatar, PriorityDot, toast } from '../components/ui';

type Tab = 'overview' | 'time' | 'billing' | 'documents' | 'deadlines' | 'court';

const MatterDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [matter, setMatter] = useState<Matter | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('overview');
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
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadCategory, setUploadCategory] = useState('');

  const load = useCallback(async () => {
    if (!id) return;
    const res = await mattersService.get(id);
    setMatter(res.data);
  }, [id]);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  const postUpdate = async () => {
    if (!updateText.trim() || !id) return;
    setPostingUpdate(true);
    try {
      await mattersService.addUpdate(id, updateText);
      setUpdateText('');
      await load();
      toast.success('Update posted');
    } catch { toast.error('Failed to post update'); }
    finally { setPostingUpdate(false); }
  };

  const logTime = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSubmitting(true);
    try {
      await timeEntriesService.create({ matterId: id, ...timeForm, hours: Number(timeForm.hours), rate: timeForm.rate ? Number(timeForm.rate) : undefined });
      await load();
      setShowTimeModal(false);
      setTimeForm({ description: '', hours: '', rate: '', date: new Date().toISOString().split('T')[0] });
      toast.success('Time logged');
    } catch { toast.error('Failed to log time'); }
    finally { setSubmitting(false); }
  };

  const createInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSubmitting(true);
    try {
      await invoicesService.create({ matterId: id, ...invoiceForm, amount: Number(invoiceForm.amount) });
      await load();
      setShowInvoiceModal(false);
      setInvoiceForm({ amount: '', dueDate: '', notes: '' });
      toast.success('Invoice created');
    } catch { toast.error('Failed to create invoice'); }
    finally { setSubmitting(false); }
  };

  const createDeadline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSubmitting(true);
    try {
      await deadlinesService.create({ matterId: id, ...deadlineForm });
      await load();
      setShowDeadlineModal(false);
      setDeadlineForm({ title: '', description: '', dueDate: '', priority: 'normal' });
      toast.success('Deadline added');
    } catch { toast.error('Failed to add deadline'); }
    finally { setSubmitting(false); }
  };

  const createCourtDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSubmitting(true);
    try {
      await courtDatesService.create({ matterId: id, ...courtForm });
      await load();
      setShowCourtModal(false);
      setCourtForm({ title: '', court: '', judge: '', dateTime: '', notes: '' });
      toast.success('Court date added');
    } catch { toast.error('Failed to add court date'); }
    finally { setSubmitting(false); }
  };

  const uploadDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('file', uploadFile);
      fd.append('matterId', id!);
      fd.append('category', uploadCategory);
      await documentsService.upload(fd);
      await load();
      setShowUploadModal(false);
      setUploadFile(null);
      toast.success('Document uploaded');
    } catch { toast.error('Upload failed'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <PageLoader />;
  if (!matter) return <div className="text-slate-400 text-center py-20">Matter not found</div>;

  const tabs: { key: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: 'overview', label: 'Overview', icon: <Users size={14} /> },
    { key: 'time', label: 'Time', icon: <Clock size={14} />, count: matter._count?.timeEntries },
    { key: 'billing', label: 'Billing', icon: <FileText size={14} />, count: matter._count?.invoices },
    { key: 'documents', label: 'Documents', icon: <FolderOpen size={14} />, count: matter._count?.documents },
    { key: 'deadlines', label: 'Deadlines', icon: <AlertTriangle size={14} />, count: matter._count?.deadlines },
    { key: 'court', label: 'Court Dates', icon: <Scale size={14} />, count: matter._count?.courtDates },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div>
        <button onClick={() => navigate('/matters')} className="btn-ghost btn-sm mb-3 -ml-1">
          <ArrowLeft size={14} /> Matters
        </button>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">{matter.matterNo}</span>
              <span className={matterTypeColor[matter.type]}>{matterTypeLabel[matter.type]}</span>
              <span className={statusColor[matter.status]}>{matter.status.replace('_', ' ')}</span>
              <div className="flex items-center gap-1.5"><PriorityDot priority={matter.priority} /><span className="text-xs text-slate-400 capitalize">{matter.priority}</span></div>
            </div>
            <h1 className="text-xl font-bold text-slate-100 mt-2 leading-tight">{matter.title}</h1>
            <p className="text-slate-400 text-sm mt-0.5">Client: <span className="text-slate-300">{matter.client.name}</span> · Opened {fmt.date(matter.openDate)}</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={() => setShowTimeModal(true)} className="btn-secondary btn-sm"><Clock size={14} /> Log Time</button>
            <button onClick={() => setShowInvoiceModal(true)} className="btn-primary btn-sm"><Plus size={14} /> Invoice</button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-700 flex gap-0 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`tab ${tab === t.key ? 'tab-active' : 'tab-inactive'} flex items-center gap-1.5`}>
            {t.icon} {t.label}
            {t.count !== undefined && <span className="ml-1 bg-slate-700 text-slate-400 text-[10px] rounded-full px-1.5 py-0.5 leading-none">{t.count}</span>}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ───────────────────────────────────────────────────── */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2 space-y-5">
            {matter.description && (
              <div className="card card-body">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</h3>
                <p className="text-slate-300 text-sm leading-relaxed">{matter.description}</p>
              </div>
            )}
            {/* Updates */}
            <div className="card">
              <div className="card-header"><h3 className="font-semibold text-slate-200 text-sm">Matter Journal</h3></div>
              <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
                {(!matter.updates || matter.updates.length === 0) && <p className="text-slate-500 text-sm text-center py-4">No updates yet</p>}
                {matter.updates?.map(u => (
                  <div key={u.id} className="flex gap-3">
                    <Avatar name={u.author} size="sm" className="flex-shrink-0 mt-0.5" />
                    <div className="flex-1 bg-slate-700/30 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-slate-300">{u.author}</span>
                        <span className="text-xs text-slate-500">{fmt.relative(u.createdAt)}</span>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed">{u.content}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-slate-700">
                <div className="flex gap-2">
                  <textarea className="input flex-1 text-sm resize-none" rows={2} placeholder="Add a journal entry…" value={updateText} onChange={e => setUpdateText(e.target.value)} />
                  <button onClick={postUpdate} disabled={!updateText.trim() || postingUpdate} className="btn-primary self-end"><Send size={14} /></button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar info */}
          <div className="space-y-4">
            <div className="card card-body">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Client</h3>
              <p className="text-slate-200 font-medium">{matter.client.name}</p>
              {matter.client.email && <p className="text-slate-400 text-sm mt-1">{matter.client.email}</p>}
              {matter.client.phone && <p className="text-slate-400 text-sm">{matter.client.phone}</p>}
            </div>
            <div className="card card-body">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Team</h3>
              <div className="space-y-2">
                {matter.team.map(t => (
                  <div key={t.id} className="flex items-center gap-2">
                    <Avatar name={t.user.name} size="sm" />
                    <div>
                      <p className="text-sm text-slate-200">{t.user.name}</p>
                      <p className="text-xs text-slate-500 capitalize">{t.role} · {t.user.position}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card card-body space-y-2">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Summary</h3>
              {[
                ['Time Entries', matter._count?.timeEntries],
                ['Documents', matter._count?.documents],
                ['Invoices', matter._count?.invoices],
                ['Deadlines', matter._count?.deadlines],
                ['Court Dates', matter._count?.courtDates],
              ].map(([label, val]) => (
                <div key={String(label)} className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">{label}</span>
                  <span className="font-medium text-slate-200">{val ?? 0}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TIME ───────────────────────────────────────────────────────── */}
      {tab === 'time' && (
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-slate-200 text-sm">Time Entries</h3>
            <button onClick={() => setShowTimeModal(true)} className="btn-primary btn-sm"><Plus size={14} /> Log Time</button>
          </div>
          <div className="table-wrapper">
            <table className="table">
              <thead><tr><th>Description</th><th>Fee Earner</th><th>Date</th><th>Hours</th><th>Rate</th><th>Value</th><th>Billed</th></tr></thead>
              <tbody>
                {(!matter.timeEntries || matter.timeEntries.length === 0) && <tr><td colSpan={7} className="text-center text-slate-500 py-8">No time entries yet</td></tr>}
                {matter.timeEntries?.map(e => (
                  <tr key={e.id}>
                    <td className="max-w-[200px] truncate">{e.description}</td>
                    <td>{e.user?.name}</td>
                    <td className="text-slate-400 text-xs">{fmt.date(e.date)}</td>
                    <td className="font-mono text-brand-400">{fmt.hours(e.hours)}</td>
                    <td className="font-mono text-slate-400">{fmt.naira(e.rate)}/h</td>
                    <td className="font-mono text-emerald-400 font-semibold">{fmt.naira(e.hours * e.rate)}</td>
                    <td><span className={e.billed ? 'badge-green' : 'badge-gray'}>{e.billed ? 'Billed' : 'Unbilled'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {matter.timeEntries && matter.timeEntries.length > 0 && (
            <div className="px-4 py-3 border-t border-slate-700 flex justify-end gap-8">
              <div className="text-sm"><span className="text-slate-400">Total hours: </span><span className="font-mono text-brand-400 font-semibold">{fmt.hours(matter.timeEntries.reduce((s, e) => s + e.hours, 0))}</span></div>
              <div className="text-sm"><span className="text-slate-400">Total value: </span><span className="font-mono text-emerald-400 font-semibold">{fmt.naira(matter.timeEntries.reduce((s, e) => s + e.hours * e.rate, 0))}</span></div>
            </div>
          )}
        </div>
      )}

      {/* ── BILLING ────────────────────────────────────────────────────── */}
      {tab === 'billing' && (
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-slate-200 text-sm">Invoices</h3>
            <button onClick={() => setShowInvoiceModal(true)} className="btn-primary btn-sm"><Plus size={14} /> Create Invoice</button>
          </div>
          <div className="table-wrapper">
            <table className="table">
              <thead><tr><th>Invoice No</th><th>Amount</th><th>VAT</th><th>Total</th><th>Status</th><th>Due Date</th></tr></thead>
              <tbody>
                {(!matter.invoices || matter.invoices.length === 0) && <tr><td colSpan={6} className="text-center text-slate-500 py-8">No invoices yet</td></tr>}
                {matter.invoices?.map(inv => (
                  <tr key={inv.id}>
                    <td className="font-mono text-slate-200">{inv.invoiceNo}</td>
                    <td className="font-mono">{fmt.naira(inv.amount)}</td>
                    <td className="font-mono text-slate-400">{fmt.naira(inv.vat)}</td>
                    <td className="font-mono font-semibold text-emerald-400">{fmt.naira(inv.total)}</td>
                    <td><span className={statusColor[inv.status]}>{inv.status}</span></td>
                    <td className="text-slate-400 text-xs">{inv.dueDate ? fmt.date(inv.dueDate) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── DOCUMENTS ──────────────────────────────────────────────────── */}
      {tab === 'documents' && (
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-slate-200 text-sm">Documents</h3>
            <button onClick={() => setShowUploadModal(true)} className="btn-primary btn-sm"><Plus size={14} /> Upload</button>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(!matter.documents || matter.documents.length === 0) && <div className="col-span-full text-center text-slate-500 py-8">No documents uploaded</div>}
            {matter.documents?.map(doc => (
              <a key={doc.id} href={`/api/documents/${doc.id}/download`} target="_blank" rel="noreferrer"
                className="flex items-center gap-3 p-3 bg-slate-700/40 rounded-lg border border-slate-700 hover:border-brand-500/50 transition-colors group">
                <div className="text-2xl flex-shrink-0">{doc.mimetype.includes('pdf') ? '📄' : doc.mimetype.includes('image') ? '🖼️' : '📝'}</div>
                <div className="min-w-0">
                  <p className="text-sm text-slate-200 truncate group-hover:text-brand-400">{doc.name}</p>
                  <p className="text-xs text-slate-500">{fmt.fileSize(doc.size)} · {fmt.date(doc.createdAt)}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* ── DEADLINES ──────────────────────────────────────────────────── */}
      {tab === 'deadlines' && (
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-slate-200 text-sm">Deadlines</h3>
            <button onClick={() => setShowDeadlineModal(true)} className="btn-primary btn-sm"><Plus size={14} /> Add Deadline</button>
          </div>
          <div className="divide-y divide-slate-700/50">
            {(!matter.deadlines || matter.deadlines.length === 0) && <div className="text-center text-slate-500 py-8">No deadlines set</div>}
            {matter.deadlines?.map(d => {
              const over = new Date(d.dueDate) < new Date();
              return (
                <div key={d.id} className="px-5 py-4 flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${over ? 'bg-red-500' : d.priority === 'urgent' ? 'bg-red-500' : d.priority === 'high' ? 'bg-orange-500' : 'bg-blue-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-200 font-medium text-sm">{d.title}</p>
                    {d.description && <p className="text-slate-500 text-xs mt-0.5 truncate">{d.description}</p>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-sm font-medium ${over ? 'text-red-400' : 'text-slate-300'}`}>{fmt.date(d.dueDate)}</p>
                    <span className={statusColor[d.status]}>{d.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── COURT DATES ────────────────────────────────────────────────── */}
      {tab === 'court' && (
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-slate-200 text-sm">Court Dates</h3>
            <button onClick={() => setShowCourtModal(true)} className="btn-primary btn-sm"><Plus size={14} /> Add Court Date</button>
          </div>
          <div className="divide-y divide-slate-700/50">
            {(!matter.courtDates || matter.courtDates.length === 0) && <div className="text-center text-slate-500 py-8">No court dates</div>}
            {matter.courtDates?.map(c => (
              <div key={c.id} className="px-5 py-4 flex items-start gap-4">
                <div className="bg-blue-900/40 rounded-xl p-2.5 text-center min-w-[52px] flex-shrink-0">
                  <p className="text-sm font-bold text-blue-400">{fmt.date(c.dateTime).split(' ')[0]}</p>
                  <p className="text-xs text-slate-400">{fmt.date(c.dateTime).split(' ')[1]}</p>
                  <p className="text-xs text-slate-500">{fmt.time(c.dateTime)}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-200 font-medium">{c.title}</p>
                  {c.court && <p className="text-slate-400 text-sm mt-0.5">{c.court}</p>}
                  {c.judge && <p className="text-slate-500 text-xs">Before: {c.judge}</p>}
                  {c.notes && <p className="text-slate-500 text-xs mt-1 italic">{c.notes}</p>}
                </div>
                <span className={statusColor[c.status]}>{c.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── MODALS ─────────────────────────────────────────────────────── */}
      <Modal open={showTimeModal} onClose={() => setShowTimeModal(false)} title="Log Time"
        footer={<><button onClick={() => setShowTimeModal(false)} className="btn-secondary">Cancel</button><button form="time-form" type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Saving…' : 'Log Time'}</button></>}>
        <form id="time-form" onSubmit={logTime} className="space-y-4">
          <div className="form-group"><label className="label">Description *</label><textarea className="input resize-none" rows={2} required value={timeForm.description} onChange={e => setTimeForm(f => ({ ...f, description: e.target.value }))} placeholder="Work performed…" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group"><label className="label">Hours *</label><input type="number" step="0.25" min="0.25" className="input" required value={timeForm.hours} onChange={e => setTimeForm(f => ({ ...f, hours: e.target.value }))} placeholder="2.5" /></div>
            <div className="form-group"><label className="label">Rate (₦/hr)</label><input type="number" className="input" value={timeForm.rate} onChange={e => setTimeForm(f => ({ ...f, rate: e.target.value }))} placeholder="75,000" /></div>
          </div>
          <div className="form-group"><label className="label">Date</label><input type="date" className="input" value={timeForm.date} onChange={e => setTimeForm(f => ({ ...f, date: e.target.value }))} /></div>
        </form>
      </Modal>

      <Modal open={showInvoiceModal} onClose={() => setShowInvoiceModal(false)} title="Create Invoice"
        footer={<><button onClick={() => setShowInvoiceModal(false)} className="btn-secondary">Cancel</button><button form="invoice-form" type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Creating…' : 'Create Invoice'}</button></>}>
        <form id="invoice-form" onSubmit={createInvoice} className="space-y-4">
          <div className="form-group"><label className="label">Amount (₦) *</label><input type="number" className="input" required value={invoiceForm.amount} onChange={e => setInvoiceForm(f => ({ ...f, amount: e.target.value }))} placeholder="500,000" /></div>
          <div className="form-group"><label className="label">Due Date</label><input type="date" className="input" value={invoiceForm.dueDate} onChange={e => setInvoiceForm(f => ({ ...f, dueDate: e.target.value }))} /></div>
          <div className="form-group"><label className="label">Notes</label><textarea className="input resize-none" rows={2} value={invoiceForm.notes} onChange={e => setInvoiceForm(f => ({ ...f, notes: e.target.value }))} /></div>
          <div className="bg-slate-700/40 rounded-lg p-3 text-sm">
            <div className="flex justify-between text-slate-400"><span>Amount</span><span className="font-mono">{fmt.naira(Number(invoiceForm.amount) || 0)}</span></div>
            <div className="flex justify-between text-slate-400 mt-1"><span>VAT (7.5%)</span><span className="font-mono">{fmt.naira((Number(invoiceForm.amount) || 0) * 0.075)}</span></div>
            <div className="flex justify-between text-slate-200 font-semibold mt-2 pt-2 border-t border-slate-600"><span>Total</span><span className="font-mono text-emerald-400">{fmt.naira((Number(invoiceForm.amount) || 0) * 1.075)}</span></div>
          </div>
        </form>
      </Modal>

      <Modal open={showDeadlineModal} onClose={() => setShowDeadlineModal(false)} title="Add Deadline"
        footer={<><button onClick={() => setShowDeadlineModal(false)} className="btn-secondary">Cancel</button><button form="deadline-form" type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Saving…' : 'Add Deadline'}</button></>}>
        <form id="deadline-form" onSubmit={createDeadline} className="space-y-4">
          <div className="form-group"><label className="label">Title *</label><input className="input" required value={deadlineForm.title} onChange={e => setDeadlineForm(f => ({ ...f, title: e.target.value }))} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group"><label className="label">Due Date *</label><input type="date" className="input" required value={deadlineForm.dueDate} onChange={e => setDeadlineForm(f => ({ ...f, dueDate: e.target.value }))} /></div>
            <div className="form-group"><label className="label">Priority</label><select className="select" value={deadlineForm.priority} onChange={e => setDeadlineForm(f => ({ ...f, priority: e.target.value }))}><option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option></select></div>
          </div>
          <div className="form-group"><label className="label">Notes</label><textarea className="input resize-none" rows={2} value={deadlineForm.description} onChange={e => setDeadlineForm(f => ({ ...f, description: e.target.value }))} /></div>
        </form>
      </Modal>

      <Modal open={showCourtModal} onClose={() => setShowCourtModal(false)} title="Add Court Date"
        footer={<><button onClick={() => setShowCourtModal(false)} className="btn-secondary">Cancel</button><button form="court-form" type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Saving…' : 'Add Court Date'}</button></>}>
        <form id="court-form" onSubmit={createCourtDate} className="space-y-4">
          <div className="form-group"><label className="label">Title *</label><input className="input" required value={courtForm.title} onChange={e => setCourtForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Pre-trial conference" /></div>
          <div className="form-group"><label className="label">Date & Time *</label><input type="datetime-local" className="input" required value={courtForm.dateTime} onChange={e => setCourtForm(f => ({ ...f, dateTime: e.target.value }))} /></div>
          <div className="form-group"><label className="label">Court</label><input className="input" value={courtForm.court} onChange={e => setCourtForm(f => ({ ...f, court: e.target.value }))} placeholder="e.g. Tax Appeal Tribunal, Lagos" /></div>
          <div className="form-group"><label className="label">Judge / Tribunal</label><input className="input" value={courtForm.judge} onChange={e => setCourtForm(f => ({ ...f, judge: e.target.value }))} placeholder="Hon. Justice …" /></div>
          <div className="form-group"><label className="label">Notes</label><textarea className="input resize-none" rows={2} value={courtForm.notes} onChange={e => setCourtForm(f => ({ ...f, notes: e.target.value }))} /></div>
        </form>
      </Modal>

      <Modal open={showUploadModal} onClose={() => setShowUploadModal(false)} title="Upload Document"
        footer={<><button onClick={() => setShowUploadModal(false)} className="btn-secondary">Cancel</button><button form="upload-form" type="submit" className="btn-primary" disabled={submitting || !uploadFile}>{submitting ? 'Uploading…' : 'Upload'}</button></>}>
        <form id="upload-form" onSubmit={uploadDoc} className="space-y-4">
          <div className="form-group"><label className="label">File *</label>
            <input type="file" className="input" onChange={e => setUploadFile(e.target.files?.[0] || null)} accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt" />
          </div>
          <div className="form-group"><label className="label">Category</label>
            <select className="select" value={uploadCategory} onChange={e => setUploadCategory(e.target.value)}>
              <option value="">Select category…</option>
              {['contract', 'court_filing', 'correspondence', 'evidence', 'other'].map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MatterDetailPage;
