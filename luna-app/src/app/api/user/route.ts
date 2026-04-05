import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { userPatchSchema } from "@/lib/validations/user";

function userPublic(u: {
  id: string;
  name: string | null;
  email: string | null;
  averageCycleLen: number;
  lutealPhaseLen: number;
  periodDuration: number;
  mode: string;
  notificationsOn: boolean;
  theme: string;
  dateOfBirth: Date | null;
}) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    averageCycleLen: u.averageCycleLen,
    lutealPhaseLen: u.lutealPhaseLen,
    periodDuration: u.periodDuration,
    mode: u.mode === "ttc" ? "ttc" : "avoid",
    notificationsOn: u.notificationsOn,
    theme: u.theme,
    dateOfBirth: u.dateOfBirth?.toISOString() ?? null,
  };
}

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
      averageCycleLen: true,
      lutealPhaseLen: true,
      periodDuration: true,
      mode: true,
      notificationsOn: true,
      theme: true,
      dateOfBirth: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user: userPublic(user) });
}

export async function PATCH(req: Request) {
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

  const parsed = userPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = parsed.data;
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  let dateOfBirthUpdate: Date | null | undefined;
  if ("dateOfBirth" in data) {
    if (data.dateOfBirth === null) {
      dateOfBirthUpdate = null;
    } else if (data.dateOfBirth) {
      dateOfBirthUpdate = new Date(`${data.dateOfBirth}T12:00:00.000Z`);
    }
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...("name" in data ? { name: data.name } : {}),
      ...(dateOfBirthUpdate !== undefined ? { dateOfBirth: dateOfBirthUpdate } : {}),
      ...("averageCycleLen" in data ? { averageCycleLen: data.averageCycleLen } : {}),
      ...("lutealPhaseLen" in data ? { lutealPhaseLen: data.lutealPhaseLen } : {}),
      ...("periodDuration" in data ? { periodDuration: data.periodDuration } : {}),
      ...("mode" in data ? { mode: data.mode } : {}),
      ...("notificationsOn" in data ? { notificationsOn: data.notificationsOn } : {}),
      ...("theme" in data ? { theme: data.theme } : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      averageCycleLen: true,
      lutealPhaseLen: true,
      periodDuration: true,
      mode: true,
      notificationsOn: true,
      theme: true,
      dateOfBirth: true,
    },
  });

  return NextResponse.json({ user: userPublic(updated) });
}
