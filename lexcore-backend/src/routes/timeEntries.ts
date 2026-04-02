import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest, logAction } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();
router.use(authenticate);

// ─── GET /api/time-entries ────────────────────────────────────────────────
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { matterId, userId, billed, from, to } = req.query as Record<string, string>;
    const where: Record<string, unknown> = {};
    if (matterId) where.matterId = matterId;
    if (userId) where.userId = userId;
    if (billed !== undefined) where.billed = billed === 'true';
    if (from || to) where.date = { ...(from && { gte: new Date(from) }), ...(to && { lte: new Date(to) }) };

    const entries = await prisma.timeEntry.findMany({
      where,
      include: {
        matter: { select: { id: true, matterNo: true, title: true } },
        user: { select: { id: true, name: true } },
      },
      orderBy: { date: 'desc' },
    });

    const totalHours = entries.reduce((s, e) => s + e.hours, 0);
    const totalValue = entries.reduce((s, e) => s + e.hours * e.rate, 0);

    res.json({ data: entries, totalHours, totalValue });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// ─── POST /api/time-entries ───────────────────────────────────────────────
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { matterId, description, hours, rate, date } = req.body;
    if (!matterId || !description || !hours) {
      res.status(400).json({ error: 'Matter, description and hours are required' }); return;
    }

    const settings = await prisma.firmSetting.findUnique({ where: { key: 'default_hourly_rate' } });
    const defaultRate = settings ? Number(settings.value) : 75000;

    const entry = await prisma.timeEntry.create({
      data: {
        matterId,
        userId: req.user!.id,
        description,
        hours: Number(hours),
        rate: rate ? Number(rate) : defaultRate,
        date: date ? new Date(date) : new Date(),
      },
      include: {
        matter: { select: { id: true, matterNo: true, title: true } },
        user: { select: { id: true, name: true } },
      },
    });

    await logAction(req.user?.id, 'TIME_ENTRY_CREATED', 'TimeEntry', entry.id, `${hours}h on ${entry.matter.matterNo}`);
    res.status(201).json(entry);
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// ─── PUT /api/time-entries/:id ────────────────────────────────────────────
router.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { description, hours, rate, date, billed } = req.body;
    const entry = await prisma.timeEntry.update({
      where: { id: req.params.id },
      data: {
        description,
        hours: hours ? Number(hours) : undefined,
        rate: rate ? Number(rate) : undefined,
        date: date ? new Date(date) : undefined,
        billed,
      },
    });
    res.json(entry);
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// ─── DELETE /api/time-entries/:id ─────────────────────────────────────────
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const entry = await prisma.timeEntry.findUnique({ where: { id: req.params.id } });
    if (!entry) { res.status(404).json({ error: 'Entry not found' }); return; }
    if (entry.userId !== req.user?.id && req.user?.role !== 'admin') {
      res.status(403).json({ error: 'Forbidden' }); return;
    }
    await prisma.timeEntry.delete({ where: { id: req.params.id } });
    res.json({ message: 'Time entry deleted' });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// ─── GET /api/time-entries/summary ────────────────────────────────────────
router.get('/summary/by-user', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const entries = await prisma.timeEntry.findMany({
      include: { user: { select: { id: true, name: true } } },
    });
    const summary: Record<string, { name: string; hours: number; value: number }> = {};
    for (const e of entries) {
      if (!summary[e.userId]) summary[e.userId] = { name: e.user.name, hours: 0, value: 0 };
      summary[e.userId].hours += e.hours;
      summary[e.userId].value += e.hours * e.rate;
    }
    res.json(Object.values(summary));
  } catch { res.status(500).json({ error: 'Server error' }); }
});

export { router as timeEntriesRouter };
