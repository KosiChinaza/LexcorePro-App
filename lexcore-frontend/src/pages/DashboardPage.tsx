import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Users, FileText, TrendingUp, AlertTriangle, Clock, ArrowRight, Scale } from 'lucide-react';
import { dashboardService } from '../services/api';
import { DashboardData } from '../types';
import { fmt, matterTypeColor, matterTypeLabel, statusColor, isDueSoon, isOverdue } from '../utils/helpers';
import { PageLoader, StatCard, Avatar, PriorityDot } from '../components/ui';
import { useAuth } from '../context/AuthContext';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.get().then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;
  if (!data) return <div className="text-slate-400">Failed to load dashboard</div>;

  const { stats, recentMatters, upcomingDeadlines, upcomingCourtDates, recentTimeEntries } = data;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">{greeting}, {user?.name.split(' ')[0]}.</h1>
        <p className="text-slate-400 text-sm mt-0.5">Here's what's happening at Peters & Associates today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Matters" value={stats.activeMatters}
          icon={<Briefcase size={20} className="text-blue-400" />} iconBg="bg-blue-900/40"
          sub={`${stats.urgentMatters} urgent`} subColor={stats.urgentMatters > 0 ? 'text-red-400' : 'text-slate-400'} />
        <StatCard label="Total Clients" value={stats.totalClients}
          icon={<Users size={20} className="text-purple-400" />} iconBg="bg-purple-900/40" />
        <StatCard label="Revenue This Month" value={fmt.naira(stats.monthRevenue)}
          icon={<TrendingUp size={20} className="text-emerald-400" />} iconBg="bg-emerald-900/40"
          sub={`${fmt.naira(stats.totalRevenue)} total`} subColor="text-slate-400" />
        <StatCard label="Pending Invoices" value={fmt.naira(stats.pendingInvoicesAmount)}
          icon={<FileText size={20} className="text-brand-400" />} iconBg="bg-brand-900/40"
          sub={`${stats.pendingInvoicesCount} invoice${stats.pendingInvoicesCount !== 1 ? 's' : ''}`} />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Recent Matters */}
        <div className="xl:col-span-2 card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <Briefcase size={16} className="text-slate-400" />
              <h3 className="font-semibold text-slate-200 text-sm">Recent Matters</h3>
            </div>
            <button onClick={() => navigate('/matters')} className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
              View all <ArrowRight size={12} />
            </button>
          </div>
          <div className="table-wrapper">
            <table className="table">
              <thead><tr><th>Matter</th><th>Client</th><th>Type</th><th>Status</th></tr></thead>
              <tbody>
                {recentMatters.map(m => (
                  <tr key={m.id} className="cursor-pointer" onClick={() => navigate(`/matters/${m.id}`)}>
                    <td>
                      <div className="flex items-center gap-2">
                        <PriorityDot priority={m.priority} />
                        <div>
                          <p className="text-slate-200 font-medium text-xs">{m.matterNo}</p>
                          <p className="text-slate-400 text-xs truncate max-w-[180px]">{m.title}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-slate-300">{m.client.name}</td>
                    <td><span className={matterTypeColor[m.type]}>{matterTypeLabel[m.type]}</span></td>
                    <td><span className={statusColor[m.status]}>{m.status.replace('_', ' ')}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Upcoming Deadlines */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-slate-400" />
                <h3 className="font-semibold text-slate-200 text-sm">Upcoming Deadlines</h3>
              </div>
              <button onClick={() => navigate('/alerts')} className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
                All <ArrowRight size={12} />
              </button>
            </div>
            <div className="p-3 space-y-2">
              {upcomingDeadlines.length === 0 && <p className="text-slate-500 text-xs text-center py-4">No upcoming deadlines</p>}
              {upcomingDeadlines.map(d => {
                const overdue = isOverdue(d.dueDate);
                const soon = isDueSoon(d.dueDate);
                return (
                  <div key={d.id} className={`flex items-start gap-3 p-3 rounded-lg border ${overdue ? 'bg-red-900/20 border-red-800/50' : soon ? 'bg-yellow-900/20 border-yellow-800/50' : 'bg-slate-700/30 border-slate-700/50'}`}>
                    <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${overdue ? 'bg-red-500' : soon ? 'bg-yellow-500' : 'bg-blue-500'}`} />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-200 truncate">{d.title}</p>
                      <p className="text-xs text-slate-500">{d.matter?.matterNo}</p>
                      <p className={`text-xs font-medium mt-0.5 ${overdue ? 'text-red-400' : soon ? 'text-yellow-400' : 'text-slate-400'}`}>{fmt.date(d.dueDate)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Court Dates */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center gap-2">
                <Scale size={16} className="text-slate-400" />
                <h3 className="font-semibold text-slate-200 text-sm">Court Dates</h3>
              </div>
              <button onClick={() => navigate('/calendar')} className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
                All <ArrowRight size={12} />
              </button>
            </div>
            <div className="p-3 space-y-2">
              {upcomingCourtDates.length === 0 && <p className="text-slate-500 text-xs text-center py-4">No upcoming court dates</p>}
              {upcomingCourtDates.map(c => (
                <div key={c.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-700/30 border border-slate-700/50">
                  <div className="bg-blue-900/40 rounded-lg p-2 text-center min-w-[36px]">
                    <p className="text-xs font-bold text-blue-400">{fmt.date(c.dateTime).split(' ')[0]}</p>
                    <p className="text-[10px] text-slate-400">{fmt.date(c.dateTime).split(' ')[1]}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-200 truncate">{c.title}</p>
                    <p className="text-xs text-slate-500 truncate">{c.court}</p>
                    <p className="text-xs text-slate-400">{fmt.time(c.dateTime)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Time Entries */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-slate-400" />
            <h3 className="font-semibold text-slate-200 text-sm">Recent Time Entries</h3>
          </div>
          <button onClick={() => navigate('/time')} className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
            Record time <ArrowRight size={12} />
          </button>
        </div>
        <div className="table-wrapper">
          <table className="table">
            <thead><tr><th>Description</th><th>Matter</th><th>Fee Earner</th><th>Hours</th><th>Value</th><th>Date</th></tr></thead>
            <tbody>
              {recentTimeEntries.map(e => (
                <tr key={e.id}>
                  <td className="max-w-[200px] truncate">{e.description}</td>
                  <td className="text-xs text-slate-400">{e.matter?.matterNo}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Avatar name={e.user?.name || ''} size="sm" />
                      <span className="text-xs">{e.user?.name}</span>
                    </div>
                  </td>
                  <td className="font-mono text-brand-400">{fmt.hours(e.hours)}</td>
                  <td className="font-mono text-emerald-400">{fmt.naira(e.hours * e.rate)}</td>
                  <td className="text-slate-400">{fmt.date(e.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
