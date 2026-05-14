import React, { useEffect, useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { reportsService } from '../services/api';
import { fmt, matterTypeLabel } from '../utils/helpers';
import { PageLoader, StatCard } from '../components/ui';
import { TrendingUp, Briefcase, Clock } from 'lucide-react';

const COLORS = ['#eab308', '#3b82f6', '#10b981', '#f97316', '#8b5cf6', '#ef4444', '#06b6d4'];

const ReportsPage: React.FC = () => {
  const [financials, setFinancials] = useState<{ byStatus: Record<string, number>; byType: Record<string, number>; total: number } | null>(null);
  const [timeData, setTimeData] = useState<{ byUser: { name: string; hours: number; value: number }[]; totalHours: number } | null>(null);
  const [mattersData, setMattersData] = useState<{ byType: Record<string, number>; byStatus: Record<string, number>; total: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([reportsService.financials(), reportsService.time(), reportsService.matters()])
      .then(([f, t, m]) => { setFinancials(f.data); setTimeData(t.data); setMattersData(m.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const mattersByType = Object.entries(mattersData?.byType || {}).map(([type, count]) => ({ name: matterTypeLabel[type] || type, value: count as number }));
  const mattersByStatus = Object.entries(mattersData?.byStatus || {}).map(([status, count]) => ({ name: status, value: count as number }));
  const invoicesByStatus = Object.entries(financials?.byStatus || {}).map(([status, amt]) => ({ name: status, value: amt as number }));
  const revenueByType = Object.entries(financials?.byType || {}).map(([type, amt]) => ({ name: matterTypeLabel[type] || type, value: amt as number }));

 const customTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value?: number | string }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm shadow-xl">
          <p className="text-slate-300 font-medium">{label}</p>
          {payload.map((p, i) => (
            <p key={i} className="text-brand-400 font-mono">{typeof p.value === 'number' && p.value > 10000 ? fmt.naira(p.value) : p.value}</p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Reports & Analytics</h1>
        <p className="page-subtitle">Firm performance overview</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Revenue" value={fmt.naira(financials?.total || 0)} icon={<TrendingUp size={20} className="text-emerald-400" />} iconBg="bg-emerald-900/40" />
        <StatCard label="Total Matters" value={mattersData?.total || 0} icon={<Briefcase size={20} className="text-blue-400" />} iconBg="bg-blue-900/40" />
        <StatCard label="Total Hours Billed" value={fmt.hours(timeData?.totalHours || 0)} icon={<Clock size={20} className="text-brand-400" />} iconBg="bg-brand-900/40" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Revenue by Invoice Status */}
        <div className="card">
          <div className="card-header"><h3 className="font-semibold text-slate-200 text-sm">Revenue by Invoice Status (₦)</h3></div>
          <div className="p-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={invoicesByStatus} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => `₦${(v / 1000000).toFixed(1)}M`} />
                {/* @ts-ignore */}
                <Tooltip content={customTooltip} />
                <Bar dataKey="value" fill="#eab308" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Matters by Type */}
        <div className="card">
          <div className="card-header"><h3 className="font-semibold text-slate-200 text-sm">Matters by Type</h3></div>
          <div className="p-4 h-64 flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={mattersByType} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {mattersByType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                {/* @ts-ignore */}
                <Tooltip content={customTooltip} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Time by User */}
        <div className="card">
          <div className="card-header"><h3 className="font-semibold text-slate-200 text-sm">Hours by Fee Earner</h3></div>
          <div className="p-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeData?.byUser || []} layout="vertical" margin={{ top: 5, right: 10, bottom: 5, left: 60 }}>
                <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} width={55} />
                {/* @ts-ignore */}
                <Tooltip content={customTooltip} />
                <Bar dataKey="hours" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue by Type */}
        <div className="card">
          <div className="card-header"><h3 className="font-semibold text-slate-200 text-sm">Revenue by Matter Type (₦)</h3></div>
          <div className="p-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByType} margin={{ top: 5, right: 10, bottom: 20, left: 10 }}>
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} angle={-30} textAnchor="end" />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => `₦${(v / 1000000).toFixed(1)}M`} />
                {/* @ts-ignore */}
                <Tooltip content={customTooltip} />
                <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Fee earner table */}
      <div className="card">
        <div className="card-header"><h3 className="font-semibold text-slate-200 text-sm">Fee Earner Performance</h3></div>
        <div className="table-wrapper">
          <table className="table">
            <thead><tr><th>Fee Earner</th><th>Hours Billed</th><th>Total Value</th><th>Avg Rate/Hour</th></tr></thead>
            <tbody>
              {(timeData?.byUser || []).sort((a, b) => b.value - a.value).map(u => (
                <tr key={u.name}>
                  <td className="text-slate-200 font-medium">{u.name}</td>
                  <td className="font-mono text-brand-400">{fmt.hours(u.hours)}</td>
                  <td className="font-mono text-emerald-400 font-semibold">{fmt.naira(u.value)}</td>
                  <td className="font-mono text-slate-400">{u.hours > 0 ? fmt.naira(u.value / u.hours) : '—'}/h</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
