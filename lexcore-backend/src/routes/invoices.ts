import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest, logAction } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();
router.use(authenticate);

const invoiceIncludes = {
  matter: { include: { client: { select: { id: true, name: true } } } },
};

router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, matterId } = req.query as Record<string, string>;
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (matterId) where.matterId = matterId;

    const invoices = await prisma.invoice.findMany({
      where,
      include: invoiceIncludes,
      orderBy: { createdAt: 'desc' },
    });
    res.json(invoices);
  } catch { res.status(500).json({ error: 'Server error' }); }
});

router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const invoice = await prisma.invoice.findUnique({ where: { id: req.params.id }, include: invoiceIncludes });
    if (!invoice) { res.status(404).json({ error: 'Invoice not found' }); return; }
    res.json(invoice);
  } catch { res.status(500).json({ error: 'Server error' }); }
});

router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { matterId, amount, dueDate, notes, vatRate = 0.075 } = req.body;
    if (!matterId || !amount) { res.status(400).json({ error: 'Matter and amount required' }); return; }

    const count = await prisma.invoice.count();
    const year = new Date().getFullYear();
    const invoiceNo = `INV-${year}-${String(count + 1).padStart(3, '0')}`;

    const amt = Number(amount);
    const vat = amt * Number(vatRate);
    const total = amt + vat;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNo,
        matterId,
        amount: amt,
        vatRate: Number(vatRate),
        vat,
        total,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        notes,
      },
      include: invoiceIncludes,
    });

    await logAction(req.user?.id, 'INVOICE_CREATED', 'Invoice', invoice.id, `${invoiceNo} — ₦${total.toLocaleString()}`);
    res.status(201).json(invoice);
  } catch { res.status(500).json({ error: 'Server error' }); }
});

router.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, dueDate, notes, amount, vatRate } = req.body;
    const data: Record<string, unknown> = { status, notes };
    if (dueDate) data.dueDate = new Date(dueDate);
    if (status === 'paid') data.paidDate = new Date();
    if (amount) {
      const amt = Number(amount);
      const rate = vatRate ? Number(vatRate) : 0.075;
      data.amount = amt;
      data.vat = amt * rate;
      data.total = amt + (amt * rate);
      data.vatRate = rate;
    }
    const invoice = await prisma.invoice.update({ where: { id: req.params.id }, data, include: invoiceIncludes });
    await logAction(req.user?.id, 'INVOICE_UPDATED', 'Invoice', invoice.id, `Status: ${status}`);
    res.json(invoice);
  } catch { res.status(500).json({ error: 'Server error' }); }
});

router.post('/:id/pay', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const invoice = await prisma.invoice.update({
      where: { id: req.params.id },
      data: { status: 'paid', paidDate: new Date() },
      include: invoiceIncludes,
    });
    await logAction(req.user?.id, 'INVOICE_PAID', 'Invoice', invoice.id);
    res.json(invoice);
  } catch { res.status(500).json({ error: 'Server error' }); }
});

export { router as invoicesRouter };
