import { addDays } from "date-fns";
import ICAL from "ical.js";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

function toAllDayTime(d: Date) {
  return ICAL.Time.fromData({
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    day: d.getDate(),
    isDate: true,
  });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const logs = await prisma.periodLog.findMany({
    where: { userId: session.user.id },
    orderBy: { periodStart: "asc" },
  });

  const calendar = new ICAL.Component(["vcalendar", [], []]);
  calendar.addPropertyWithValue("prodid", "-//Luna App//EN");
  calendar.addPropertyWithValue("version", "2.0");
  calendar.addPropertyWithValue("calscale", "GREGORIAN");

  for (const log of logs) {
    const start = log.periodStart;
    const endExclusive = addDays(start, 1);
    const vevent = new ICAL.Component("vevent");
    vevent.addPropertyWithValue("uid", `${log.id}@luna`);
    vevent.addPropertyWithValue("dtstamp", ICAL.Time.fromJSDate(new Date(), true));
    vevent.addPropertyWithValue("dtstart", toAllDayTime(start));
    vevent.addPropertyWithValue("dtend", toAllDayTime(endExclusive));
    vevent.addPropertyWithValue("summary", "Period start — Luna");
    if (log.notes?.trim()) {
      vevent.addPropertyWithValue("description", log.notes.slice(0, 2000));
    }
    calendar.addSubcomponent(vevent);
  }

  const body = calendar.toString();

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="luna-periods-${new Date().toISOString().slice(0, 10)}.ics"`,
    },
  });
}
