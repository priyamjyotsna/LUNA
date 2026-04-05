/**
 * Import historical period starts for a real user (does not delete the user account).
 *
 * Usage:
 *   IMPORT_USER_EMAIL="you@example.com" npx tsx prisma/import-period-history.ts
 *
 * Replace all period logs for that user (default):
 *   IMPORT_USER_EMAIL="you@example.com" IMPORT_REPLACE=1 npx tsx prisma/import-period-history.ts
 *
 * Append only dates you don't already have on that calendar day:
 *   IMPORT_USER_EMAIL="you@example.com" IMPORT_REPLACE=0 npx tsx prisma/import-period-history.ts
 *
 * Skip the estimated early-July 2024 placeholder:
 *   IMPORT_USER_EMAIL="you@example.com" IMPORT_SKIP_ESTIMATED_JULY_2024=1 npx tsx prisma/import-period-history.ts
 */

import { PrismaClient } from "@prisma/client";
import { differenceInDays, endOfDay, startOfDay } from "date-fns";
import { recomputeAllPeriodMetadata } from "../src/lib/period-service";

const prisma = new PrismaClient();

/** Period start dates (calendar day). Order: chronological. */
const PERIOD_START_ISO = [
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
  // Placeholder for an unrecorded early-July 2024 start (between Jun 4 and Jul 31).
  "2024-07-07",
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
  // Today’s cycle (per app “today” when you asked — adjust if yours differs).
  "2026-04-05",
] as const;

async function hasPeriodOnDay(userId: string, day: Date): Promise<boolean> {
  const start = startOfDay(day);
  const end = endOfDay(day);
  const existing = await prisma.periodLog.findFirst({
    where: {
      userId,
      periodStart: { gte: start, lte: end },
    },
  });
  return existing !== null;
}

async function main() {
  const email = process.env.IMPORT_USER_EMAIL?.trim() ?? process.argv[2]?.trim();
  if (!email) {
    console.error(
      "Set IMPORT_USER_EMAIL or pass email as first argument.\nExample: IMPORT_USER_EMAIL=\"you@mail.com\" npx tsx prisma/import-period-history.ts",
    );
    process.exit(1);
  }

  const replace =
    process.env.IMPORT_REPLACE === undefined || process.env.IMPORT_REPLACE === "1" || process.env.IMPORT_REPLACE === "true";
  const skipEstimatedJuly =
    process.env.IMPORT_SKIP_ESTIMATED_JULY_2024 === "1" ||
    process.env.IMPORT_SKIP_ESTIMATED_JULY_2024 === "true";

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`No user with email: ${email}`);
    process.exit(1);
  }

  let dates = [...PERIOD_START_ISO];
  if (skipEstimatedJuly) {
    dates = dates.filter((d) => d !== "2024-07-07");
  }

  if (replace) {
    const deleted = await prisma.periodLog.deleteMany({ where: { userId: user.id } });
    console.log(`Removed ${deleted.count} existing period logs for ${email}.`);
  }

  let created = 0;
  let skipped = 0;

  for (let i = 0; i < dates.length; i++) {
    const dateStr = dates[i];
    const periodStart = new Date(`${dateStr}T12:00:00.000Z`);

    if (!replace) {
      const exists = await hasPeriodOnDay(user.id, periodStart);
      if (exists) {
        skipped++;
        continue;
      }
    }

    const notes =
      dateStr === "2024-07-07"
        ? "Imported estimate — original early-July 2024 start not recorded."
        : dateStr === "2026-04-05"
          ? "Current cycle start (import)."
          : null;

    await prisma.periodLog.create({
      data: {
        userId: user.id,
        periodStart,
        flowIntensity: null,
        flowUserEntered: false,
        notes,
      },
    });
    created++;
  }

  await recomputeAllPeriodMetadata(user.id);

  const logs = await prisma.periodLog.findMany({
    where: { userId: user.id },
    orderBy: { periodStart: "asc" },
  });

  const freshUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { averageCycleLen: true },
  });

  console.log(`Created ${created} period logs; skipped (append) ${skipped}.`);
  console.log(
    `Total logs now: ${logs.length}. averageCycleLen on profile: ${freshUser?.averageCycleLen ?? "—"}.`,
  );

  if (logs.length >= 2) {
    const last = logs[logs.length - 1];
    const prev = logs[logs.length - 2];
    const gap = differenceInDays(last.periodStart, prev.periodStart);
    console.log(`Latest cycle length (gap): ${gap} days (${prev.periodStart.toISOString().slice(0, 10)} → ${last.periodStart.toISOString().slice(0, 10)}).`);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
