import React, { useEffect, useState } from 'react';
import { Edit2, XCircle } from 'lucide-react';
import { usersService } from '../services/api';
import { User } from '../types';
import { fmt, statusColor } from '../utils/helpers';
import { PageLoader, EmptyState, Modal, Avatar, ConfirmModal, toast } from '../components/ui';

const StaffPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deactivateId, setDeactivateId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', position: '', role: 'staff', status: 'active' });

  const load = async () => { const res = await usersService.list(); setUsers(res.data); };
  useEffect(() => { setLoading(true); load().finally(() => setLoading(false)); }, []);

  const openEdit = (u: User) => {
    setEditUser(u);
    setForm({ name: u.name, phone: u.phone || '', position: u.position || '', role: u.role, status: u.status });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    setSaving(true);
    try {
      await usersService.update(editUser.id, form as Record<string, unknown>);
      await load();
      setEditUser(null);
      toast.success('Staff updated');
    } catch { toast.error('Failed to update'); }
    finally { setSaving(false); }
  };

  const handleDeactivate = async () => {
    if (!deactivateId) return;
    try {
      await usersService.deactivate(deactivateId);
      await load();
      setDeactivateId(null);
      toast.success('Staff deactivated');
    } catch { toast.error('Failed to deactivate'); }
  };

  if (loading) return <PageLoader />;

  const active = users.filter(u => u.status === 'active');

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="page-header">
        <div><h1 className="page-title">Staff & HR</h1><p className="page-subtitle">{active.length} active staff member{active.length !== 1 ? 's' : ''}</p></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {users.map(u => (
          <div key={u.id} className={`card p-5 ${u.status !== 'active' ? 'opacity-60' : ''}`}>
            <div className="flex items-start gap-3">
              <Avatar name={u.name} size="lg" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-100">{u.name}</h3>
                    <p className="text-sm text-slate-400">{u.position || u.role}</p>
                  </div>
                  <span className={u.role === 'admin' ? 'badge-purple' : 'badge-blue'}>{u.role}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{u.email}</p>
                {u.phone && <p className="text-xs text-slate-500">{u.phone}</p>}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700">
                  <span className={statusColor[u.status] || 'badge-gray'}>{u.status}</span>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(u)} className="btn-ghost btn-sm p-1.5"><Edit2 size={14} /></button>
                    {u.status === 'active' && (
                      <button onClick={() => setDeactivateId(u.id)} className="btn-ghost btn-sm p-1.5 text-red-400"><XCircle size={14} /></button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal open={!!editUser} onClose={() => setEditUser(null)} title="Edit Staff"
        footer={<><button onClick={() => setEditUser(null)} className="btn-secondary">Cancel</button><button form="staff-form" type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button></>}>
        <form id="staff-form" onSubmit={handleSave} className="space-y-4">
          <div className="form-group"><label className="label">Full Name</label><input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
          <div className="form-group"><label className="label">Position</label><input className="input" value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))} /></div>
          <div className="form-group"><label className="label">Phone</label><input className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group"><label className="label">Role</label>
              <select className="select" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                <option value="staff">Staff</option><option value="admin">Admin</option>
              </select>
            </div>
            <div className="form-group"><label className="label">Status</label>
              <select className="select" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="active">Active</option><option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmModal open={!!deactivateId} title="Deactivate Staff" message="This will prevent the staff member from logging in. You can reactivate them later." danger
        onConfirm={handleDeactivate} onClose={() => setDeactivateId(null)} confirmLabel="Deactivate" />
    </div>
  );
};

export default StaffPage;
