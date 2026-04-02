import React, { useEffect, useState, useCallback } from 'react';
import { BookOpen, Plus, CheckCircle, Clock, Trash2 } from 'lucide-react';
import api from '../services/api';
import { Matter } from '../types';
import { fmt } from '../utils/helpers';
import { PageLoader, EmptyState, Modal, ConfirmModal, PriorityDot, toast } from '../components/ui';

interface ResearchTask {
  id: string;
  title: string;
  description?: string;
  matterId?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: string;
  dueDate?: string;
  result?: string;
  createdAt: string;
  matter?: { matterNo: string; title: string };
}

const ResearchPage: React.FC = () => {
  const [tasks, setTasks] = useState<ResearchTask[]>([]);
  const [matters, setMatters] = useState<Matter[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [resultId, setResultId] = useState<string | null>(null);
  const [resultText, setResultText] = useState('');
  const [form, setForm] = useState({ title: '', description: '', matterId: '', priority: 'normal', dueDate: '' });

  const load = useCallback(async () => {
    const [tasksRes, mattersRes] = await Promise.all([
      api.get('/research'),
      api.get('/matters?limit=100'),
    ]);
    setTasks(tasksRes.data);
    setMatters(mattersRes.data.data || []);
  }, []);

  useEffect(() => { setLoading(true); load().finally(() => setLoading(false)); }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/research', form);
      await load();
      setShowCreate(false);
      setForm({ title: '', description: '', matterId: '', priority: 'normal', dueDate: '' });
      toast.success('Research task created');
    } catch { toast.error('Failed to create task'); }
    finally { setCreating(false); }
  };

  const handleStatus = async (id: string, status: string) => {
    try { await api.put(`/research/${id}`, { status }); await load(); toast.success('Updated'); }
    catch { toast.error('Failed to update'); }
  };

  const handleSaveResult = async () => {
    if (!resultId) return;
    try {
      await api.put(`/research/${resultId}`, { result: resultText, status: 'completed' });
      await load(); setResultId(null); setResultText('');
      toast.success('Result saved and task completed');
    } catch { toast.error('Failed to save'); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/research/${deleteId}`);
      setTasks(p => p.filter(t => t.id !== deleteId)); setDeleteId(null);
      toast.success('Deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const pending = tasks.filter(t => t.status === 'pending');
  const inProgress = tasks.filter(t => t.status === 'in_progress');
  const completed = tasks.filter(t => t.status === 'completed');

  if (loading) return <PageLoader />;

  const TaskCard = ({ task }: { task: ResearchTask }) => (
    <div className="card p-4 hover:border-slate-600 transition-colors">
      <div className="flex items-start gap-3">
        <PriorityDot priority={task.priority} />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-slate-200 text-sm">{task.title}</p>
          {task.matter && <p className="text-xs text-slate-500 font-mono mt-0.5">{task.matter.matterNo}</p>}
          {task.description && <p className="text-xs text-slate-400 mt-1 leading-relaxed">{task.description}</p>}
          {task.result && (
            <div className="mt-2 p-2 bg-emerald-900/20 border border-emerald-800/40 rounded-lg">
              <p className="text-xs text-emerald-400 font-medium mb-0.5">Result</p>
              <p className="text-xs text-slate-300">{task.result}</p>
            </div>
          )}
          {task.dueDate && (
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <Clock size={11} /> Due {fmt.date(task.dueDate)}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1 flex-shrink-0">
          {task.status === 'pending' && (
            <button onClick={() => handleStatus(task.id, 'in_progress')} className="text-xs text-blue-400 hover:text-blue-300">Start</button>
          )}
          {task.status === 'in_progress' && (
            <button onClick={() => { setResultId(task.id); setResultText(task.result || ''); }}
              className="text-xs text-emerald-400 hover:text-emerald-300">Complete</button>
          )}
          <button onClick={() => setDeleteId(task.id)} className="text-red-500 hover:text-red-400 mt-1">
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Research</h1>
          <p className="page-subtitle">{tasks.length} task{tasks.length !== 1 ? 's' : ''} · {inProgress.length} in progress</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary"><Plus size={16} /> New Task</button>
      </div>

      {tasks.length === 0 ? (
        <div className="card card-body">
          <EmptyState icon={<BookOpen size={48} />} title="No research tasks yet"
            description="Create and track legal research tasks linked to matters."
            action={<button onClick={() => setShowCreate(true)} className="btn-primary">Create First Task</button>} />
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-slate-500" />
              <h3 className="text-sm font-semibold text-slate-300">Pending</h3>
              <span className="badge-gray ml-auto">{pending.length}</span>
            </div>
            {pending.length === 0 && <div className="card p-4 text-center text-slate-600 text-sm">No pending tasks</div>}
            {pending.map(t => <TaskCard key={t.id} task={t} />)}
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <h3 className="text-sm font-semibold text-slate-300">In Progress</h3>
              <span className="badge-blue ml-auto">{inProgress.length}</span>
            </div>
            {inProgress.length === 0 && <div className="card p-4 text-center text-slate-600 text-sm">None in progress</div>}
            {inProgress.map(t => <TaskCard key={t.id} task={t} />)}
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <h3 className="text-sm font-semibold text-slate-300">Completed</h3>
              <span className="badge-green ml-auto">{completed.length}</span>
            </div>
            {completed.length === 0 && <div className="card p-4 text-center text-slate-600 text-sm">No completed tasks</div>}
            {completed.map(t => <TaskCard key={t.id} task={t} />)}
          </div>
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Research Task"
        footer={<><button onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button><button form="research-form" type="submit" className="btn-primary" disabled={creating}>{creating ? 'Creating…' : 'Create Task'}</button></>}>
        <form id="research-form" onSubmit={handleCreate} className="space-y-4">
          <div className="form-group"><label className="label">Title *</label>
            <input className="input" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Research CITA exemption provisions" /></div>
          <div className="form-group"><label className="label">Linked Matter</label>
            <select className="select" value={form.matterId} onChange={e => setForm(f => ({ ...f, matterId: e.target.value }))}>
              <option value="">No matter linked</option>
              {matters.map(m => <option key={m.id} value={m.id}>{m.matterNo} — {m.title}</option>)}
            </select></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group"><label className="label">Priority</label>
              <select className="select" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                {['low', 'normal', 'high', 'urgent'].map(p => <option key={p} value={p}>{p}</option>)}
              </select></div>
            <div className="form-group"><label className="label">Due Date</label>
              <input type="date" className="input" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} /></div>
          </div>
          <div className="form-group"><label className="label">Description</label>
            <textarea className="input resize-none" rows={3} value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What needs to be researched?" /></div>
        </form>
      </Modal>

      <Modal open={!!resultId} onClose={() => { setResultId(null); setResultText(''); }} title="Record Research Result"
        footer={<><button onClick={() => { setResultId(null); setResultText(''); }} className="btn-secondary">Cancel</button><button onClick={handleSaveResult} className="btn-primary"><CheckCircle size={14} /> Save & Complete</button></>}>
        <div className="space-y-3">
          <p className="text-slate-400 text-sm">Record findings for this research task.</p>
          <textarea className="input resize-none" rows={6} value={resultText}
            onChange={e => setResultText(e.target.value)} placeholder="Summarise the research findings, relevant cases, statutes, or conclusions…" />
        </div>
      </Modal>

      <ConfirmModal open={!!deleteId} title="Delete Task" message="Delete this research task permanently?" danger
        onConfirm={handleDelete} onClose={() => setDeleteId(null)} confirmLabel="Delete" />
    </div>
  );
};

export default ResearchPage;
