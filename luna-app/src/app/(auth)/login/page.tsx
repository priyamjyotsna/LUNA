import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "./ui-login-form";
import { MedicalDisclaimer } from "@/components/shared/MedicalDisclaimer";
import { auth } from "@/lib/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string }>;
}) {
  const session = await auth();
  if (session?.user) {
    redirect("/");
  }

  const showGoogle = Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
  );
  const sp = await searchParams;

  return (
    <div className="rounded-xl border border-border bg-card p-8 shadow-[0_8px_30px_var(--shadow-luna)]">
      <h1 className="font-display text-3xl font-semibold text-foreground">Welcome back</h1>
      <p className="mt-2 text-sm text-muted-foreground">Sign in to Luna</p>
      <LoginForm showGoogle={showGoogle} registered={sp.registered === "1"} />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        No account?{" "}
        <Link href="/register" className="font-medium text-primary underline-offset-4 hover:underline">
          Register
        </Link>
      </p>
      <MedicalDisclaimer className="mt-6 text-center text-xs text-muted-foreground" />
    </div>
  );
}
