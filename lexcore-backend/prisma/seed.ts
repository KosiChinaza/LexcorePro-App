import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding LexCore database...');

  // ─── Firm Settings ────────────────────────────────────────────────────────
  const settings = [
    { key: 'firm_name',           value: 'Asalaw LP' },
    { key: 'firm_address',        value: '15 Wole Olateju Street, Lekki Phase 1, Lagos, Nigeria' },
    { key: 'firm_phone',          value: '+2348140682082' },
    { key: 'firm_email',          value: 'Adetunji@asalawpractice.com' },
    { key: 'firm_website',        value: 'www.asalawpractice.com' },
    { key: 'default_hourly_rate', value: '75000' },
    { key: 'vat_rate',            value: '0.075' },
    { key: 'currency',            value: 'NGN' },
    { key: 'invoice_prefix',      value: 'INV' },
    { key: 'matter_prefix',       value: 'ASA' },
  ];

  for (const s of settings) {
    await prisma.firmSetting.upsert({
      where:  { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }
  console.log('✅ Firm settings seeded');

  // ─── Admin User ───────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('admin332244', 12);

  await prisma.user.upsert({
    where:  { email: 'adetunji@asalawpractice.com' },
    update: {
      name:     'Adegboyega Adetunji',
      role:     'admin',
      position: 'Managing Partner',
      phone:    '+2348140682082',
      password: adminHash,
      status:   'active',
    },
    create: {
      email:    'adetunji@asalawpractice.com',
      name:     'Adegboyega Adetunji',
      role:     'admin',
      position: 'Managing Partner',
      phone:    '+2348140682082',
      password: adminHash,
      status:   'active',
    },
  });

  console.log('✅ Admin user seeded');
  console.log('');
  console.log('🔑 Login with:');
  console.log('   Email:    adetunji@asalawpractice.com');
  console.log('   Password: admin332244');
  console.log('');
  console.log('⚠️  IMPORTANT: Delete the password from this file now for security.');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });