import { NextResponse } from "next/server";
import { subDays } from "date-fns";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  computeCycleStats,
  computePhaseSymptomHeatmap,
  generateHealthAlerts,
  type PeriodEntry,
  type UserSettings,
} from "@/lib/cycle-engine";
import type { InsightsApiResponse } from "@/lib/insights-types";
import { flowIntensityForUserDisplay } from "@/lib/period-flow";

const SYMPTOM_RANGE_DAYS = 90;

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const since = subDays(new Date(), SYMPTOM_RANGE_DAYS);

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      periodLogs: { orderBy: { periodStart: "desc" }, take: 48 },
      symptomLogs: {
        where: { logDate: { gte: since } },
        orderBy: { logDate: "asc" },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const periodsAsc = [...user.periodLogs].sort(
    (a, b) => a.periodStart.getTime() - b.periodStart.getTime(),
  );

  const periods: PeriodEntry[] = periodsAsc.map((p) => ({
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

  try {
    const stats = computeCycleStats(periods);
    const alerts = generateHealthAlerts(stats);

    const symptomSeries = user.symptomLogs.map((s) => ({
      date: s.logDate.toISOString().slice(0, 10),
      cramps: s.cramps,
      stress: s.stressLevel,
      energy: s.energyLevel,
      bbt: s.bbt,
    }));

    const phaseSymptomHeatmap = computePhaseSymptomHeatmap(
      user.symptomLogs.map((s) => ({
        logDate: s.logDate,
        cramps: s.cramps,
        mood: s.mood,
        energyLevel: s.energyLevel,
        headache: s.headache,
        bloating: s.bloating,
        fatigue: s.fatigue,
        stressLevel: s.stressLevel,
      })),
      periods,
      settings,
      stats,
    );

    const periodHistory = user.periodLogs.map((p) => ({
      id: p.id,
      periodStart: p.periodStart.toISOString(),
      cycleLength: p.cycleLength,
      flowIntensity: flowIntensityForUserDisplay(p),
      isAnomaly: p.isAnomaly,
      notes: p.notes,
    }));

    const cycleLengthSeries = periodsAsc
      .filter((p) => p.cycleLength != null && p.cycleLength >= 15 && p.cycleLength <= 45)
      .map((p) => ({
        date: p.periodStart.toISOString().slice(0, 10),
        cycleLength: p.cycleLength as number,
      }));

    const body: InsightsApiResponse = {
      stats,
      alerts,
      mode: settings.mode,
      settings,
      cycleLengthSeries,
      symptomSeries,
      phaseSymptomHeatmap,
      periodHistory,
      symptomLogCount: user.symptomLogs.length,
    };

    return NextResponse.json(body);
  } catch (err) {
    console.error("[insights]", err);
    return NextResponse.json(
      { error: "Could not load insights. Try again later." },
      { status: 500 },
    );
  }
}
