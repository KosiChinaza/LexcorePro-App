import React, { useEffect, useState, useCallback } from 'react';
import { Users, Plus, Building2, User } from 'lucide-react';
import { clientsService } from '../services/api';
import { Client } from '../types';
import { fmt, statusColor } from '../utils/helpers';
import { PageLoader, EmptyState, SearchInput, Modal, Avatar, toast } from '../components/ui';

const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', type: 'corporate' });

  const load = useCallback(async () => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    const res = await clientsService.list(params);
    setClients(res.data);
  }, [search]);

  useEffect(() => { setLoading(true); load().finally(() => setLoading(false)); }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await clientsService.create(form as Record<string, unknown>);
      setClients(prev => [res.data, ...prev]);
      setShowCreate(false);
      setForm({ name: '', email: '', phone: '', address: '', type: 'corporate' });
      toast.success('Client created');
    } catch { toast.error('Failed to create client'); }
    finally { setCreating(false); }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Clients</h1>
          <p className="page-subtitle">{clients.length} client{clients.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary"><Plus size={16} /> New Client</button>
      </div>

      <SearchInput value={search} onChange={setSearch} placeholder="Search clients…" className="max-w-sm" />

      {clients.length === 0 ? (
        <EmptyState icon={<Users size={40} />} title="No clients found"
          action={<button onClick={() => setShowCreate(true)} className="btn-primary btn-sm">Add Client</button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {clients.map(c => (
            <div key={c.id} className="card p-5 hover:border-slate-600 transition-colors">
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-xl flex-shrink-0 ${c.type === 'corporate' ? 'bg-blue-900/40' : 'bg-purple-900/40'}`}>
                  {c.type === 'corporate' ? <Building2 size={18} className="text-blue-400" /> : <User size={18} className="text-purple-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-slate-100 leading-tight truncate">{c.name}</h3>
                    <span className={statusColor[c.type] || 'badge-gray'}>{c.type}</span>
                  </div>
                  {c.email && <p className="text-slate-400 text-sm mt-1 truncate">{c.email}</p>}
                  {c.phone && <p className="text-slate-500 text-xs mt-0.5">{c.phone}</p>}
                  {c.address && <p className="text-slate-500 text-xs mt-0.5 truncate">{c.address}</p>}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700">
                    <span className={statusColor[c.kycStatus] || 'badge-gray'}>KYC: {c.kycStatus}</span>
                    <span className="text-xs text-slate-500">{c._count?.matters ?? 0} matter{c._count?.matters !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Client"
        footer={<><button onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button><button form="client-form" type="submit" className="btn-primary" disabled={creating}>{creating ? 'Creating…' : 'Create Client'}</button></>}>
        <form id="client-form" onSubmit={handleCreate} className="space-y-4">
          <div className="form-group"><label className="label">Full Name / Company Name *</label><input className="input" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Okafor Holdings Ltd" /></div>
          <div className="form-group"><label className="label">Type</label>
            <select className="select" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              <option value="corporate">Corporate</option><option value="individual">Individual</option>
            </select>
          </div>
          <div className="form-group"><label className="label">Email</label><input type="email" className="input" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
          <div className="form-group"><label className="label">Phone</label><input className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+234 800 000 0000" /></div>
          <div className="form-group"><label className="label">Address</label><textarea className="input resize-none" rows={2} value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
        </form>
      </Modal>
    </div>
  );
};

export default ClientsPage;
