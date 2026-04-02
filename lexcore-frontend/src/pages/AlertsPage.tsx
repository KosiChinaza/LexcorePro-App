import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, Clock, Scale } from 'lucide-react';
import { deadlinesService, courtDatesService } from '../services/api';
import { Deadline, CourtDate } from '../types';
import { fmt, statusColor, isDueSoon, isOverdue } from '../utils/helpers';
import { PageLoader, toast } from '../components/ui';

const AlertsPage: React.FC = () => {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [courtDates, setCourtDates] = useState<CourtDate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([deadlinesService.list({ upcoming: 'true' }), courtDatesService.list({ upcoming: 'true' })])
      .then(([dl, cd]) => { setDeadlines(dl.data); setCourtDates(cd.data); })
      .finally(() => setLoading(false));
  }, []);

  const handleComplete = async (id: string) => {
    try {
      await deadlinesService.update(id, { status: 'completed' });
      setDeadlines(prev => prev.map(d => d.id === id ? { ...d, status: 'completed' as const } : d));
      toast.success('Marked as complete');
    } catch { toast.error('Failed to update'); }
  };

  const urgent = deadlines.filter(d => d.priority === 'urgent' && d.status === 'pending');
  const dueSoon = deadlines.filter(d => isDueSoon(d.dueDate) && d.priority !== 'urgent' && d.status === 'pending');
  const overdue = deadlines.filter(d => isOverdue(d.dueDate) && d.status === 'pending');
  const upcoming = courtDates.filter(c => c.status === 'scheduled');

  if (loading) return <PageLoader />;

  const AlertSection: React.FC<{ title: string; items: Deadline[]; color: string; icon: React.ReactNode }> = ({ title, items, color, icon }) => {
    if (items.length === 0) return null;
    return (
      <div>
        <div className="flex items-center gap-2 mb-3">
          {icon}
          <h2 className="font-semibold text-slate-200">{title}</h2>
          <span className="badge-gray">{items.length}</span>
        </div>
        <div className="space-y-2">
          {items.map(d => (
            <div key={d.id} className={`card p-4 flex items-center gap-4 border-l-4 ${color}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-slate-200">{d.title}</p>
                  <span className="text-xs text-slate-500 font-mono">{d.matter?.matterNo}</span>
                </div>
                {d.description && <p className="text-slate-400 text-sm mt-0.5 truncate">{d.description}</p>}
                <p className="text-xs text-slate-500 mt-1">{d.matter?.client?.name}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-medium text-sm text-slate-300">{fmt.date(d.dueDate)}</p>
                <p className="text-xs text-slate-500 mt-0.5">{fmt.relative(d.dueDate)}</p>
              </div>
              {d.status === 'pending' && (
                <button onClick={() => handleComplete(d.id)} className="btn-ghost btn-sm text-emerald-400 flex-shrink-0" title="Mark complete">
                  <CheckCircle size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Alerts</h1>
        <p className="page-subtitle">{deadlines.length + courtDates.length} active alerts</p>
      </div>

      {overdue.length === 0 && urgent.length === 0 && dueSoon.length === 0 && upcoming.length === 0 && (
        <div className="card card-body text-center py-16">
          <CheckCircle size={48} className="text-emerald-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-200 mb-2">You're all clear!</h3>
          <p className="text-slate-400">No urgent deadlines or upcoming court dates.</p>
        </div>
      )}

      <AlertSection title="Overdue" items={overdue} color="border-red-600" icon={<AlertTriangle size={18} className="text-red-400" />} />
      <AlertSection title="Urgent Deadlines" items={urgent} color="border-orange-500" icon={<AlertTriangle size={18} className="text-orange-400" />} />
      <AlertSection title="Due Within 3 Days" items={dueSoon} color="border-yellow-500" icon={<Clock size={18} className="text-yellow-400" />} />

      {upcoming.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Scale size={18} className="text-blue-400" />
            <h2 className="font-semibold text-slate-200">Upcoming Court Dates</h2>
            <span className="badge-gray">{upcoming.length}</span>
          </div>
          <div className="space-y-2">
            {upcoming.map(c => (
              <div key={c.id} className="card p-4 flex items-center gap-4 border-l-4 border-blue-600">
                <div className="bg-blue-900/40 rounded-xl p-2 text-center min-w-[48px] flex-shrink-0">
                  <p className="text-sm font-bold text-blue-400">{fmt.date(c.dateTime).split(' ')[0]}</p>
                  <p className="text-xs text-slate-400">{fmt.date(c.dateTime).split(' ')[1]}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-200">{c.title}</p>
                  {c.court && <p className="text-slate-400 text-sm">{c.court}</p>}
                  {c.judge && <p className="text-slate-500 text-xs">{c.judge}</p>}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-medium text-sm text-slate-300">{fmt.time(c.dateTime)}</p>
                  <p className="text-xs text-slate-500">{fmt.relative(c.dateTime)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertsPage;
