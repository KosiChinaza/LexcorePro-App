import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin, AuthRequest, logAction } from '../middleware/auth';

const prisma = new PrismaClient();

// ─── LEAVE ROUTER ─────────────────────────────────────────────────────────
export const leaveRouter = Router();
leaveRouter.use(authenticate);

leaveRouter.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const isAdmin = req.user?.role === 'admin';
    const where = isAdmin ? {} : { userId: req.user?.id };
    const requests = await prisma.leaveRequest.findMany({
      where,
      include: { user: { select: { id: true, name: true, position: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(requests);
  } catch { res.status(500).json({ error: 'Server error' }); }
});

leaveRouter.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type, startDate, endDate, reason } = req.body;
    if (!type || !startDate || !endDate) { res.status(400).json({ error: 'Type, start and end dates required' }); return; }
    const request = await prisma.leaveRequest.create({
      data: { userId: req.user!.id, type, startDate: new Date(startDate), endDate: new Date(endDate), reason },
      include: { user: { select: { name: true } } },
    });
    await logAction(req.user?.id, 'LEAVE_REQUESTED', 'LeaveRequest', request.id);
    res.status(201).json(request);
  } catch { res.status(500).json({ error: 'Server error' }); }
});

leaveRouter.post('/:id/approve', requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const request = await prisma.leaveRequest.update({
      where: { id: req.params.id },
      data: { status: 'approved', reviewedBy: req.user!.name, reviewNote: req.body.note },
    });
    await logAction(req.user?.id, 'LEAVE_APPROVED', 'LeaveRequest', req.params.id);
    res.json(request);
  } catch { res.status(500).json({ error: 'Server error' }); }
});

leaveRouter.post('/:id/reject', requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const request = await prisma.leaveRequest.update({
      where: { id: req.params.id },
      data: { status: 'rejected', reviewedBy: req.user!.name, reviewNote: req.body.note },
    });
    await logAction(req.user?.id, 'LEAVE_REJECTED', 'LeaveRequest', req.params.id);
    res.json(request);
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// ─── DEADLINES ROUTER ─────────────────────────────────────────────────────
export const deadlinesRouter = Router();
deadlinesRouter.use(authenticate);

deadlinesRouter.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { matterId, status, upcoming } = req.query as Record<string, string>;
    const where: Record<string, unknown> = {};
    if (matterId) where.matterId = matterId;
    if (status) where.status = status;
    if (upcoming === 'true') where.dueDate = { gte: new Date() };

    const deadlines = await prisma.deadline.findMany({
      where,
      include: { matter: { include: { client: { select: { name: true } } } } },
      orderBy: { dueDate: 'asc' },
    });
    res.json(deadlines);
  } catch { res.status(500).json({ error: 'Server error' }); }
});

deadlinesRouter.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { matterId, title, description, dueDate, priority } = req.body;
    if (!matterId || !title || !dueDate) { res.status(400).json({ error: 'Matter, title and due date required' }); return; }
    const deadline = await prisma.deadline.create({
      data: { matterId, title, description, dueDate: new Date(dueDate), priority: priority || 'normal' },
      include: { matter: { select: { matterNo: true, title: true } } },
    });
    await logAction(req.user?.id, 'DEADLINE_CREATED', 'Deadline', deadline.id);
    res.status(201).json(deadline);
  } catch { res.status(500).json({ error: 'Server error' }); }
});

deadlinesRouter.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, dueDate, priority, status } = req.body;
    const deadline = await prisma.deadline.update({
      where: { id: req.params.id },
      data: { title, description, dueDate: dueDate ? new Date(dueDate) : undefined, priority, status },
    });
    res.json(deadline);
  } catch { res.status(500).json({ error: 'Server error' }); }
});

deadlinesRouter.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.deadline.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deadline deleted' });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// ─── COURT DATES ROUTER ───────────────────────────────────────────────────
export const courtDatesRouter = Router();
courtDatesRouter.use(authenticate);

courtDatesRouter.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { matterId, upcoming } = req.query as Record<string, string>;
    const where: Record<string, unknown> = {};
    if (matterId) where.matterId = matterId;
    if (upcoming === 'true') where.dateTime = { gte: new Date() };
    const dates = await prisma.courtDate.findMany({
      where,
      include: { matter: { include: { client: { select: { name: true } } } } },
      orderBy: { dateTime: 'asc' },
    });
    res.json(dates);
  } catch { res.status(500).json({ error: 'Server error' }); }
});

courtDatesRouter.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { matterId, title, court, judge, dateTime, notes } = req.body;
    if (!matterId || !title || !dateTime) { res.status(400).json({ error: 'Matter, title and date required' }); return; }
    const courtDate = await prisma.courtDate.create({
      data: { matterId, title, court, judge, dateTime: new Date(dateTime), notes },
      include: { matter: { select: { matterNo: true, title: true } } },
    });
    await logAction(req.user?.id, 'COURT_DATE_CREATED', 'CourtDate', courtDate.id);
    res.status(201).json(courtDate);
  } catch { res.status(500).json({ error: 'Server error' }); }
});

courtDatesRouter.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, court, judge, dateTime, notes, status } = req.body;
    const cd = await prisma.courtDate.update({
      where: { id: req.params.id },
      data: { title, court, judge, dateTime: dateTime ? new Date(dateTime) : undefined, notes, status },
    });
    res.json(cd);
  } catch { res.status(500).json({ error: 'Server error' }); }
});

courtDatesRouter.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.courtDate.delete({ where: { id: req.params.id } });
    res.json({ message: 'Court date deleted' });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// ─── DASHBOARD ROUTER ─────────────────────────────────────────────────────
export const dashboardRouter = Router();
dashboardRouter.use(authenticate);

dashboardRouter.get('/', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalMatters, activeMatters, urgentMatters,
      totalClients, pendingInvoices,
      recentMatters, upcomingDeadlines, upcomingCourtDates,
      monthRevenue, allRevenue, recentTimeEntries,
      pendingLeave,
    ] = await Promise.all([
      prisma.matter.count(),
      prisma.matter.count({ where: { status: 'active' } }),
      prisma.matter.count({ where: { status: 'urgent' } }),
      prisma.client.count(),
      prisma.invoice.findMany({ where: { status: { in: ['sent', 'overdue'] } }, select: { total: true } }),
      prisma.matter.findMany({
        take: 5, orderBy: { updatedAt: 'desc' },
        include: { client: { select: { name: true } }, _count: { select: { timeEntries: true } } },
      }),
      prisma.deadline.findMany({
        where: { dueDate: { gte: now }, status: 'pending' },
        take: 5, orderBy: { dueDate: 'asc' },
        include: { matter: { select: { matterNo: true, title: true } } },
      }),
      prisma.courtDate.findMany({
        where: { dateTime: { gte: now }, status: 'scheduled' },
        take: 5, orderBy: { dateTime: 'asc' },
        include: { matter: { select: { matterNo: true, title: true } } },
      }),
      prisma.invoice.aggregate({ where: { status: 'paid', paidDate: { gte: startOfMonth } }, _sum: { total: true } }),
      prisma.invoice.aggregate({ where: { status: 'paid' }, _sum: { total: true } }),
      prisma.timeEntry.findMany({
        take: 5, orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true } },
          matter: { select: { matterNo: true, title: true } },
        },
      }),
      prisma.leaveRequest.count({ where: { status: 'pending' } }),
    ]);

    res.json({
      stats: {
        totalMatters,
        activeMatters,
        urgentMatters,
        totalClients,
        pendingInvoicesAmount: pendingInvoices.reduce((s, i) => s + i.total, 0),
        pendingInvoicesCount: pendingInvoices.length,
        monthRevenue: monthRevenue._sum.total || 0,
        totalRevenue: allRevenue._sum.total || 0,
        pendingLeave,
      },
      recentMatters,
      upcomingDeadlines,
      upcomingCourtDates,
      recentTimeEntries,
    });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
});

// ─── SETTINGS ROUTER ──────────────────────────────────────────────────────
export const settingsRouter = Router();
settingsRouter.use(authenticate);

settingsRouter.get('/', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const settings = await prisma.firmSetting.findMany();
    const obj: Record<string, string> = {};
    settings.forEach(s => { obj[s.key] = s.value; });
    res.json(obj);
  } catch { res.status(500).json({ error: 'Server error' }); }
});

settingsRouter.put('/', requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const updates = req.body as Record<string, string>;
    for (const [key, value] of Object.entries(updates)) {
      await prisma.firmSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
    }
    await logAction(req.user?.id, 'SETTINGS_UPDATED', 'FirmSettings');
    res.json({ message: 'Settings updated' });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// ─── AUDIT ROUTER ─────────────────────────────────────────────────────────
export const auditRouter = Router();
auditRouter.use(authenticate, requireAdmin);

auditRouter.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '50', userId, action } = req.query as Record<string, string>;
    const skip = (Number(page) - 1) * Number(limit);
    const where: Record<string, unknown> = {};
    if (userId) where.userId = userId;
    if (action) where.action = { contains: action };

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where, skip, take: Number(limit),
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.auditLog.count({ where }),
    ]);

    res.json({ data: logs, total, page: Number(page) });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// ─── REPORTS ROUTER ───────────────────────────────────────────────────────
export const reportsRouter = Router();
reportsRouter.use(authenticate);

reportsRouter.get('/financials', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const invoices = await prisma.invoice.findMany({ include: { matter: { select: { type: true } } } });
    const byStatus = invoices.reduce((acc: Record<string, number>, inv) => {
      acc[inv.status] = (acc[inv.status] || 0) + inv.total;
      return acc;
    }, {});
    const byType = invoices.reduce((acc: Record<string, number>, inv) => {
      acc[inv.matter.type] = (acc[inv.matter.type] || 0) + inv.total;
      return acc;
    }, {});
    res.json({ byStatus, byType, total: invoices.reduce((s, i) => s + i.total, 0) });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

reportsRouter.get('/time', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const entries = await prisma.timeEntry.findMany({
      include: {
        user: { select: { name: true } },
        matter: { select: { type: true, matterNo: true } },
      },
    });
    const byUser = entries.reduce((acc: Record<string, { name: string; hours: number; value: number }>, e) => {
      if (!acc[e.userId]) acc[e.userId] = { name: e.user.name, hours: 0, value: 0 };
      acc[e.userId].hours += e.hours;
      acc[e.userId].value += e.hours * e.rate;
      return acc;
    }, {});
    res.json({ byUser: Object.values(byUser), totalHours: entries.reduce((s, e) => s + e.hours, 0) });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

reportsRouter.get('/matters', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const matters = await prisma.matter.findMany({ select: { type: true, status: true } });
    const byType = matters.reduce((acc: Record<string, number>, m) => { acc[m.type] = (acc[m.type] || 0) + 1; return acc; }, {});
    const byStatus = matters.reduce((acc: Record<string, number>, m) => { acc[m.status] = (acc[m.status] || 0) + 1; return acc; }, {});
    res.json({ byType, byStatus, total: matters.length });
  } catch { res.status(500).json({ error: 'Server error' }); }
});
