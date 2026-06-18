import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const startCronJobs = (): void => {
  // ─── Supabase keep-alive ping ────────────────────────────────────────────
  // Runs every 3 days at 6:00 AM to prevent Supabase free tier from pausing
  // and to keep Render from going fully cold
  cron.schedule('0 */6 * * *', async () => {
    try {
      await prisma.user.count();
      console.log('✅ Keep-alive ping sent —', new Date().toISOString());
    } catch (err) {
      console.error('❌ Keep-alive ping failed:', err);
    }
  });

  console.log('⏰ Cron jobs started');
};