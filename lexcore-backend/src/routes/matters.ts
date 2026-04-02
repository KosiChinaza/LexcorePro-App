import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin, AuthRequest, logAction } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();
router.use(authenticate);

const matterIncludes = {
  client: { select: { id: true, name: true, email: true, phone: true } },
  team: { include: { user: { select: { id: true, name: true, position: true, email: true } } } },
  _count: { select: { timeEntries: true, documents: true, deadlines: true, courtDates: true, invoices: true } },
};

// ─── GET /api/matters ─────────────────────────────────────────────────────
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, type, search, page = '1', limit = '20' } = req.query as Record<string, string>;
    const skip = (Number(page) - 1) * Number(limit);

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (search) where.OR = [
      { title: { contains: search } },
      { matterNo: { contains: search } },
      { client: { name: { contains: search } } },
    ];

    const [matters, total] = await Promise.all([
      prisma.matter.findMany({
        where,
        include: matterIncludes,
        orderBy: [{ priority: 'desc' }, { updatedAt: 'desc' }],
        skip,
        take: Number(limit),
      }),
      prisma.matter.count({ where }),
    ]);

    res.json({ data: matters, total, page: Number(page), limit: Number(limit) });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
});

// ─── GET /api/matters/:id ─────────────────────────────────────────────────
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const matter = await prisma.matter.findUnique({
      where: { id: req.params.id },
      include: {
        ...matterIncludes,
        updates: { orderBy: { createdAt: 'desc' }, take: 20 },
        deadlines: { orderBy: { dueDate: 'asc' } },
        courtDates: { orderBy: { dateTime: 'asc' } },
        invoices: { orderBy: { createdAt: 'desc' } },
        timeEntries: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { date: 'desc' },
        },
        documents: {
          include: { uploader: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' },
        },
        research: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!matter) { res.status(404).json({ error: 'Matter not found' }); return; }
    res.json(matter);
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// ─── POST /api/matters ────────────────────────────────────────────────────
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, type, clientId, description, priority, teamIds } = req.body;
    if (!title || !type || !clientId) {
      res.status(400).json({ error: 'Title, type and client are required' }); return;
    }

    // Generate matter number
    const year = new Date().getFullYear();
    const count = await prisma.matter.count();
    const matterNo = `PA/${year}/${type}/${String(count + 1).padStart(4, '0')}`;

    const matter = await prisma.matter.create({
      data: {
        matterNo,
        title,
        type,
        clientId,
        description,
        priority: priority || 'normal',
        team: teamIds?.length ? {
          create: teamIds.map((uid: string) => ({ userId: uid, role: 'member' })),
        } : undefined,
      },
      include: matterIncludes,
    });

    await logAction(req.user?.id, 'MATTER_CREATED', 'Matter', matter.id, `Matter: ${matterNo}`);
    res.status(201).json(matter);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
});

// ─── PUT /api/matters/:id ─────────────────────────────────────────────────
router.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, type, status, priority, description, closeDate } = req.body;
    const matter = await prisma.matter.update({
      where: { id: req.params.id },
      data: { title, type, status, priority, description, closeDate: closeDate ? new Date(closeDate) : undefined },
      include: matterIncludes,
    });
    await logAction(req.user?.id, 'MATTER_UPDATED', 'Matter', matter.id);
    res.json(matter);
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// ─── DELETE /api/matters/:id ──────────────────────────────────────────────
router.delete('/:id', requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.matter.update({ where: { id: req.params.id }, data: { status: 'closed' } });
    await logAction(req.user?.id, 'MATTER_CLOSED', 'Matter', req.params.id);
    res.json({ message: 'Matter closed' });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// ─── Matter Updates ───────────────────────────────────────────────────────
router.get('/:id/updates', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const updates = await prisma.matterUpdate.findMany({
      where: { matterId: req.params.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(updates);
  } catch { res.status(500).json({ error: 'Server error' }); }
});

router.post('/:id/updates', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { content } = req.body;
    if (!content) { res.status(400).json({ error: 'Content is required' }); return; }
    const update = await prisma.matterUpdate.create({
      data: { matterId: req.params.id, content, author: req.user!.name },
    });
    await logAction(req.user?.id, 'MATTER_UPDATE_ADDED', 'Matter', req.params.id);
    res.status(201).json(update);
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// ─── Matter Team ──────────────────────────────────────────────────────────
router.post('/:id/team', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId, role } = req.body;
    const member = await prisma.matterTeam.upsert({
      where: { matterId_userId: { matterId: req.params.id, userId } },
      update: { role },
      create: { matterId: req.params.id, userId, role: role || 'member' },
      include: { user: { select: { id: true, name: true, position: true } } },
    });
    res.json(member);
  } catch { res.status(500).json({ error: 'Server error' }); }
});

router.delete('/:id/team/:userId', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.matterTeam.deleteMany({
      where: { matterId: req.params.id, userId: req.params.userId },
    });
    res.json({ message: 'Team member removed' });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

export { router as mattersRouter };
