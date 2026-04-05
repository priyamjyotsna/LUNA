import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  hasPeriodOnCalendarDay,
  recomputeAllPeriodMetadata,
} from "@/lib/period-service";
import { normalizeRecordedFlowIntensity } from "@/lib/period-flow";
import { periodCreateSchema } from "@/lib/validations/period";
import { toPeriodLogDTO } from "@/types/period";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const logs = await prisma.periodLog.findMany({
    where: { userId: session.user.id },
    orderBy: { periodStart: "asc" },
  });

  return NextResponse.json({
    periodLogs: logs.map(toPeriodLogDTO),
  });
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

  const parsed = periodCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { periodStart: startStr, flowIntensity, notes } = parsed.data;
  const flowNorm = normalizeRecordedFlowIntensity(flowIntensity ?? null);
  const periodStart = new Date(startStr);

  if (Number.isNaN(periodStart.getTime())) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  const duplicate = await hasPeriodOnCalendarDay(session.user.id, periodStart);
  if (duplicate) {
    return NextResponse.json(
      { error: "You already logged a period on this day." },
      { status: 409 },
    );
  }

  const created = await prisma.periodLog.create({
    data: {
      userId: session.user.id,
      periodStart,
      flowIntensity: flowNorm,
      flowUserEntered: flowNorm != null,
      notes: notes ?? null,
    },
  });

  await recomputeAllPeriodMetadata(session.user.id);

  const fresh = await prisma.periodLog.findUniqueOrThrow({
    where: { id: created.id },
  });

  return NextResponse.json({
    periodLog: toPeriodLogDTO(fresh),
  });
}
