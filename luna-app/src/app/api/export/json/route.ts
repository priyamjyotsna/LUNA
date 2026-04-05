import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { toPeriodLogExportSnapshot } from "@/types/period";
import { toSymptomLogDTO } from "@/types/symptom";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      dateOfBirth: true,
      averageCycleLen: true,
      lutealPhaseLen: true,
      periodDuration: true,
      mode: true,
      notificationsOn: true,
      theme: true,
      createdAt: true,
      updatedAt: true,
      periodLogs: { orderBy: { periodStart: "asc" } },
      symptomLogs: { orderBy: { logDate: "asc" } },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { periodLogs, symptomLogs, ...userScalars } = user;

  const payload = {
    exportedAt: new Date().toISOString(),
    user: {
      ...userScalars,
      dateOfBirth: user.dateOfBirth?.toISOString() ?? null,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    },
    periodLogs: periodLogs.map(toPeriodLogExportSnapshot),
    symptomLogs: symptomLogs.map(toSymptomLogDTO),
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="luna-export-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
