import React, { useEffect, useState } from 'react';
import { Plus, CheckCircle, XCircle, UserCheck } from 'lucide-react';
import { leaveService } from '../services/api';
import { LeaveRequest } from '../types';
import { fmt, statusColor, leaveTypeLabel } from '../utils/helpers';
import { PageLoader, EmptyState, Modal, Avatar, toast } from '../components/ui';
import { useAuth } from '../context/AuthContext';

const LeavePage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ type: 'annual', startDate: '', endDate: '', reason: '' });

  const load = async () => {
    const res = await leaveService.list();
    setRequests(res.data);
  };
  useEffect(() => { setLoading(true); load().finally(() => setLoading(false)); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await leaveService.create(form as Record<string, unknown>);
      await load();
      setShowCreate(false);
      setForm({ type: 'annual', startDate: '', endDate: '', reason: '' });
      toast.success('Leave request submitted');
    } catch { toast.error('Failed to submit leave request'); }
    finally { setCreating(false); }
  };

  const handleApprove = async (id: string) => {
    try { await leaveService.approve(id); await load(); toast.success('Leave approved'); }
    catch { toast.error('Failed to approve'); }
  };

  const handleReject = async (id: string) => {
    try { await leaveService.reject(id); await load(); toast.success('Leave rejected'); }
    catch { toast.error('Failed to reject'); }
  };

  const pending = requests.filter(r => r.status === 'pending');
  const mine = requests.filter(r => r.userId === user?.id);

  if (loading) return <PageLoader />;

  const getDays = (start: string, end: string) => {
    const diff = new Date(end).getTime() - new Date(start).getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="page-header">
        <div><h1 className="page-title">Leave Management</h1><p className="page-subtitle">{pending.length} pending request{pending.length !== 1 ? 's' : ''}</p></div>
        <button onClick={() => setShowCreate(true)} className="btn-primary"><Plus size={16} /> Request Leave</button>
      </div>

      {/* Pending (admin view) */}
      {isAdmin && pending.length > 0 && (
        <div className="card">
          <div className="card-header"><h3 className="font-semibold text-slate-200 text-sm">Pending Approval ({pending.length})</h3></div>
          <div className="divide-y divide-slate-700/50">
            {pending.map(r => (
              <div key={r.id} className="px-5 py-4 flex items-center gap-4">
                <Avatar name={r.user?.name || ''} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-slate-200">{r.user?.name}</p>
                    <span className="badge-yellow">{leaveTypeLabel[r.type]}</span>
                  </div>
                  <p className="text-sm text-slate-400 mt-0.5">{fmt.date(r.startDate)} → {fmt.date(r.endDate)} · {getDays(r.startDate, r.endDate)} days</p>
                  {r.reason && <p className="text-xs text-slate-500 mt-0.5">{r.reason}</p>}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => handleApprove(r.id)} className="btn-sm bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg flex items-center gap-1"><CheckCircle size={14} /> Approve</button>
                  <button onClick={() => handleReject(r.id)} className="btn-sm bg-red-700 hover:bg-red-600 text-white rounded-lg flex items-center gap-1"><XCircle size={14} /> Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All requests (admin) / My requests (staff) */}
      <div className="card">
        <div className="card-header"><h3 className="font-semibold text-slate-200 text-sm">{isAdmin ? 'All Leave Requests' : 'My Requests'}</h3></div>
        {requests.length === 0 ? (
          <EmptyState icon={<UserCheck size={40} />} title="No leave requests" action={<button onClick={() => setShowCreate(true)} className="btn-primary btn-sm">Request Leave</button>} />
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  {isAdmin && <th>Staff</th>}
                  <th>Type</th><th>From</th><th>To</th><th>Days</th><th>Reason</th><th>Status</th><th>Reviewed By</th>
                </tr>
              </thead>
              <tbody>
                {(isAdmin ? requests : mine).map(r => (
                  <tr key={r.id}>
                    {isAdmin && <td><div className="flex items-center gap-2"><Avatar name={r.user?.name || ''} size="sm" /><span className="text-slate-300">{r.user?.name}</span></div></td>}
                    <td><span className="badge-blue">{leaveTypeLabel[r.type]}</span></td>
                    <td className="text-slate-300 text-xs">{fmt.date(r.startDate)}</td>
                    <td className="text-slate-300 text-xs">{fmt.date(r.endDate)}</td>
                    <td className="font-mono text-brand-400">{getDays(r.startDate, r.endDate)}</td>
                    <td className="text-slate-400 text-xs max-w-[150px] truncate">{r.reason || '—'}</td>
                    <td><span className={statusColor[r.status] || 'badge-gray'}>{r.status}</span></td>
                    <td className="text-slate-400 text-xs">{r.reviewedBy || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Request Leave"
        footer={<><button onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button><button form="leave-form" type="submit" className="btn-primary" disabled={creating}>{creating ? 'Submitting…' : 'Submit Request'}</button></>}>
        <form id="leave-form" onSubmit={handleCreate} className="space-y-4">
          <div className="form-group"><label className="label">Leave Type *</label>
            <select className="select" required value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              {Object.entries(leaveTypeLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group"><label className="label">Start Date *</label><input type="date" className="input" required value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} /></div>
            <div className="form-group"><label className="label">End Date *</label><input type="date" className="input" required value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} /></div>
          </div>
          {form.startDate && form.endDate && (
            <p className="text-sm text-brand-400 font-medium">{getDays(form.startDate, form.endDate)} day{getDays(form.startDate, form.endDate) !== 1 ? 's' : ''} requested</p>
          )}
          <div className="form-group"><label className="label">Reason</label><textarea className="input resize-none" rows={3} value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} placeholder="Brief reason for leave…" /></div>
        </form>
      </Modal>
    </div>
  );
};

export default LeavePage;
