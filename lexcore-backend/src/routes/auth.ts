import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest, logAction } from '../middleware/auth';
import { sendAdminRequestNotification } from '../utils/email';

const router = Router();
const prisma = new PrismaClient();

// ─── POST /api/auth/login ─────────────────────────────────────────────────
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    if (user.status !== 'active') {
      res.status(403).json({ error: 'Account is inactive. Contact your administrator.' });
      return;
    }

    const secret = process.env.JWT_SECRET || 'fallback-secret';
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, secret, { expiresIn } as jwt.SignOptions);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        expiresAt,
      },
    });

    await logAction(user.id, 'USER_LOGIN', 'User', user.id, 'Login successful', req.ip);

    const { password: _pw, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── POST /api/auth/logout ────────────────────────────────────────────────
router.post('/logout', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      await prisma.session.deleteMany({ where: { token } });
    }
    await logAction(req.user?.id, 'USER_LOGOUT', 'User', req.user?.id);
    res.json({ message: 'Logged out successfully' });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────
router.get('/me', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, email: true, name: true, role: true, position: true, phone: true, status: true, createdAt: true },
    });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(user);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── POST /api/auth/signup-request ───────────────────────────────────────
// Public endpoint — anyone can submit. On success, all admin users are emailed.
router.post('/signup-request', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, position } = req.body;
    if (!name || !email) {
      res.status(400).json({ error: 'Name and email are required' });
      return;
    }

    const normalizedEmail = email.toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      res.status(409).json({ error: 'An account with this email already exists' });
      return;
    }

    const request = await prisma.pendingRequest.upsert({
      where: { email: normalizedEmail },
      update: { name, phone, position, status: 'pending' },
      create: { name, email: normalizedEmail, phone, position },
    });

    // Fetch all active admin emails and notify them — non-blocking
    prisma.user
      .findMany({ where: { role: 'admin', status: 'active' }, select: { email: true } })
      .then((admins) => {
        const adminEmails = admins.map((a) => a.email);
        return sendAdminRequestNotification({
          adminEmails,
          requesterName: name,
          requesterEmail: normalizedEmail,
          requesterPhone: phone,
          requesterPosition: position,
        });
      })
      .catch((err) => console.error('⚠️  Admin notification email failed:', err));

    res.status(201).json({
      message: 'Signup request submitted. You will be notified when approved.',
      id: request.id,
    });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── POST /api/auth/verify-code ───────────────────────────────────────────
// Handles both flows:
//   1. Self-signup: user submitted a request, admin approved it
//   2. Admin direct-invite: admin created the user via POST /api/users
router.post('/verify-code', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, code, password } = req.body;
    if (!email || !code || !password) {
      res.status(400).json({ error: 'Email, code, and password are required' });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }

    const normalizedEmail = email.toLowerCase();

    const vc = await prisma.validationCode.findFirst({
      where: { email: normalizedEmail, code: code.toUpperCase(), used: false },
    });

    if (!vc || vc.expiresAt < new Date()) {
      res.status(400).json({ error: 'Invalid or expired activation code' });
      return;
    }

    const pendingReq = await prisma.pendingRequest.findUnique({ where: { email: normalizedEmail } });
    if (!pendingReq || pendingReq.status !== 'approved') {
      res.status(400).json({ error: 'No approved invitation found for this email' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      res.status(409).json({ error: 'An account with this email already exists. Please log in.' });
      return;
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: pendingReq.name,
        phone: pendingReq.phone || '',
        position: pendingReq.position || '',
        password: hashed,
        role: 'staff',
        status: 'active',
      },
    });

    await prisma.validationCode.update({ where: { id: vc.id }, data: { used: true } });
    await prisma.pendingRequest.update({ where: { email: normalizedEmail }, data: { status: 'activated' } });

    await logAction(user.id, 'USER_ACTIVATED', 'User', user.id, 'Account activated via code');
    res.json({ message: 'Account activated successfully. You can now log in.' });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

export { router as authRouter };