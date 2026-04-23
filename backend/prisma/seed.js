const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const guruPassword = await bcrypt.hash('guru123', 10);
  const waliPassword = await bcrypt.hash('wali123', 10);

  // 1. Create Admin
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  // 2. Create Guru
  const guruData = await prisma.guru.upsert({
    where: { nip: '123456789' },
    update: {},
    create: {
      name: 'Ustadz Ahmad',
      nip: '123456789',
      phone: '08123456789',
      user: {
        create: {
          username: 'guru1',
          password: guruPassword,
          role: 'GURU',
        }
      }
    },
  });

  // 3. Create Kelas
  const kelas = await prisma.kelas.create({
    data: {
      name: 'Kelas 10A',
      guruId: guruData.id,
    }
  });

  // 4. Create Wali & Santri
  await prisma.user.upsert({
    where: { username: 'wali1' },
    update: {},
    create: {
      username: 'wali1',
      password: waliPassword,
      role: 'WALI',
      santri: {
        create: {
          name: 'Muhammad Yusuf',
          nis: '1001',
          kelasId: kelas.id,
        }
      }
    }
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
