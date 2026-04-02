// Must be very first thing — load env before anything else
import 'dotenv/config';

import fs from 'fs';
import path from 'path';
import express from 'express';
import cors from 'cors';

import { authRouter } from './routes/auth';
import { usersRouter } from './routes/users';
import { mattersRouter } from './routes/matters';
import { clientsRouter } from './routes/clients';
import { timeEntriesRouter } from './routes/timeEntries';
import { invoicesRouter } from './routes/invoices';
import { documentsRouter } from './routes/documents';
import { leaveRouter } from './routes/leave';
import { deadlinesRouter } from './routes/deadlines';
import { courtDatesRouter } from './routes/courtDates';
import { dashboardRouter } from './routes/dashboard';
import { settingsRouter } from './routes/settings';
import { auditRouter } from './routes/audit';
import { reportsRouter } from './routes/reports';
import { researchRouter } from './routes/research';

// ─── Ensure uploads directory exists ──────────────────────────────────────
const uploadsDir = path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// ─── CORS ─────────────────────────────────────────────────────────────────
// origin: true reflects the request Origin back — works for all origins in dev.
// In production set FRONTEND_URL and restrict if desired.
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Body Parsers ─────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Static Uploads ───────────────────────────────────────────────────────
app.use('/uploads', express.static(uploadsDir));

// ─── API Routes ───────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/matters', mattersRouter);
app.use('/api/clients', clientsRouter);
app.use('/api/time-entries', timeEntriesRouter);
app.use('/api/invoices', invoicesRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/leave', leaveRouter);
app.use('/api/deadlines', deadlinesRouter);
app.use('/api/court-dates', courtDatesRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/audit', auditRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/research', researchRouter);

// ─── Health Check ─────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    app: 'LexCore Pro API',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    db: process.env.DATABASE_URL ? 'configured' : 'NOT SET',
  });
});

// ─── 404 ──────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('❌ Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// ─── Start Server ─────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('\n🏛️  LexCore Pro — Peters & Associates');
  console.log(`📡 API:     http://localhost:${PORT}/api`);
  console.log(`🔍 Health:  http://localhost:${PORT}/health`);

  if (!process.env.DATABASE_URL) {
    console.error('\n❌ FATAL: DATABASE_URL is not set!');
    console.error('   Run:  cp .env.example .env   then restart.\n');
  } else {
    console.log(`🗄️  DB:     ${process.env.DATABASE_URL.replace(/\/\/.*@/, '//***@')}`);
    console.log('\nFirst time? Run: npm run db:push && npm run db:seed\n');
  }
});

export default app;
