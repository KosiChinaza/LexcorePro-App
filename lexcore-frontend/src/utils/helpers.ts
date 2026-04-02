import { format, formatDistanceToNow, isAfter, isBefore, addDays } from 'date-fns';

export const fmt = {
  date: (d: string | Date) => format(new Date(d), 'dd MMM yyyy'),
  dateTime: (d: string | Date) => format(new Date(d), 'dd MMM yyyy, HH:mm'),
  time: (d: string | Date) => format(new Date(d), 'HH:mm'),
  relative: (d: string | Date) => formatDistanceToNow(new Date(d), { addSuffix: true }),
  naira: (n: number) => `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
  nairaFull: (n: number) => `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  hours: (h: number) => `${h.toFixed(1)}h`,
  fileSize: (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  },
};

export const isDueSoon = (date: string, days = 3) =>
  isAfter(new Date(date), new Date()) && isBefore(new Date(date), addDays(new Date(), days));

export const isOverdue = (date: string) => isBefore(new Date(date), new Date());

export const matterTypeLabel: Record<string, string> = {
  LIT: 'Litigation', CORP: 'Corporate', PROP: 'Property',
  EMP: 'Employment', TAX: 'Tax', FAM: 'Family', CRIM: 'Criminal',
};

export const matterTypeColor: Record<string, string> = {
  LIT: 'badge-red', CORP: 'badge-blue', PROP: 'badge-green',
  EMP: 'badge-purple', TAX: 'badge-yellow', FAM: 'badge-blue', CRIM: 'badge-red',
};

export const statusColor: Record<string, string> = {
  active: 'badge-green', urgent: 'badge-red', on_hold: 'badge-yellow',
  closed: 'badge-gray', draft: 'badge-gray', sent: 'badge-blue',
  paid: 'badge-green', overdue: 'badge-red', cancelled: 'badge-gray',
  pending: 'badge-yellow', approved: 'badge-green', rejected: 'badge-red',
  scheduled: 'badge-blue', adjourned: 'badge-yellow', concluded: 'badge-green',
  verified: 'badge-green', individual: 'badge-blue', corporate: 'badge-purple',
};

export const priorityColor: Record<string, string> = {
  urgent: 'text-red-400', high: 'text-orange-400', normal: 'text-blue-400', low: 'text-slate-400',
};

export const priorityDot: Record<string, string> = {
  urgent: 'bg-red-500', high: 'bg-orange-500', normal: 'bg-blue-500', low: 'bg-slate-500',
};

export const leaveTypeLabel: Record<string, string> = {
  annual: 'Annual Leave', sick: 'Sick Leave', maternity: 'Maternity Leave',
  paternity: 'Paternity Leave', casual: 'Casual Leave', study: 'Study Leave',
};

export const getInitials = (name: string) =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

export const avatarColors = [
  'bg-blue-600', 'bg-purple-600', 'bg-emerald-600', 'bg-orange-600',
  'bg-rose-600', 'bg-indigo-600', 'bg-teal-600', 'bg-amber-600',
];

export const getAvatarColor = (name: string) => {
  const idx = name.charCodeAt(0) % avatarColors.length;
  return avatarColors[idx];
};

export const mimeIcon: Record<string, string> = {
  'application/pdf': '📄', 'application/msword': '📝',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
  'application/vnd.ms-excel': '📊',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📊',
  'image/jpeg': '🖼️', 'image/png': '🖼️', 'text/plain': '📃',
};
