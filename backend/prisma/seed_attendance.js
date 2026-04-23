const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const santri = await prisma.santri.findFirst();
  const guru = await prisma.guru.findFirst();

  if (!santri || !guru) {
    console.log("Please run the main seed first.");
    return;
  }

  console.log("Generating dummy attendance for the last 7 days...");

  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Random count of students present (1-5)
    const count = Math.floor(Math.random() * 5) + 1;
    
    for (let j = 0; j < count; j++) {
      await prisma.absensi.create({
        data: {
          santriId: santri.id,
          guruId: guru.id,
          status: 'HADIR',
          date: date,
        }
      });
    }
  }

  console.log("Dummy attendance generated.");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
