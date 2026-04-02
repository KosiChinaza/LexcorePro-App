import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin, AuthRequest, logAction } from '../middleware/auth';
import { sendActivationEmail, sendDirectInviteEmail } from '../utils/email';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
const prisma = new PrismaClient();

// All routes require authentication
router.use(authenticate);

// ─── GET /api/users ───────────────────────────────────────────────────────
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, position: true, phone: true, status: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });
    res.json(users);
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// ─── POST /api/users (admin direct-create) ───────────────────────────────
// Admin fills name, email, role, position, phone.
// System creates a PendingRequest (approved), generates a code, emails the user.
// User clicks the link → /activate page → sets password → can log in.
router.post('/', requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, role, position, phone } = req.body;

    if (!name || !email) {
      res.status(400).json({ error: 'Name and email are required' });
      return;
    }

    const normalizedEmail = email.toLowerCase();

    // Check no existing user
    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      res.status(409).json({ error: 'A user with this email already exists' });
      return;
    }

    // Upsert PendingRequest as already-approved (skip the request step)
    await prisma.pendingRequest.upsert({
      where: { email: normalizedEmail },
      update: { name, phone: phone || '', position: position || '', status: 'approved' },
      create: { name, email: normalizedEmail, phone: phone || '', position: position || '', status: 'approved' },
    });

    // Generate activation code
    const code = uuidv4().replace(/-/g, '').substring(0, 6).toUpperCase();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 3); // 3 days to activate

    // Invalidate any previous unused codes for this email
    await prisma.validationCode.updateMany({
      where: { email: normalizedEmail, used: false },
      data: { used: true },
    });

    await prisma.validationCode.create({
      data: { email: normalizedEmail, code, expiresAt },
    });

    // Send invite email — non-blocking, we still respond even if email fails
    let emailSent = true;
    try {
      await sendDirectInviteEmail({
        to: normalizedEmail,
        name,
        code,
        expiresAt,
        role: role || 'staff',
      });
    } catch (emailErr) {
      console.error('⚠️  Email send failed (user still created):', emailErr);
      emailSent = false;
    }

    await logAction(req.user?.id, 'USER_INVITED', 'PendingRequest', normalizedEmail, `Invited as ${role || 'staff'}`);

    res.status(201).json({
      message: emailSent
        ? `Invitation sent to ${normalizedEmail}`
        : `User created but email failed — share this code manually`,
      code,          // always return code so admin can share manually if email fails
      email: normalizedEmail,
      expiresAt,
      emailSent,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── GET /api/users/:id ───────────────────────────────────────────────────
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: { id: true, email: true, name: true, role: true, position: true, phone: true, status: true, createdAt: true },
    });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    res.json(user);
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// ─── PUT /api/users/:id ───────────────────────────────────────────────────
router.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const isSelf = req.user?.id === req.params.id;
    const isAdmin = req.user?.role === 'admin';
    if (!isSelf && !isAdmin) { res.status(403).json({ error: 'Forbidden' }); return; }

    const { name, phone, position, role, status } = req.body;
    const data: Record<string, unknown> = { name, phone, position };
    if (isAdmin) { if (role) data.role = role; if (status) data.status = status; }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data,
      select: { id: true, email: true, name: true, role: true, position: true, phone: true, status: true },
    });

    await logAction(req.user?.id, 'USER_UPDATED', 'User', user.id);
    res.json(user);
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// ─── PUT /api/users/:id/password ─────────────────────────────────────────
router.put('/:id/password', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.id !== req.params.id && req.user?.role !== 'admin') {
      res.status(403).json({ error: 'Forbidden' }); return;
    }
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' }); return;
    }
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }

    if (req.user?.role !== 'admin') {
      const valid = await bcrypt.compare(currentPassword, user.password);
      if (!valid) { res.status(400).json({ error: 'Current password is incorrect' }); return; }
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: req.params.id }, data: { password: hashed } });
    await logAction(req.user?.id, 'PASSWORD_CHANGED', 'User', req.params.id);
    res.json({ message: 'Password updated successfully' });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// ─── DELETE /api/users/:id (admin only) ──────────────────────────────────
router.delete('/:id', requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.id === req.params.id) { res.status(400).json({ error: 'Cannot delete your own account' }); return; }
    await prisma.user.update({ where: { id: req.params.id }, data: { status: 'inactive' } });
    await logAction(req.user?.id, 'USER_DEACTIVATED', 'User', req.params.id);
    res.json({ message: 'User deactivated' });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// ─── GET /api/users/admin/pending-requests ────────────────────────────────
router.get('/admin/pending-requests', requireAdmin, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const requests = await prisma.pendingRequest.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'desc' },
    });
    res.json(requests);
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// ─── POST /api/users/admin/pending-requests/:id/approve ──────────────────
router.post('/admin/pending-requests/:id/approve', requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const request = await prisma.pendingRequest.findUnique({ where: { id: req.params.id } });
    if (!request) { res.status(404).json({ error: 'Request not found' }); return; }

    await prisma.pendingRequest.update({ where: { id: req.params.id }, data: { status: 'approved' } });

    // Generate 6-char validation code
    const code = uuidv4().replace(/-/g, '').substring(0, 6).toUpperCase();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 3);

    // Invalidate any previous unused codes for this email
    await prisma.validationCode.updateMany({
      where: { email: request.email, used: false },
      data: { used: true },
    });

    await prisma.validationCode.create({
      data: { email: request.email, code, expiresAt },
    });

    // Send activation email — non-blocking
    let emailSent = true;
    try {
      await sendActivationEmail({
        to: request.email,
        name: request.name,
        code,
        expiresAt,
      });
    } catch (emailErr) {
      console.error('⚠️  Email send failed:', emailErr);
      emailSent = false;
    }

    await logAction(req.user?.id, 'REQUEST_APPROVED', 'PendingRequest', req.params.id, `Code: ${code}`);
    res.json({ message: 'Request approved', code, email: request.email, expiresAt, emailSent });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// ─── POST /api/users/admin/pending-requests/:id/reject ───────────────────
router.post('/admin/pending-requests/:id/reject', requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.pendingRequest.update({ where: { id: req.params.id }, data: { status: 'rejected' } });
    await logAction(req.user?.id, 'REQUEST_REJECTED', 'PendingRequest', req.params.id);
    res.json({ message: 'Request rejected' });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// ─── GET /api/users/admin/validation-codes ───────────────────────────────
router.get('/admin/validation-codes', requireAdmin, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const codes = await prisma.validationCode.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(codes);
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// ─── GET /api/users/admin/sessions ───────────────────────────────────────
router.get('/admin/sessions', requireAdmin, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sessions = await prisma.session.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    res.json(sessions);
  } catch { res.status(500).json({ error: 'Server error' }); }
});

export { router as usersRouter };