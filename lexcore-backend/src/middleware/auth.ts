import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'fallback-secret';

    const decoded = jwt.verify(token, secret) as { id: string; email: string; role: string };

    // Check session is still valid
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      res.status(401).json({ error: 'Session expired or invalid' });
      return;
    }

    if (session.user.status !== 'active') {
      res.status(403).json({ error: 'Account is inactive' });
      return;
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: session.user.name,
      role: decoded.role,
    };

    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }
  next();
};

export const logAction = async (
  userId: string | undefined,
  action: string,
  entity?: string,
  entityId?: string,
  details?: string,
  ip?: string
) => {
  try {
    await prisma.auditLog.create({
      data: { userId, action, entity, entityId, details, ip },
    });
  } catch {
    // Non-blocking
  }
};
