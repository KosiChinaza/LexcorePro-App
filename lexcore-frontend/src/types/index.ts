// ─── Auth ─────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'staff';
  position?: string;
  phone?: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

// ─── Client ───────────────────────────────────────────────────────────────
export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  type: 'individual' | 'corporate';
  status: string;
  kycStatus: 'pending' | 'verified' | 'rejected';
  createdAt: string;
  _count?: { matters: number };
}

// ─── Matter ───────────────────────────────────────────────────────────────
export type MatterType = 'LIT' | 'CORP' | 'PROP' | 'EMP' | 'TAX' | 'FAM' | 'CRIM';
export type MatterStatus = 'active' | 'closed' | 'urgent' | 'on_hold';
export type Priority = 'low' | 'normal' | 'high' | 'urgent';

export interface MatterTeamMember {
  id: string;
  role: string;
  user: { id: string; name: string; position?: string; email: string };
}

export interface MatterUpdate {
  id: string;
  matterId: string;
  content: string;
  author: string;
  createdAt: string;
}

export interface Matter {
  id: string;
  matterNo: string;
  title: string;
  type: MatterType;
  status: MatterStatus;
  priority: Priority;
  clientId: string;
  description?: string;
  openDate: string;
  closeDate?: string;
  createdAt: string;
  updatedAt: string;
  client: { id: string; name: string; email?: string; phone?: string };
  team: MatterTeamMember[];
  updates?: MatterUpdate[];
  deadlines?: Deadline[];
  courtDates?: CourtDate[];
  invoices?: Invoice[];
  timeEntries?: TimeEntry[];
  documents?: Document[];
  _count?: {
    timeEntries: number;
    documents: number;
    deadlines: number;
    courtDates: number;
    invoices: number;
  };
}

// ─── Time Entry ───────────────────────────────────────────────────────────
export interface TimeEntry {
  id: string;
  matterId: string;
  userId: string;
  description: string;
  hours: number;
  rate: number;
  date: string;
  billed: boolean;
  createdAt: string;
  matter?: { id: string; matterNo: string; title: string };
  user?: { id: string; name: string };
}

// ─── Invoice ──────────────────────────────────────────────────────────────
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export interface Invoice {
  id: string;
  invoiceNo: string;
  matterId: string;
  amount: number;
  vatRate: number;
  vat: number;
  total: number;
  status: InvoiceStatus;
  dueDate?: string;
  paidDate?: string;
  notes?: string;
  createdAt: string;
  matter?: {
    id: string;
    matterNo: string;
    title: string;
    client: { id: string; name: string };
  };
}

// ─── Document ─────────────────────────────────────────────────────────────
export interface Document {
  id: string;
  matterId?: string;
  uploadedBy: string;
  name: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
  category?: string;
  createdAt: string;
  uploader?: { id: string; name: string };
  matter?: { id: string; matterNo: string; title: string };
}

// ─── Deadline ─────────────────────────────────────────────────────────────
export interface Deadline {
  id: string;
  matterId: string;
  title: string;
  description?: string;
  dueDate: string;
  priority: Priority;
  status: 'pending' | 'completed' | 'overdue';
  createdAt: string;
  matter?: { matterNo: string; title: string; client?: { name: string } };
}

// ─── Court Date ───────────────────────────────────────────────────────────
export interface CourtDate {
  id: string;
  matterId: string;
  title: string;
  court?: string;
  judge?: string;
  dateTime: string;
  notes?: string;
  status: 'scheduled' | 'adjourned' | 'concluded' | 'cancelled';
  createdAt: string;
  matter?: { matterNo: string; title: string; client?: { name: string } };
}

// ─── Leave Request ────────────────────────────────────────────────────────
export type LeaveType = 'annual' | 'sick' | 'maternity' | 'paternity' | 'casual' | 'study';

export interface LeaveRequest {
  id: string;
  userId: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewNote?: string;
  createdAt: string;
  user?: { id: string; name: string; position?: string };
}

// ─── Audit Log ────────────────────────────────────────────────────────────
export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  entity?: string;
  entityId?: string;
  details?: string;
  ip?: string;
  createdAt: string;
  user?: { name: string; email: string };
}

// ─── Dashboard ────────────────────────────────────────────────────────────
export interface DashboardStats {
  totalMatters: number;
  activeMatters: number;
  urgentMatters: number;
  totalClients: number;
  pendingInvoicesAmount: number;
  pendingInvoicesCount: number;
  monthRevenue: number;
  totalRevenue: number;
  pendingLeave: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recentMatters: Matter[];
  upcomingDeadlines: Deadline[];
  upcomingCourtDates: CourtDate[];
  recentTimeEntries: TimeEntry[];
}

// ─── Pending Request ──────────────────────────────────────────────────────
export interface PendingRequest {
  id: string;
  name: string;
  email: string;
  phone?: string;
  position?: string;
  status: string;
  createdAt: string;
}

// ─── API Response wrappers ────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface FirmSettings {
  firm_name: string;
  firm_address: string;
  firm_phone: string;
  firm_email: string;
  firm_website: string;
  default_hourly_rate: string;
  vat_rate: string;
  currency: string;
  invoice_prefix: string;
  matter_prefix: string;
}
