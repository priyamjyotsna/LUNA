import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { differenceInDays } from "date-fns";

const prisma = new PrismaClient();

const SAMPLE_PERIODS = [
  "2022-08-14",
  "2022-09-11",
  "2022-10-09",
  "2022-11-08",
  "2022-12-07",
  "2023-01-08",
  "2023-02-05",
  "2023-03-07",
  "2023-04-04",
  "2023-05-05",
  "2023-06-03",
  "2023-07-30",
  "2023-08-26",
  "2023-09-25",
  "2023-10-24",
  "2023-11-20",
  "2023-12-18",
  "2024-01-15",
  "2024-02-13",
  "2024-03-12",
  "2024-04-09",
  "2024-05-08",
  "2024-06-04",
  "2024-07-31",
  "2024-08-29",
  "2024-09-24",
  "2024-10-22",
  "2024-11-18",
  "2024-12-16",
  "2025-01-13",
  "2025-02-10",
  "2025-03-10",
  "2025-04-07",
  "2025-05-10",
  "2025-06-03",
  "2025-07-01",
  "2025-08-02",
  "2025-08-29",
  "2025-09-27",
  "2025-10-25",
  "2025-11-20",
  "2025-12-20",
  "2026-01-14",
  "2026-02-10",
  "2026-03-08",
];

async function main() {
  await prisma.periodLog.deleteMany();
  await prisma.symptomLog.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();

  const hashed = await bcrypt.hash("test1234", 12);
  const user = await prisma.user.create({
    data: {
      email: "priya@example.com",
      name: "Priya",
      password: hashed,
    },
  });

  let prev: Date | null = null;
  for (const dateStr of SAMPLE_PERIODS) {
    const periodStart = new Date(`${dateStr}T12:00:00.000Z`);
    let cycleLength: number | null = null;
    let isAnomaly = false;
    if (prev) {
      const gap = differenceInDays(periodStart, prev);
      cycleLength = gap;
      isAnomaly = gap > 45;
    }
    await prisma.periodLog.create({
      data: {
        userId: user.id,
        periodStart,
        cycleLength,
        isAnomaly,
      },
    });
    prev = periodStart;
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
