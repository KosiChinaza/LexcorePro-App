import React, { useEffect, useState } from 'react';
import { ClipboardList, CheckCircle, XCircle, Copy, UserPlus, X, Mail, AlertCircle } from 'lucide-react';
import { usersService } from '../services/api';
import { PendingRequest } from '../types';
import { fmt, statusColor } from '../utils/helpers';
import { PageLoader, toast } from '../components/ui';

type Tab = 'users' | 'requests' | 'codes' | 'sessions';

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  position?: string;
  phone?: string;
  status: string;
  createdAt: string;
}

const ROLES = ['staff', 'admin'] as const;

const UsersPage: React.FC = () => {
  const [tab, setTab] = useState<Tab>('users');

  // Data
  const [users, setUsers] = useState<UserRow[]>([]);
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [codes, setCodes] = useState<{ id: string; email: string; code: string; used: boolean; expiresAt: string; createdAt: string }[]>([]);
  const [sessions, setSessions] = useState<{ id: string; createdAt: string; expiresAt: string; ip?: string; userAgent?: string; user: { name: string; email: string } }[]>([]);
  const [loading, setLoading] = useState(true);

  // Approval state
  const [approving, setApproving] = useState<string | null>(null);
  const [approvedCode, setApprovedCode] = useState<{ code: string; email: string; emailSent?: boolean } | null>(null);

  // Add user modal
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: 'staff', position: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);
  const [inviteResult, setInviteResult] = useState<{ code: string; email: string; emailSent: boolean } | null>(null);

  const load = async () => {
    const [userRes, reqRes, codeRes, sessRes] = await Promise.all([
      usersService.list(),
      usersService.pendingRequests(),
      usersService.validationCodes(),
      usersService.sessions(),
    ]);
    setUsers(userRes.data);
    setRequests(reqRes.data);
    setCodes(codeRes.data);
    setSessions(sessRes.data);
  };

  useEffect(() => { setLoading(true); load().finally(() => setLoading(false)); }, []);

  // ── Approve pending request ──────────────────────────────────────────────
  const handleApprove = async (id: string) => {
    setApproving(id);
    try {
      const res = await usersService.approveRequest(id);
      setApprovedCode({ code: res.data.code, email: res.data.email, emailSent: res.data.emailSent });
      await load();
      toast.success(res.data.emailSent
        ? 'Request approved — activation email sent'
        : 'Request approved — email failed, share code manually');
    } catch { toast.error('Failed to approve'); }
    finally { setApproving(null); }
  };

  const handleReject = async (id: string) => {
    try { await usersService.rejectRequest(id); await load(); toast.success('Request rejected'); }
    catch { toast.error('Failed to reject'); }
  };

  // ── Direct-create user ───────────────────────────────────────────────────
  const handleCreateUser = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error('Name and email are required');
      return;
    }
    setSubmitting(true);
    try {
      const res = await usersService.createUser(form);
      setInviteResult({ code: res.data.code, email: res.data.email, emailSent: res.data.emailSent });
      setForm({ name: '', email: '', role: 'staff', position: '', phone: '' });
      await load();
      toast.success(res.data.emailSent ? 'Invitation sent!' : 'User created — share code manually');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to create user';
      toast.error(msg);
    } finally { setSubmitting(false); }
  };

  const copyCode = (code: string) => { navigator.clipboard.writeText(code); toast.success('Code copied!'); };

  const closeModal = () => { setShowModal(false); setInviteResult(null); setForm({ name: '', email: '', role: 'staff', position: '', phone: '' }); };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage users, access requests, activation codes and sessions</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <UserPlus size={16} /> Add User
        </button>
      </div>

      {/* ── Approval code banner ─────────────────────────────────────────── */}
      {approvedCode && (
        <div className="bg-emerald-900/30 border border-emerald-700 rounded-xl p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold text-emerald-300 mb-1">✓ Request Approved!</p>
              {approvedCode.emailSent === false && (
                <p className="text-yellow-400 text-sm mb-2 flex items-center gap-1"><AlertCircle size={13} /> Email failed — share this code manually with <strong>{approvedCode.email}</strong>:</p>
              )}
              {approvedCode.emailSent !== false && (
                <p className="text-emerald-400 text-sm">Activation email sent to <strong>{approvedCode.email}</strong>. Code for your records:</p>
              )}
              <div className="flex items-center gap-3 mt-3">
                <code className="bg-slate-900 text-brand-400 text-2xl font-bold font-mono px-4 py-2 rounded-lg tracking-widest">{approvedCode.code}</code>
                <button onClick={() => copyCode(approvedCode.code)} className="btn-secondary btn-sm"><Copy size={14} /> Copy</button>
              </div>
              <p className="text-emerald-600 text-xs mt-2">Code expires in 3 days</p>
            </div>
            <button onClick={() => setApprovedCode(null)} className="text-emerald-600 hover:text-emerald-400 text-xl">×</button>
          </div>
        </div>
      )}

      {/* ── Tabs ─────────────────────────────────────────────────────────── */}
      <div className="border-b border-slate-700 flex gap-0">
        {([
          ['users', `All Users (${users.length})`],
          ['requests', `Requests (${requests.length})`],
          ['codes', 'Activation Codes'],
          ['sessions', 'Active Sessions'],
        ] as const).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} className={`tab ${tab === key ? 'tab-active' : 'tab-inactive'}`}>{label}</button>
        ))}
      </div>

      {/* ── All Users tab ────────────────────────────────────────────────── */}
      {tab === 'users' && (
        <div className="card">
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Role</th><th>Position</th><th>Status</th><th>Joined</th></tr>
              </thead>
              <tbody>
                {users.length === 0 && (
                  <tr><td colSpan={6} className="text-center text-slate-500 py-8">No users found</td></tr>
                )}
                {users.map(u => (
                  <tr key={u.id}>
                    <td className="text-slate-200 font-medium">{u.name}</td>
                    <td className="text-slate-400">{u.email}</td>
                    <td>
                      <span className={u.role === 'admin' ? 'badge-yellow' : 'badge-blue'}>
                        {u.role === 'admin' ? 'Admin' : 'Staff'}
                      </span>
                    </td>
                    <td className="text-slate-400">{u.position || '—'}</td>
                    <td>
                      <span className={u.status === 'active' ? 'badge-green' : 'badge-red'}>
                        {u.status}
                      </span>
                    </td>
                    <td className="text-xs text-slate-500">{fmt.date(u.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Pending Requests tab ─────────────────────────────────────────── */}
      {tab === 'requests' && (
        <div className="card">
          {requests.length === 0 ? (
            <div className="card-body text-center text-slate-500 py-8">
              <ClipboardList size={32} className="mx-auto mb-2 opacity-30" />
              <p>No pending access requests</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Position</th><th>Requested</th><th>Actions</th></tr></thead>
                <tbody>
                  {requests.map(r => (
                    <tr key={r.id}>
                      <td className="text-slate-200 font-medium">{r.name}</td>
                      <td className="text-slate-400">{r.email}</td>
                      <td className="text-slate-400">{r.phone || '—'}</td>
                      <td className="text-slate-400">{r.position || '—'}</td>
                      <td className="text-xs text-slate-500">{fmt.relative(r.createdAt)}</td>
                      <td>
                        <div className="flex gap-2">
                          <button onClick={() => handleApprove(r.id)} disabled={approving === r.id}
                            className="btn-sm bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg flex items-center gap-1">
                            <CheckCircle size={13} /> {approving === r.id ? '…' : 'Approve'}
                          </button>
                          <button onClick={() => handleReject(r.id)}
                            className="btn-sm bg-red-800 hover:bg-red-700 text-white rounded-lg flex items-center gap-1">
                            <XCircle size={13} /> Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Codes tab ────────────────────────────────────────────────────── */}
      {tab === 'codes' && (
        <div className="card">
          <div className="table-wrapper">
            <table className="table">
              <thead><tr><th>Email</th><th>Code</th><th>Status</th><th>Expires</th><th>Issued</th></tr></thead>
              <tbody>
                {codes.length === 0 && <tr><td colSpan={5} className="text-center text-slate-500 py-8">No activation codes issued</td></tr>}
                {codes.map(c => (
                  <tr key={c.id}>
                    <td className="text-slate-300">{c.email}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <code className={`font-mono font-bold tracking-widest text-sm ${c.used ? 'text-slate-600 line-through' : 'text-brand-400'}`}>{c.code}</code>
                        {!c.used && <button onClick={() => copyCode(c.code)} className="text-slate-500 hover:text-slate-300"><Copy size={12} /></button>}
                      </div>
                    </td>
                    <td>
                      <span className={c.used ? 'badge-gray' : new Date(c.expiresAt) < new Date() ? 'badge-red' : 'badge-green'}>
                        {c.used ? 'Used' : new Date(c.expiresAt) < new Date() ? 'Expired' : 'Active'}
                      </span>
                    </td>
                    <td className="text-xs text-slate-400">{fmt.dateTime(c.expiresAt)}</td>
                    <td className="text-xs text-slate-500">{fmt.relative(c.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Sessions tab ─────────────────────────────────────────────────── */}
      {tab === 'sessions' && (
        <div className="card">
          <div className="table-wrapper">
            <table className="table">
              <thead><tr><th>User</th><th>IP Address</th><th>Logged In</th><th>Expires</th><th>Device</th></tr></thead>
              <tbody>
                {sessions.length === 0 && <tr><td colSpan={5} className="text-center text-slate-500 py-8">No active sessions</td></tr>}
                {sessions.map(s => (
                  <tr key={s.id}>
                    <td>
                      <div>
                        <p className="text-slate-200 font-medium">{s.user.name}</p>
                        <p className="text-xs text-slate-500">{s.user.email}</p>
                      </div>
                    </td>
                    <td className="font-mono text-slate-400">{s.ip || '—'}</td>
                    <td className="text-xs text-slate-400">{fmt.relative(s.createdAt)}</td>
                    <td className="text-xs text-slate-400">{fmt.date(s.expiresAt)}</td>
                    <td className="text-xs text-slate-500 max-w-[150px] truncate">{s.userAgent?.split('(')[0] || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Add User Modal ───────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl">

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-700">
              <div>
                <h2 className="text-lg font-semibold text-slate-100">Add New User</h2>
                <p className="text-slate-400 text-sm mt-0.5">They'll receive an email to set their password</p>
              </div>
              <button onClick={closeModal} className="text-slate-500 hover:text-slate-300 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">

              {/* Success state — show code */}
              {inviteResult ? (
                <div className="space-y-4">
                  <div className={`rounded-xl p-4 border ${inviteResult.emailSent ? 'bg-emerald-900/30 border-emerald-700' : 'bg-yellow-900/20 border-yellow-700'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {inviteResult.emailSent
                        ? <><Mail size={16} className="text-emerald-400" /><span className="font-semibold text-emerald-300">Invitation email sent!</span></>
                        : <><AlertCircle size={16} className="text-yellow-400" /><span className="font-semibold text-yellow-300">Email failed — share code manually</span></>
                      }
                    </div>
                    <p className="text-sm text-slate-400 mb-3">
                      {inviteResult.emailSent
                        ? `An activation email has been sent to ${inviteResult.email}. Keep this code for your records:`
                        : `Share this activation code with ${inviteResult.email}:`
                      }
                    </p>
                    <div className="flex items-center gap-3">
                      <code className="bg-slate-900 text-brand-400 text-2xl font-bold font-mono px-4 py-2 rounded-lg tracking-widest flex-1 text-center">
                        {inviteResult.code}
                      </code>
                      <button onClick={() => copyCode(inviteResult.code)} className="btn-secondary btn-sm">
                        <Copy size={14} /> Copy
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 text-center">Code expires in 3 days</p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setInviteResult(null)} className="btn-secondary flex-1">Add Another User</button>
                    <button onClick={closeModal} className="btn-primary flex-1">Done</button>
                  </div>
                </div>
              ) : (
                /* Form state */
                <>
                  <div className="form-group">
                    <label className="label">Full Name <span className="text-red-400">*</span></label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. Amara Okonkwo"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    />
                  </div>

                  <div className="form-group">
                    <label className="label">Email Address <span className="text-red-400">*</span></label>
                    <input
                      type="email"
                      className="input"
                      placeholder="amara@example.com"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="form-group">
                      <label className="label">Role</label>
                      <select className="input" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                        {ROLES.map(r => <option key={r} value={r}>{r === 'admin' ? 'Admin' : 'Staff'}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="label">Position</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="e.g. Associate"
                        value={form.position}
                        onChange={e => setForm(f => ({ ...f, position: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="label">Phone</label>
                    <input
                      type="tel"
                      className="input"
                      placeholder="+234 800 000 0000"
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    />
                  </div>

                  <div className="bg-slate-700/40 rounded-lg px-4 py-3 text-xs text-slate-400 flex items-start gap-2">
                    <Mail size={13} className="mt-0.5 shrink-0 text-slate-500" />
                    <span>An activation email with a 6-character code will be sent to this address. The user sets their own password — you never see it.</span>
                  </div>

                  <div className="flex gap-3 pt-1">
                    <button onClick={closeModal} className="btn-secondary flex-1">Cancel</button>
                    <button onClick={handleCreateUser} disabled={submitting} className="btn-primary flex-1 justify-center">
                      {submitting ? 'Sending…' : 'Send Invitation'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;