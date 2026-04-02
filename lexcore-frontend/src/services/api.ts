import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
  withCredentials: false,
});

// ─── Attach token to every request ────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lexcore_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Handle 401 — but NOT on /auth/login (avoid redirect loops) ───────────
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const url = error.config?.url || '';
    const isAuthRoute = url.includes('/auth/login') || url.includes('/auth/signup') || url.includes('/auth/verify');
    if (error.response?.status === 401 && !isAuthRoute) {
      localStorage.removeItem('lexcore_token');
      localStorage.removeItem('lexcore_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export { api };
export default api;

// ─── Auth ─────────────────────────────────────────────────────────────────
export const authService = {
  login:         (email: string, password: string) => api.post('/auth/login', { email, password }),
  logout:        ()                                 => api.post('/auth/logout'),
  me:            ()                                 => api.get('/auth/me'),
  signupRequest: (data: { name: string; email: string; phone?: string; position?: string }) =>
                   api.post('/auth/signup-request', data),
  verifyCode:    (data: { email: string; code: string; password: string }) =>
                   api.post('/auth/verify-code', data),
};

// ─── Users ────────────────────────────────────────────────────────────────
export interface CreateUserPayload {
  name: string;
  email: string;
  role: string;
  position?: string;
  phone?: string;
}

export const usersService = {
  list:            ()                                          => api.get('/users'),
  get:             (id: string)                               => api.get(`/users/${id}`),
  update:          (id: string, data: Record<string, unknown>) => api.put(`/users/${id}`, data),
  updatePassword:  (id: string, data: { currentPassword?: string; newPassword: string }) =>
                     api.put(`/users/${id}/password`, data),
  deactivate:      (id: string)                               => api.delete(`/users/${id}`),
  createUser:      (data: CreateUserPayload)                  => api.post('/users', data),
  pendingRequests: ()                                         => api.get('/users/admin/pending-requests'),
  approveRequest:  (id: string)                               => api.post(`/users/admin/pending-requests/${id}/approve`),
  rejectRequest:   (id: string)                               => api.post(`/users/admin/pending-requests/${id}/reject`),
  validationCodes: ()                                         => api.get('/users/admin/validation-codes'),
  sessions:        ()                                         => api.get('/users/admin/sessions'),
};

// ─── Matters ──────────────────────────────────────────────────────────────
export const mattersService = {
  list:       (params?: Record<string, string>)           => api.get('/matters', { params }),
  get:        (id: string)                                => api.get(`/matters/${id}`),
  create:     (data: Record<string, unknown>)             => api.post('/matters', data),
  update:     (id: string, data: Record<string, unknown>) => api.put(`/matters/${id}`, data),
  close:      (id: string)                                => api.delete(`/matters/${id}`),
  addUpdate:  (id: string, content: string)               => api.post(`/matters/${id}/updates`, { content }),
  addTeam:    (id: string, userId: string, role?: string) => api.post(`/matters/${id}/team`, { userId, role }),
  removeTeam: (id: string, userId: string)                => api.delete(`/matters/${id}/team/${userId}`),
};

// ─── Clients ──────────────────────────────────────────────────────────────
export const clientsService = {
  list:   (params?: Record<string, string>)           => api.get('/clients', { params }),
  get:    (id: string)                                => api.get(`/clients/${id}`),
  create: (data: Record<string, unknown>)             => api.post('/clients', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/clients/${id}`, data),
};

// ─── Time Entries ─────────────────────────────────────────────────────────
export const timeEntriesService = {
  list:          (params?: Record<string, string>)           => api.get('/time-entries', { params }),
  create:        (data: Record<string, unknown>)             => api.post('/time-entries', data),
  update:        (id: string, data: Record<string, unknown>) => api.put(`/time-entries/${id}`, data),
  delete:        (id: string)                                => api.delete(`/time-entries/${id}`),
  summaryByUser: ()                                          => api.get('/time-entries/summary/by-user'),
};

// ─── Invoices ─────────────────────────────────────────────────────────────
export const invoicesService = {
  list:     (params?: Record<string, string>)           => api.get('/invoices', { params }),
  get:      (id: string)                                => api.get(`/invoices/${id}`),
  create:   (data: Record<string, unknown>)             => api.post('/invoices', data),
  update:   (id: string, data: Record<string, unknown>) => api.put(`/invoices/${id}`, data),
  markPaid: (id: string)                                => api.post(`/invoices/${id}/pay`),
};

// ─── Documents ────────────────────────────────────────────────────────────
export const documentsService = {
  list:     (params?: Record<string, string>) => api.get('/documents', { params }),
  upload:   (formData: FormData)              => api.post('/documents/upload', formData, {
                                                  headers: { 'Content-Type': 'multipart/form-data' } }),
  download: (id: string)                      => `/api/documents/${id}/download`,
  delete:   (id: string)                      => api.delete(`/documents/${id}`),
};

// ─── Leave ────────────────────────────────────────────────────────────────
export const leaveService = {
  list:    ()                              => api.get('/leave'),
  create:  (data: Record<string, unknown>) => api.post('/leave', data),
  approve: (id: string, note?: string)     => api.post(`/leave/${id}/approve`, { note }),
  reject:  (id: string, note?: string)     => api.post(`/leave/${id}/reject`, { note }),
};

// ─── Deadlines ────────────────────────────────────────────────────────────
export const deadlinesService = {
  list:   (params?: Record<string, string>)           => api.get('/deadlines', { params }),
  create: (data: Record<string, unknown>)             => api.post('/deadlines', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/deadlines/${id}`, data),
  delete: (id: string)                                => api.delete(`/deadlines/${id}`),
};

// ─── Court Dates ──────────────────────────────────────────────────────────
export const courtDatesService = {
  list:   (params?: Record<string, string>)           => api.get('/court-dates', { params }),
  create: (data: Record<string, unknown>)             => api.post('/court-dates', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/court-dates/${id}`, data),
  delete: (id: string)                                => api.delete(`/court-dates/${id}`),
};

// ─── Dashboard ────────────────────────────────────────────────────────────
export const dashboardService = {
  get: () => api.get('/dashboard'),
};

// ─── Settings ─────────────────────────────────────────────────────────────
export const settingsService = {
  get:    ()                             => api.get('/settings'),
  update: (data: Record<string, string>) => api.put('/settings', data),
};

// ─── Audit ────────────────────────────────────────────────────────────────
export const auditService = {
  list: (params?: Record<string, string>) => api.get('/audit', { params }),
};

// ─── Reports ──────────────────────────────────────────────────────────────
export const reportsService = {
  financials: () => api.get('/reports/financials'),
  time:       () => api.get('/reports/time'),
  matters:    () => api.get('/reports/matters'),
};