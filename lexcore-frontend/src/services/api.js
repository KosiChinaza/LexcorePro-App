import axios from 'axios';
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    headers: { 'Content-Type': 'application/json' },
    timeout: 30000,
    withCredentials: false,
});
// ─── Attach token to every request ────────────────────────────────────────
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('lexcore_token');
    if (token)
        config.headers.Authorization = `Bearer ${token}`;
    return config;
});
// ─── Handle 401 — but NOT on /auth/login (avoid redirect loops) ───────────
api.interceptors.response.use((res) => res, (error) => {
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
});
export { api };
export default api;
// ─── Auth ─────────────────────────────────────────────────────────────────
export const authService = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    logout: () => api.post('/auth/logout'),
    me: () => api.get('/auth/me'),
    signupRequest: (data) => api.post('/auth/signup-request', data),
    verifyCode: (data) => api.post('/auth/verify-code', data),
};
export const usersService = {
    list: () => api.get('/users'),
    get: (id) => api.get(`/users/${id}`),
    update: (id, data) => api.put(`/users/${id}`, data),
    updatePassword: (id, data) => api.put(`/users/${id}/password`, data),
    deactivate: (id) => api.delete(`/users/${id}`),
    createUser: (data) => api.post('/users', data),
    pendingRequests: () => api.get('/users/admin/pending-requests'),
    approveRequest: (id) => api.post(`/users/admin/pending-requests/${id}/approve`),
    rejectRequest: (id) => api.post(`/users/admin/pending-requests/${id}/reject`),
    validationCodes: () => api.get('/users/admin/validation-codes'),
    sessions: () => api.get('/users/admin/sessions'),
};
// ─── Matters ──────────────────────────────────────────────────────────────
export const mattersService = {
    list: (params) => api.get('/matters', { params }),
    get: (id) => api.get(`/matters/${id}`),
    create: (data) => api.post('/matters', data),
    update: (id, data) => api.put(`/matters/${id}`, data),
    close: (id) => api.delete(`/matters/${id}`),
    addUpdate: (id, content) => api.post(`/matters/${id}/updates`, { content }),
    addTeam: (id, userId, role) => api.post(`/matters/${id}/team`, { userId, role }),
    removeTeam: (id, userId) => api.delete(`/matters/${id}/team/${userId}`),
};
// ─── Clients ──────────────────────────────────────────────────────────────
export const clientsService = {
    list: (params) => api.get('/clients', { params }),
    get: (id) => api.get(`/clients/${id}`),
    create: (data) => api.post('/clients', data),
    update: (id, data) => api.put(`/clients/${id}`, data),
};
// ─── Time Entries ─────────────────────────────────────────────────────────
export const timeEntriesService = {
    list: (params) => api.get('/time-entries', { params }),
    create: (data) => api.post('/time-entries', data),
    update: (id, data) => api.put(`/time-entries/${id}`, data),
    delete: (id) => api.delete(`/time-entries/${id}`),
    summaryByUser: () => api.get('/time-entries/summary/by-user'),
};
// ─── Invoices ─────────────────────────────────────────────────────────────
export const invoicesService = {
    list: (params) => api.get('/invoices', { params }),
    get: (id) => api.get(`/invoices/${id}`),
    create: (data) => api.post('/invoices', data),
    update: (id, data) => api.put(`/invoices/${id}`, data),
    markPaid: (id) => api.post(`/invoices/${id}/pay`),
};
// ─── Documents ────────────────────────────────────────────────────────────
export const documentsService = {
    list: (params) => api.get('/documents', { params }),
    upload: (formData) => api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    download: (id) => `/api/documents/${id}/download`,
    delete: (id) => api.delete(`/documents/${id}`),
};
// ─── Leave ────────────────────────────────────────────────────────────────
export const leaveService = {
    list: () => api.get('/leave'),
    create: (data) => api.post('/leave', data),
    approve: (id, note) => api.post(`/leave/${id}/approve`, { note }),
    reject: (id, note) => api.post(`/leave/${id}/reject`, { note }),
};
// ─── Deadlines ────────────────────────────────────────────────────────────
export const deadlinesService = {
    list: (params) => api.get('/deadlines', { params }),
    create: (data) => api.post('/deadlines', data),
    update: (id, data) => api.put(`/deadlines/${id}`, data),
    delete: (id) => api.delete(`/deadlines/${id}`),
};
// ─── Court Dates ──────────────────────────────────────────────────────────
export const courtDatesService = {
    list: (params) => api.get('/court-dates', { params }),
    create: (data) => api.post('/court-dates', data),
    update: (id, data) => api.put(`/court-dates/${id}`, data),
    delete: (id) => api.delete(`/court-dates/${id}`),
};
// ─── Dashboard ────────────────────────────────────────────────────────────
export const dashboardService = {
    get: () => api.get('/dashboard'),
};
// ─── Settings ─────────────────────────────────────────────────────────────
export const settingsService = {
    get: () => api.get('/settings'),
    update: (data) => api.put('/settings', data),
};
// ─── Audit ────────────────────────────────────────────────────────────────
export const auditService = {
    list: (params) => api.get('/audit', { params }),
};
// ─── Reports ──────────────────────────────────────────────────────────────
export const reportsService = {
    financials: () => api.get('/reports/financials'),
    time: () => api.get('/reports/time'),
    matters: () => api.get('/reports/matters'),
};
