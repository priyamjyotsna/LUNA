import { startOfDay } from "date-fns";
import {
  computeCycleStats,
  getPhaseForDate,
  type PeriodEntry,
  type UserSettings,
} from "@/lib/cycle-engine";
import { prisma } from "@/lib/db";

export async function resolveSymptomCycleFields(
  userId: string,
  logDate: Date,
): Promise<{ cycleDay: number | null; phase: string | null }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      periodLogs: { orderBy: { periodStart: "asc" } },
    },
  });

  if (!user) {
    return { cycleDay: null, phase: null };
  }

  const periods: PeriodEntry[] = user.periodLogs.map((p) => ({
    periodStart: p.periodStart,
    cycleLength: p.cycleLength,
    isAnomaly: p.isAnomaly,
  }));

  const settings: UserSettings = {
    averageCycleLen: user.averageCycleLen,
    lutealPhaseLen: user.lutealPhaseLen,
    periodDuration: user.periodDuration,
    mode: user.mode === "ttc" ? "ttc" : "avoid",
  };

  const stats = computeCycleStats(periods);
  const day = startOfDay(logDate);
  const info = getPhaseForDate(day, periods, settings, stats);

  if (!info) {
    return { cycleDay: null, phase: null };
  }

  return {
    cycleDay: info.cycleDay,
    phase:
      info.phase === "predicted"
        ? "predicted"
        : info.phase,
  };
}
