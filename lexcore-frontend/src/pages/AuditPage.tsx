import React, { useEffect, useState } from 'react';
import { auditService } from '../services/api';
import { AuditLog } from '../types';
import { fmt } from '../utils/helpers';
import { PageLoader, SearchInput } from '../components/ui';

const AuditPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const load = async (p = 1) => {
    setLoading(true);
    const params: Record<string, string> = { page: String(p), limit: '50' };
    if (search) params.action = search;
    const res = await auditService.list(params);
    setLogs(res.data.data || []);
    setTotal(res.data.total || 0);
    setLoading(false);
  };

  useEffect(() => { load(1); }, [search]);

  const actionColor: Record<string, string> = {
    USER_LOGIN: 'badge-green', USER_LOGOUT: 'badge-gray', USER_CREATED: 'badge-blue',
    USER_UPDATED: 'badge-blue', USER_DEACTIVATED: 'badge-red', MATTER_CREATED: 'badge-purple',
    MATTER_UPDATED: 'badge-blue', INVOICE_CREATED: 'badge-yellow', INVOICE_PAID: 'badge-green',
    TIME_ENTRY_CREATED: 'badge-blue', DOCUMENT_UPLOADED: 'badge-blue', LEAVE_APPROVED: 'badge-green',
    LEAVE_REJECTED: 'badge-red', REQUEST_APPROVED: 'badge-green', REQUEST_REJECTED: 'badge-red',
    SETTINGS_UPDATED: 'badge-yellow', PASSWORD_CHANGED: 'badge-yellow',
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Audit Log</h1>
          <p className="page-subtitle">{total} events recorded</p>
        </div>
      </div>
      <SearchInput value={search} onChange={setSearch} placeholder="Filter by action…" className="max-w-sm" />

      <div className="card">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading…</div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead><tr><th>Action</th><th>User</th><th>Entity</th><th>Details</th><th>IP</th><th>Time</th></tr></thead>
              <tbody>
                {logs.length === 0 && <tr><td colSpan={6} className="text-center text-slate-500 py-8">No audit logs found</td></tr>}
                {logs.map(log => (
                  <tr key={log.id}>
                    <td><span className={actionColor[log.action] || 'badge-gray'}>{log.action.replace(/_/g, ' ')}</span></td>
                    <td className="text-slate-300">{log.user?.name || 'System'}</td>
                    <td className="text-slate-400 text-xs">{log.entity || '—'}</td>
                    <td className="text-slate-500 text-xs max-w-[200px] truncate">{log.details || '—'}</td>
                    <td className="font-mono text-slate-500 text-xs">{log.ip || '—'}</td>
                    <td className="text-xs text-slate-400 whitespace-nowrap">{fmt.dateTime(log.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {total > 50 && (
          <div className="px-4 py-3 border-t border-slate-700 flex items-center justify-between">
            <span className="text-sm text-slate-400">Page {page} of {Math.ceil(total / 50)}</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => { setPage(p => p - 1); load(page - 1); }} className="btn-secondary btn-sm">Prev</button>
              <button disabled={page >= Math.ceil(total / 50)} onClick={() => { setPage(p => p + 1); load(page + 1); }} className="btn-secondary btn-sm">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditPage;
