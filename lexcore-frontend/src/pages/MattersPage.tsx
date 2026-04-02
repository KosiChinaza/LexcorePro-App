import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Briefcase } from 'lucide-react';
import { mattersService, clientsService } from '../services/api';
import { Matter, Client } from '../types';
import { fmt, matterTypeColor, matterTypeLabel, statusColor, priorityDot } from '../utils/helpers';
import { PageLoader, EmptyState, SearchInput, Modal, PriorityDot, toast } from '../components/ui';

const MATTER_TYPES = ['LIT', 'CORP', 'PROP', 'EMP', 'TAX', 'FAM', 'CRIM'];
const STATUSES = ['active', 'urgent', 'on_hold', 'closed'];

const MattersPage: React.FC = () => {
  const navigate = useNavigate();
  const [matters, setMatters] = useState<Matter[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: '', type: 'LIT', clientId: '', description: '', priority: 'normal' });

  const load = useCallback(async () => {
    const params: Record<string, string> = {};
    if (filterStatus) params.status = filterStatus;
    if (filterType) params.type = filterType;
    if (search) params.search = search;
    const res = await mattersService.list(params);
    setMatters(res.data.data || res.data);
  }, [filterStatus, filterType, search]);

  useEffect(() => {
    setLoading(true);
    Promise.all([load(), clientsService.list().then(r => setClients(r.data))]).finally(() => setLoading(false));
  }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clientId) { toast.error('Please select a client'); return; }
    setCreating(true);
    try {
      const res = await mattersService.create(form);
      setMatters(prev => [res.data, ...prev]);
      setShowCreate(false);
      setForm({ title: '', type: 'LIT', clientId: '', description: '', priority: 'normal' });
      toast.success('Matter created');
      navigate(`/matters/${res.data.id}`);
    } catch { toast.error('Failed to create matter'); }
    finally { setCreating(false); }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Matters</h1>
          <p className="page-subtitle">{matters.length} matter{matters.length !== 1 ? 's' : ''} found</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          <Plus size={16} /> New Matter
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search matters, clients…" className="flex-1 min-w-[200px] max-w-sm" />
        <select className="select w-auto" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
        <select className="select w-auto" value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="">All Types</option>
          {MATTER_TYPES.map(t => <option key={t} value={t}>{matterTypeLabel[t]}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card">
        {matters.length === 0 ? (
          <EmptyState icon={<Briefcase size={40} />} title="No matters found" description="Try adjusting your filters or create a new matter."
            action={<button onClick={() => setShowCreate(true)} className="btn-primary btn-sm">New Matter</button>} />
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Matter</th><th>Client</th><th>Type</th><th>Priority</th>
                  <th>Status</th><th>Open Date</th><th>Team</th>
                </tr>
              </thead>
              <tbody>
                {matters.map(m => (
                  <tr key={m.id} className="cursor-pointer" onClick={() => navigate(`/matters/${m.id}`)}>
                    <td>
                      <div>
                        <p className="text-slate-200 font-semibold text-xs">{m.matterNo}</p>
                        <p className="text-slate-300 text-sm leading-tight mt-0.5 max-w-[240px] truncate">{m.title}</p>
                      </div>
                    </td>
                    <td className="text-slate-300">{m.client.name}</td>
                    <td><span className={matterTypeColor[m.type]}>{matterTypeLabel[m.type]}</span></td>
                    <td>
                      <div className="flex items-center gap-2">
                        <PriorityDot priority={m.priority} />
                        <span className="text-slate-300 capitalize text-xs">{m.priority}</span>
                      </div>
                    </td>
                    <td><span className={statusColor[m.status]}>{m.status.replace('_', ' ')}</span></td>
                    <td className="text-slate-400 text-xs">{fmt.date(m.openDate)}</td>
                    <td>
                      <div className="flex -space-x-1">
                        {m.team.slice(0, 3).map(t => (
                          <div key={t.id} title={t.user.name} className="w-7 h-7 rounded-full bg-slate-600 border-2 border-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-300">
                            {t.user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                        ))}
                        {m.team.length > 3 && <div className="w-7 h-7 rounded-full bg-slate-700 border-2 border-slate-800 flex items-center justify-center text-[10px] text-slate-400">+{m.team.length - 3}</div>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Matter Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Open New Matter"
        footer={
          <>
            <button onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
            <button form="create-matter-form" type="submit" className="btn-primary" disabled={creating}>
              {creating ? 'Creating…' : 'Open Matter'}
            </button>
          </>
        }>
        <form id="create-matter-form" onSubmit={handleCreate} className="space-y-4">
          <div className="form-group">
            <label className="label">Matter Title *</label>
            <input className="input" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Okafor Holdings v. FIRS" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="label">Type *</label>
              <select className="select" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                {MATTER_TYPES.map(t => <option key={t} value={t}>{matterTypeLabel[t]}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="label">Priority</label>
              <select className="select" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                {['low', 'normal', 'high', 'urgent'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="label">Client *</label>
            <select className="select" required value={form.clientId} onChange={e => setForm(f => ({ ...f, clientId: e.target.value }))}>
              <option value="">Select client…</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="label">Description</label>
            <textarea className="input min-h-[80px] resize-none" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description of the matter…" />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MattersPage;
