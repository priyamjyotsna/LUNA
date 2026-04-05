import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { deleteDataConfirmSchema } from "@/lib/validations/user";

export async function DELETE(req: Request) {
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

  const parsed = deleteDataConfirmSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Send { \"confirm\": \"DELETE_MY_DATA\" } to delete logs." },
      { status: 400 },
    );
  }

  const uid = session.user.id;

  await prisma.$transaction([
    prisma.symptomLog.deleteMany({ where: { userId: uid } }),
    prisma.periodLog.deleteMany({ where: { userId: uid } }),
    prisma.user.update({
      where: { id: uid },
      data: { pushSubscription: null },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
