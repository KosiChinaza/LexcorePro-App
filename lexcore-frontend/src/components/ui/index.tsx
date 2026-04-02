import React from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { getInitials, getAvatarColor } from '../../utils/helpers';

// ─── Badge ────────────────────────────────────────────────────────────────
export const Badge: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = 'badge-gray', children }) => (
  <span className={className}>{children}</span>
);

// ─── Status Badge ─────────────────────────────────────────────────────────
export const StatusBadge: React.FC<{ status: string; colorMap: Record<string, string>; labelMap?: Record<string, string> }> = ({
  status, colorMap, labelMap,
}) => (
  <span className={colorMap[status] || 'badge-gray'}>
    {labelMap?.[status] || status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
  </span>
);

// ─── Avatar ───────────────────────────────────────────────────────────────
export const Avatar: React.FC<{ name: string; size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  name, size = 'md', className = '',
}) => {
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base' };
  return (
    <div className={`${sizes[size]} ${getAvatarColor(name)} rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0 ${className}`}>
      {getInitials(name)}
    </div>
  );
};

// ─── Spinner ──────────────────────────────────────────────────────────────
export const Spinner: React.FC<{ size?: number; className?: string }> = ({ size = 20, className = '' }) => (
  <Loader2 size={size} className={`animate-spin ${className}`} />
);

export const PageLoader: React.FC = () => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <Spinner size={32} className="text-brand-500 mx-auto mb-3" />
      <p className="text-slate-400 text-sm">Loading...</p>
    </div>
  </div>
);

// ─── Empty State ──────────────────────────────────────────────────────────
export const EmptyState: React.FC<{
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    {icon && <div className="text-slate-600 mb-4">{icon}</div>}
    <h3 className="text-slate-300 font-medium mb-1">{title}</h3>
    {description && <p className="text-slate-500 text-sm mb-4 max-w-xs">{description}</p>}
    {action}
  </div>
);

// ─── Confirm Modal ────────────────────────────────────────────────────────
export const ConfirmModal: React.FC<{
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
  loading?: boolean;
}> = ({ open, title, message, confirmLabel = 'Confirm', danger = false, onConfirm, onClose, loading }) => {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal max-w-md" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${danger ? 'bg-red-900/40' : 'bg-slate-700'}`}>
              <AlertTriangle size={18} className={danger ? 'text-red-400' : 'text-slate-300'} />
            </div>
            <h3 className="font-semibold text-slate-100">{title}</h3>
          </div>
          <button onClick={onClose} className="btn-ghost btn-sm p-1.5"><X size={16} /></button>
        </div>
        <div className="modal-body">
          <p className="text-slate-300 text-sm">{message}</p>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={onConfirm} className={danger ? 'btn-danger' : 'btn-primary'} disabled={loading}>
            {loading ? <Spinner size={14} /> : null}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Modal Wrapper ────────────────────────────────────────────────────────
export const Modal: React.FC<{
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}> = ({ open, onClose, title, subtitle, children, footer, maxWidth = 'max-w-lg' }) => {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal ${maxWidth} w-full`} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="font-semibold text-slate-100">{title}</h3>
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="btn-ghost btn-sm p-1.5"><X size={16} /></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

// ─── Search Input ─────────────────────────────────────────────────────────
export const SearchInput: React.FC<{
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}> = ({ value, onChange, placeholder = 'Search...', className = '' }) => (
  <div className={`relative ${className}`}>
    <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="input pl-8"
    />
  </div>
);

// ─── Priority Dot ─────────────────────────────────────────────────────────
export const PriorityDot: React.FC<{ priority: string }> = ({ priority }) => {
  const colors: Record<string, string> = { urgent: 'bg-red-500', high: 'bg-orange-500', normal: 'bg-blue-500', low: 'bg-slate-500' };
  return <span className={`inline-block w-2 h-2 rounded-full ${colors[priority] || 'bg-slate-500'}`} />;
};

// ─── Stat Card ────────────────────────────────────────────────────────────
export const StatCard: React.FC<{
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg?: string;
  sub?: string;
  subColor?: string;
}> = ({ label, value, icon, iconBg = 'bg-slate-700', sub, subColor = 'text-slate-400' }) => (
  <div className="stat-card">
    <div className={`stat-icon ${iconBg}`}>{icon}</div>
    <div className="min-w-0">
      <p className="text-xs text-slate-400 font-medium">{label}</p>
      <p className="text-2xl font-bold text-slate-100 leading-tight mt-0.5">{value}</p>
      {sub && <p className={`text-xs mt-0.5 ${subColor}`}>{sub}</p>}
    </div>
  </div>
);

// ─── Section Header ───────────────────────────────────────────────────────
export const SectionHeader: React.FC<{ title: string; action?: React.ReactNode }> = ({ title, action }) => (
  <div className="flex items-center justify-between mb-4">
    <h3 className="font-semibold text-slate-200 text-sm">{title}</h3>
    {action}
  </div>
);

// ─── Toast Notification ───────────────────────────────────────────────────
interface Toast { id: string; message: string; type: 'success' | 'error' | 'info'; }
let toastFn: ((t: Omit<Toast, 'id'>) => void) | null = null;

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  toastFn = (t) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { ...t, id }]);
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), 3500);
  };
  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border text-sm font-medium animate-slide-in pointer-events-auto
          ${t.type === 'success' ? 'bg-emerald-900 border-emerald-700 text-emerald-100' :
            t.type === 'error' ? 'bg-red-900 border-red-700 text-red-100' :
            'bg-slate-800 border-slate-600 text-slate-100'}`}>
          <span>{t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}</span>
          {t.message}
        </div>
      ))}
    </div>
  );
};

export const toast = {
  success: (message: string) => toastFn?.({ message, type: 'success' }),
  error: (message: string) => toastFn?.({ message, type: 'error' }),
  info: (message: string) => toastFn?.({ message, type: 'info' }),
};
