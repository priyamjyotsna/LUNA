import { NextResponse } from "next/server";
import { endOfDay, startOfDay } from "date-fns";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { resolveSymptomCycleFields } from "@/lib/symptom-context";
import { symptomLogSchema } from "@/lib/validations/symptom";
import { toSymptomLogDTO } from "@/types/symptom";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const date = url.searchParams.get("date");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  if (date) {
    const logDay = startOfDay(new Date(date));
    const log = await prisma.symptomLog.findUnique({
      where: {
        userId_logDate: {
          userId: session.user.id,
          logDate: logDay,
        },
      },
    });
    return NextResponse.json({ symptomLog: log ? toSymptomLogDTO(log) : null });
  }

  if (from && to) {
    const start = startOfDay(new Date(from));
    const end = endOfDay(new Date(to));
    const logs = await prisma.symptomLog.findMany({
      where: {
        userId: session.user.id,
        logDate: { gte: start, lte: end },
      },
      orderBy: { logDate: "desc" },
    });
    return NextResponse.json({ symptomLogs: logs.map(toSymptomLogDTO) });
  }

  return NextResponse.json(
    { error: "Provide ?date= or ?from=&to=" },
    { status: 400 },
  );
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = symptomLogSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const logDay = startOfDay(new Date(parsed.data.logDate));
  const { cycleDay, phase } = await resolveSymptomCycleFields(
    session.user.id,
    logDay,
  );

  const d = parsed.data;

  const payload = {
    cycleDay,
    phase,
    cramps: d.cramps ?? null,
    headache: d.headache ?? false,
    bloating: d.bloating ?? false,
    nausea: d.nausea ?? false,
    backPain: d.backPain ?? false,
    breastTenderness: d.breastTenderness ?? false,
    fatigue: d.fatigue ?? false,
    acne: d.acne ?? false,
    mood: d.mood ?? null,
    energyLevel: d.energyLevel ?? null,
    anxietyLevel: d.anxietyLevel ?? null,
    libido: d.libido ?? null,
    sleepHours: d.sleepHours ?? null,
    exercised: d.exercised ?? false,
    stressLevel: d.stressLevel ?? null,
    waterIntake: d.waterIntake ?? null,
    cervicalMucus: d.cervicalMucus ?? null,
    spotting: d.spotting ?? false,
    bbt: d.bbt ?? null,
    ovulationPain: d.ovulationPain ?? false,
    notes: d.notes ?? null,
  };

  const saved = await prisma.symptomLog.upsert({
    where: {
      userId_logDate: {
        userId: session.user.id,
        logDate: logDay,
      },
    },
    create: {
      userId: session.user.id,
      logDate: logDay,
      ...payload,
    },
    update: payload,
  });

  return NextResponse.json({ symptomLog: toSymptomLogDTO(saved) });
}
