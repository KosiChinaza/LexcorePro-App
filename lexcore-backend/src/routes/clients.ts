import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin, AuthRequest, logAction } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();
router.use(authenticate);

// ─── GET /api/clients ─────────────────────────────────────────────────────
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search } = req.query as Record<string, string>;
    const where = search
      ? { OR: [{ name: { contains: search } }, { email: { contains: search } }] }
      : {};
    const clients = await prisma.client.findMany({
      where,
      include: { _count: { select: { matters: true } } },
      orderBy: { name: 'asc' },
    });
    res.json(clients);
  } catch { res.status(500).json({ error: 'Server error' }); }
});

router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const client = await prisma.client.findUnique({
      where: { id: req.params.id },
      include: { matters: { include: { _count: { select: { timeEntries: true } } } }, kycDocuments: true },
    });
    if (!client) { res.status(404).json({ error: 'Client not found' }); return; }
    res.json(client);
  } catch { res.status(500).json({ error: 'Server error' }); }
});

router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, phone, address, type } = req.body;
    if (!name) { res.status(400).json({ error: 'Name is required' }); return; }
    const client = await prisma.client.create({ data: { name, email, phone, address, type } });
    await logAction(req.user?.id, 'CLIENT_CREATED', 'Client', client.id, client.name);
    res.status(201).json(client);
  } catch { res.status(500).json({ error: 'Server error' }); }
});

router.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, phone, address, type, kycStatus } = req.body;
    const client = await prisma.client.update({ where: { id: req.params.id }, data: { name, email, phone, address, type, kycStatus } });
    await logAction(req.user?.id, 'CLIENT_UPDATED', 'Client', client.id);
    res.json(client);
  } catch { res.status(500).json({ error: 'Server error' }); }
});

export { router as clientsRouter };
