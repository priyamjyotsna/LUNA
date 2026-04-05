import { differenceInDays, endOfDay, startOfDay } from "date-fns";
import { computeCycleStats, type PeriodEntry } from "@/lib/cycle-engine";
import { prisma } from "@/lib/db";

/** Recompute cycleLength + isAnomaly for every log after any insert/delete/reorder. */
export async function recomputeAllPeriodMetadata(userId: string): Promise<void> {
  const logs = await prisma.periodLog.findMany({
    where: { userId },
    orderBy: { periodStart: "asc" },
  });

  for (let i = 0; i < logs.length; i++) {
    let cycleLength: number | null = null;
    let isAnomaly = false;
    if (i > 0) {
      const gap = differenceInDays(logs[i].periodStart, logs[i - 1].periodStart);
      cycleLength = gap;
      isAnomaly = gap > 45;
    }
    await prisma.periodLog.update({
      where: { id: logs[i].id },
      data: { cycleLength, isAnomaly },
    });
  }

  await syncUserAverageCycleLen(userId);
}

export async function syncUserAverageCycleLen(userId: string) {
  const logs = await prisma.periodLog.findMany({
    where: { userId },
    orderBy: { periodStart: "asc" },
  });

  const periods: PeriodEntry[] = logs.map((p) => ({
    periodStart: p.periodStart,
    cycleLength: p.cycleLength,
    isAnomaly: p.isAnomaly,
  }));

  const stats = computeCycleStats(periods);

  await prisma.user.update({
    where: { id: userId },
    data: { averageCycleLen: stats.average },
  });

  return stats;
}

export async function hasPeriodOnCalendarDay(
  userId: string,
  day: Date,
): Promise<boolean> {
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
