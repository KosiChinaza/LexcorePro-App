import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { auditService } from '../services/api';
import { fmt } from '../utils/helpers';
import { SearchInput } from '../components/ui';
const AuditPage = () => {
    const [logs, setLogs] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const load = async (p = 1) => {
        setLoading(true);
        const params = { page: String(p), limit: '50' };
        if (search)
            params.action = search;
        const res = await auditService.list(params);
        setLogs(res.data.data || []);
        setTotal(res.data.total || 0);
        setLoading(false);
    };
    useEffect(() => { load(1); }, [search]);
    const actionColor = {
        USER_LOGIN: 'badge-green', USER_LOGOUT: 'badge-gray', USER_CREATED: 'badge-blue',
        USER_UPDATED: 'badge-blue', USER_DEACTIVATED: 'badge-red', MATTER_CREATED: 'badge-purple',
        MATTER_UPDATED: 'badge-blue', INVOICE_CREATED: 'badge-yellow', INVOICE_PAID: 'badge-green',
        TIME_ENTRY_CREATED: 'badge-blue', DOCUMENT_UPLOADED: 'badge-blue', LEAVE_APPROVED: 'badge-green',
        LEAVE_REJECTED: 'badge-red', REQUEST_APPROVED: 'badge-green', REQUEST_REJECTED: 'badge-red',
        SETTINGS_UPDATED: 'badge-yellow', PASSWORD_CHANGED: 'badge-yellow',
    };
    return (_jsxs("div", { className: "space-y-5 animate-fade-in", children: [_jsx("div", { className: "page-header", children: _jsxs("div", { children: [_jsx("h1", { className: "page-title", children: "Audit Log" }), _jsxs("p", { className: "page-subtitle", children: [total, " events recorded"] })] }) }), _jsx(SearchInput, { value: search, onChange: setSearch, placeholder: "Filter by action\u2026", className: "max-w-sm" }), _jsxs("div", { className: "card", children: [loading ? (_jsx("div", { className: "p-8 text-center text-slate-500", children: "Loading\u2026" })) : (_jsx("div", { className: "table-wrapper", children: _jsxs("table", { className: "table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Action" }), _jsx("th", { children: "User" }), _jsx("th", { children: "Entity" }), _jsx("th", { children: "Details" }), _jsx("th", { children: "IP" }), _jsx("th", { children: "Time" })] }) }), _jsxs("tbody", { children: [logs.length === 0 && _jsx("tr", { children: _jsx("td", { colSpan: 6, className: "text-center text-slate-500 py-8", children: "No audit logs found" }) }), logs.map(log => (_jsxs("tr", { children: [_jsx("td", { children: _jsx("span", { className: actionColor[log.action] || 'badge-gray', children: log.action.replace(/_/g, ' ') }) }), _jsx("td", { className: "text-slate-300", children: log.user?.name || 'System' }), _jsx("td", { className: "text-slate-400 text-xs", children: log.entity || '—' }), _jsx("td", { className: "text-slate-500 text-xs max-w-[200px] truncate", children: log.details || '—' }), _jsx("td", { className: "font-mono text-slate-500 text-xs", children: log.ip || '—' }), _jsx("td", { className: "text-xs text-slate-400 whitespace-nowrap", children: fmt.dateTime(log.createdAt) })] }, log.id)))] })] }) })), total > 50 && (_jsxs("div", { className: "px-4 py-3 border-t border-slate-700 flex items-center justify-between", children: [_jsxs("span", { className: "text-sm text-slate-400", children: ["Page ", page, " of ", Math.ceil(total / 50)] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { disabled: page === 1, onClick: () => { setPage(p => p - 1); load(page - 1); }, className: "btn-secondary btn-sm", children: "Prev" }), _jsx("button", { disabled: page >= Math.ceil(total / 50), onClick: () => { setPage(p => p + 1); load(page + 1); }, className: "btn-secondary btn-sm", children: "Next" })] })] }))] })] }));
};
export default AuditPage;
