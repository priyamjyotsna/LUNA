import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { deleteAccountSchema } from "@/lib/validations/user";

/**
 * Permanently delete the signed-in user and all associated data (cascade).
 * POST — body: { confirm: "DELETE_MY_ACCOUNT", password?: string }
 * Password required when the account has a password (email/password sign-up).
 */
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

  const parsed = deleteAccountSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, password: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (user.password) {
    const pw = parsed.data.password;
    if (!pw || !(await bcrypt.compare(pw, user.password))) {
      return NextResponse.json(
        { error: "Password required or incorrect" },
        { status: 400 },
      );
    }
  }

  if (user.email) {
    await prisma.verificationToken.deleteMany({
      where: { identifier: user.email },
    });
  }

  await prisma.user.delete({ where: { id: user.id } });

  return NextResponse.json({ ok: true });
}
