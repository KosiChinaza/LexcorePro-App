import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import { authenticate, requireAdmin, AuthRequest, logAction } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();
const prisma = new PrismaClient();
router.use(authenticate);

// ─── GET /api/documents ───────────────────────────────────────────────────
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { matterId, category } = req.query as Record<string, string>;
    const where: Record<string, unknown> = {};
    if (matterId) where.matterId = matterId;
    if (category) where.category = category;

    const docs = await prisma.document.findMany({
      where,
      include: {
        uploader: { select: { id: true, name: true } },
        matter: { select: { id: true, matterNo: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(docs);
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// ─── POST /api/documents/upload ───────────────────────────────────────────
router.post('/upload', upload.single('file'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) { res.status(400).json({ error: 'No file uploaded' }); return; }
    const { matterId, category, name } = req.body;

    const doc = await prisma.document.create({
      data: {
        matterId: matterId || null,
        uploadedBy: req.user!.id,
        name: name || req.file.originalname,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.filename,
        category,
      },
      include: { uploader: { select: { id: true, name: true } } },
    });

    await logAction(req.user?.id, 'DOCUMENT_UPLOADED', 'Document', doc.id, doc.name);
    res.status(201).json(doc);
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// ─── GET /api/documents/:id/download ─────────────────────────────────────
router.get('/:id/download', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const doc = await prisma.document.findUnique({ where: { id: req.params.id } });
    if (!doc) { res.status(404).json({ error: 'Document not found' }); return; }

    const filePath = path.join(__dirname, '../../', process.env.UPLOAD_DIR || 'uploads', doc.path);
    res.download(filePath, doc.originalName);
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// ─── DELETE /api/documents/:id ────────────────────────────────────────────
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const doc = await prisma.document.findUnique({ where: { id: req.params.id } });
    if (!doc) { res.status(404).json({ error: 'Not found' }); return; }
    if (doc.uploadedBy !== req.user?.id && req.user?.role !== 'admin') {
      res.status(403).json({ error: 'Forbidden' }); return;
    }
    await prisma.document.delete({ where: { id: req.params.id } });
    res.json({ message: 'Document deleted' });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

export { router as documentsRouter };
