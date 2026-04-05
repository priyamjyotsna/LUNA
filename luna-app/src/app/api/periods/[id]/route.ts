import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { recomputeAllPeriodMetadata } from "@/lib/period-service";
import { normalizeRecordedFlowIntensity } from "@/lib/period-flow";
import { periodUpdateSchema } from "@/lib/validations/period";
import { toPeriodLogDTO } from "@/types/period";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(req: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = periodUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  if (
    parsed.data.flowIntensity === undefined &&
    parsed.data.notes === undefined
  ) {
    return NextResponse.json(
      { error: "No fields to update" },
      { status: 400 },
    );
  }

  const existing = await prisma.periodLog.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const flowPatch =
    parsed.data.flowIntensity !== undefined
      ? (() => {
          const norm = normalizeRecordedFlowIntensity(parsed.data.flowIntensity);
          return {
            flowIntensity: norm,
            flowUserEntered: norm != null,
          };
        })()
      : {};

  const updated = await prisma.periodLog.update({
    where: { id },
    data: {
      ...flowPatch,
      ...(parsed.data.notes !== undefined && {
        notes: parsed.data.notes,
      }),
    },
  });

  return NextResponse.json({ periodLog: toPeriodLogDTO(updated) });
}

export async function DELETE(_req: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  const existing = await prisma.periodLog.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.periodLog.delete({ where: { id } });
  await recomputeAllPeriodMetadata(session.user.id);

  return NextResponse.json({ ok: true });
}
