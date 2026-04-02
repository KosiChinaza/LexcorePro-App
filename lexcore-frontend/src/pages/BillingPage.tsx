import React, { useEffect, useState, useCallback } from 'react';
import { Plus, FileText, CheckCircle, Send } from 'lucide-react';
import { invoicesService, mattersService } from '../services/api';
import { Invoice, Matter } from '../types';
import { fmt, statusColor } from '../utils/helpers';
import { PageLoader, EmptyState, Modal, ConfirmModal, StatCard, toast } from '../components/ui';

const BillingPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [matters, setMatters] = useState<Matter[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [payId, setPayId] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [form, setForm] = useState({ matterId: '', amount: '', dueDate: '', notes: '' });

  const load = useCallback(async () => {
    const params: Record<string, string> = {};
    if (filterStatus) params.status = filterStatus;
    const [invRes, matRes] = await Promise.all([invoicesService.list(params), mattersService.list({ limit: '100' })]);
    setInvoices(invRes.data);
    setMatters(matRes.data.data || []);
  }, [filterStatus]);

  useEffect(() => { setLoading(true); load().finally(() => setLoading(false)); }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await invoicesService.create({ ...form, amount: Number(form.amount) });
      await load();
      setShowCreate(false);
      setForm({ matterId: '', amount: '', dueDate: '', notes: '' });
      toast.success('Invoice created');
    } catch { toast.error('Failed to create invoice'); }
    finally { setCreating(false); }
  };

  const handleMarkPaid = async () => {
    if (!payId) return;
    setPaying(true);
    try {
      await invoicesService.markPaid(payId);
      await load();
      setPayId(null);
      toast.success('Invoice marked as paid');
    } catch { toast.error('Failed to update invoice'); }
    finally { setPaying(false); }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await invoicesService.update(id, { status });
      await load();
      toast.success(`Invoice marked as ${status}`);
    } catch { toast.error('Failed to update'); }
  };

  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0);
  const totalPending = invoices.filter(i => ['sent', 'overdue'].includes(i.status)).reduce((s, i) => s + i.total, 0);
  const totalDraft = invoices.filter(i => i.status === 'draft').reduce((s, i) => s + i.total, 0);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="page-header">
        <div><h1 className="page-title">Billing</h1><p className="page-subtitle">{invoices.length} invoice{invoices.length !== 1 ? 's' : ''}</p></div>
        <button onClick={() => setShowCreate(true)} className="btn-primary"><Plus size={16} /> New Invoice</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Revenue Collected" value={fmt.naira(totalPaid)} icon={<CheckCircle size={20} className="text-emerald-400" />} iconBg="bg-emerald-900/40" />
        <StatCard label="Outstanding" value={fmt.naira(totalPending)} icon={<Send size={20} className="text-blue-400" />} iconBg="bg-blue-900/40" />
        <StatCard label="Draft" value={fmt.naira(totalDraft)} icon={<FileText size={20} className="text-slate-400" />} iconBg="bg-slate-700" />
      </div>

      <div className="flex gap-3">
        {['', 'draft', 'sent', 'paid', 'overdue', 'cancelled'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`btn-sm rounded-full ${filterStatus === s ? 'bg-brand-500 text-slate-900' : 'btn-secondary'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      <div className="card">
        {invoices.length === 0 ? (
          <EmptyState icon={<FileText size={40} />} title="No invoices" action={<button onClick={() => setShowCreate(true)} className="btn-primary btn-sm">Create Invoice</button>} />
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead><tr><th>Invoice</th><th>Client</th><th>Matter</th><th>Amount</th><th>VAT</th><th>Total</th><th>Status</th><th>Due</th><th>Actions</th></tr></thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv.id}>
                    <td className="font-mono text-slate-200 font-medium">{inv.invoiceNo}</td>
                    <td className="text-slate-300">{inv.matter?.client.name}</td>
                    <td className="text-xs text-slate-400">{inv.matter?.matterNo}</td>
                    <td className="font-mono">{fmt.naira(inv.amount)}</td>
                    <td className="font-mono text-slate-400">{fmt.naira(inv.vat)}</td>
                    <td className="font-mono font-semibold text-emerald-400">{fmt.naira(inv.total)}</td>
                    <td><span className={statusColor[inv.status]}>{inv.status}</span></td>
                    <td className="text-xs text-slate-400">{inv.dueDate ? fmt.date(inv.dueDate) : '—'}</td>
                    <td>
                      <div className="flex gap-1">
                        {inv.status === 'draft' && <button onClick={() => handleStatusUpdate(inv.id, 'sent')} className="btn-ghost btn-sm text-blue-400 px-2">Send</button>}
                        {['sent', 'overdue'].includes(inv.status) && <button onClick={() => setPayId(inv.id)} className="btn-ghost btn-sm text-emerald-400 px-2">Mark Paid</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Invoice"
        footer={<><button onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button><button form="inv-form" type="submit" className="btn-primary" disabled={creating}>{creating ? 'Creating…' : 'Create'}</button></>}>
        <form id="inv-form" onSubmit={handleCreate} className="space-y-4">
          <div className="form-group"><label className="label">Matter *</label>
            <select className="select" required value={form.matterId} onChange={e => setForm(f => ({ ...f, matterId: e.target.value }))}>
              <option value="">Select matter…</option>
              {matters.map(m => <option key={m.id} value={m.id}>{m.matterNo} — {m.client.name}</option>)}
            </select>
          </div>
          <div className="form-group"><label className="label">Amount (₦) *</label><input type="number" className="input" required value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} /></div>
          <div className="form-group"><label className="label">Due Date</label><input type="date" className="input" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} /></div>
          <div className="form-group"><label className="label">Notes</label><textarea className="input resize-none" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
          {form.amount && (
            <div className="bg-slate-700/40 rounded-lg p-3 space-y-1 text-sm">
              <div className="flex justify-between text-slate-400"><span>Amount</span><span className="font-mono">{fmt.naira(Number(form.amount))}</span></div>
              <div className="flex justify-between text-slate-400"><span>VAT (7.5%)</span><span className="font-mono">{fmt.naira(Number(form.amount) * 0.075)}</span></div>
              <div className="flex justify-between text-slate-200 font-semibold pt-1 border-t border-slate-600"><span>Total</span><span className="font-mono text-emerald-400">{fmt.naira(Number(form.amount) * 1.075)}</span></div>
            </div>
          )}
        </form>
      </Modal>

      <ConfirmModal open={!!payId} title="Mark as Paid" message="Confirm this invoice has been paid in full?" onConfirm={handleMarkPaid} onClose={() => setPayId(null)} confirmLabel="Confirm Payment" loading={paying} />
    </div>
  );
};

export default BillingPage;
