import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  computeCycleStats,
  computePredictions,
  generateHealthAlerts,
  type PeriodEntry,
  type UserSettings,
} from "@/lib/cycle-engine";
import { cyclePredictionToJson } from "@/lib/predictions-json";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      periodLogs: { orderBy: { periodStart: "asc" } },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
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

  try {
    const stats = computeCycleStats(periods);
    const rawPrediction = computePredictions(periods, settings, new Date());
    const alerts = generateHealthAlerts(stats);

    const body = {
      prediction: rawPrediction ? cyclePredictionToJson(rawPrediction) : null,
      stats,
      alerts,
      mode: settings.mode,
      settings: {
        averageCycleLen: settings.averageCycleLen,
        lutealPhaseLen: settings.lutealPhaseLen,
        periodDuration: settings.periodDuration,
        mode: settings.mode,
      },
    };

    return NextResponse.json(body);
  } catch (err) {
    console.error("[predictions]", err);
    return NextResponse.json(
      { error: "Could not compute predictions. Try again later." },
      { status: 500 },
    );
  }
}
