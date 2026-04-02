import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest, logAction } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();
router.use(authenticate);

// GET /api/research
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { matterId, status, assignedTo } = req.query as Record<string, string>;
    const where: Record<string, unknown> = {};
    if (matterId) where.matterId = matterId;
    if (status) where.status = status;
    if (assignedTo) where.assignedTo = assignedTo;

    const tasks = await prisma.researchTask.findMany({
      where,
      include: {
        matter: { select: { id: true, matterNo: true, title: true } },
        assignee: { select: { id: true, name: true } },
      },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    });
    res.json(tasks);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
});

// GET /api/research/:id
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const task = await prisma.researchTask.findUnique({
      where: { id: req.params.id },
      include: {
        matter: { select: { id: true, matterNo: true, title: true } },
        assignee: { select: { id: true, name: true } },
      },
    });
    if (!task) { res.status(404).json({ error: 'Task not found' }); return; }
    res.json(task);
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// POST /api/research
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, matterId, priority, dueDate, assignedTo } = req.body;
    if (!title) { res.status(400).json({ error: 'Title is required' }); return; }

    const task = await prisma.researchTask.create({
      data: {
        title,
        description,
        matterId: matterId || null,
        priority: priority || 'normal',
        dueDate: dueDate ? new Date(dueDate) : null,
        assignedTo: assignedTo || null,
        status: 'pending',
      },
      include: {
        matter: { select: { id: true, matterNo: true, title: true } },
        assignee: { select: { id: true, name: true } },
      },
    });

    await logAction(req.user?.id, 'RESEARCH_CREATED', 'ResearchTask', task.id, task.title);
    res.status(201).json(task);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
});

// PUT /api/research/:id
router.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, status, priority, dueDate, result, assignedTo } = req.body;
    const task = await prisma.researchTask.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(result !== undefined && { result }),
        ...(assignedTo !== undefined && { assignedTo }),
      },
      include: {
        matter: { select: { id: true, matterNo: true, title: true } },
        assignee: { select: { id: true, name: true } },
      },
    });
    await logAction(req.user?.id, 'RESEARCH_UPDATED', 'ResearchTask', task.id);
    res.json(task);
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// DELETE /api/research/:id
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.researchTask.delete({ where: { id: req.params.id } });
    await logAction(req.user?.id, 'RESEARCH_DELETED', 'ResearchTask', req.params.id);
    res.json({ message: 'Research task deleted' });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

export { router as researchRouter };
