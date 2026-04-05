import { format } from "date-fns";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { flowIntensityForUserDisplay, flowLevelDisplayLabel } from "@/lib/period-flow";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [user, periods, symptoms] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        email: true,
        averageCycleLen: true,
        lutealPhaseLen: true,
        periodDuration: true,
        mode: true,
      },
    }),
    prisma.periodLog.findMany({
      where: { userId: session.user.id },
      orderBy: { periodStart: "desc" },
      take: 40,
    }),
    prisma.symptomLog.findMany({
      where: { userId: session.user.id },
      orderBy: { logDate: "desc" },
      take: 40,
    }),
  ]);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text("Luna export summary", 14, 20);
  doc.setFontSize(10);
  doc.text(
    `Generated ${format(new Date(), "yyyy-MM-dd HH:mm")} · Mode: ${user.mode}`,
    14,
    28,
  );
  doc.text(
    `Defaults: cycle ${user.averageCycleLen} d · luteal ${user.lutealPhaseLen} d · period ${user.periodDuration} d`,
    14,
    34,
  );

  autoTable(doc, {
    startY: 42,
    head: [["Period start", "Cycle len", "Flow", "Anomaly"]],
    body: periods.map((p) => {
      const flow = flowIntensityForUserDisplay(p);
      return [
        format(p.periodStart, "yyyy-MM-dd"),
        p.cycleLength != null ? String(p.cycleLength) : "—",
        flow ? flowLevelDisplayLabel(flow) : "",
        p.isAnomaly ? "yes" : "no",
      ];
    }),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [155, 143, 192] },
  });

  const finalY = (
    doc as jsPDF & {
      lastAutoTable?: { finalY: number };
    }
  ).lastAutoTable?.finalY;
  const symptomY = typeof finalY === "number" ? finalY + 12 : 140;

  doc.setFontSize(12);
  doc.text("Recent symptom logs", 14, symptomY);

  autoTable(doc, {
    startY: symptomY + 4,
    head: [["Date", "Cramps", "Mood", "Stress", "Notes"]],
    body: symptoms.map((s) => [
      format(s.logDate, "yyyy-MM-dd"),
      s.cramps != null ? String(s.cramps) : "—",
      s.mood ?? "—",
      s.stressLevel != null ? String(s.stressLevel) : "—",
      s.notes ? s.notes.slice(0, 40).replace(/\s+/g, " ") : "—",
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [122, 158, 142] },
  });

  const out = doc.output("arraybuffer");

  return new NextResponse(out, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="luna-summary-${format(new Date(), "yyyy-MM-dd")}.pdf"`,
    },
  });
}
