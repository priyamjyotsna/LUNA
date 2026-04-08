import Link from "next/link";
import { redirect } from "next/navigation";
import { RegisterForm } from "./register-form";
import { MedicalDisclaimer } from "@/components/shared/MedicalDisclaimer";
import { auth } from "@/lib/auth";

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/");
  }

  return (
    <div className="rounded-xl border border-border bg-card p-8 shadow-[0_8px_30px_var(--shadow-luna)]">
      <h1 className="font-display text-3xl font-semibold text-foreground">Create account</h1>
      <p className="mt-2 text-sm text-muted-foreground">Start tracking with Luna</p>
      <RegisterForm />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
      <MedicalDisclaimer className="mt-6 text-center text-xs text-muted-foreground" />
      <p className="mt-4 text-center text-xs text-muted-foreground">
        <Link href="/privacy" className="underline-offset-4 hover:underline">
          Privacy
        </Link>
        {" · "}
        <Link href="/support" className="underline-offset-4 hover:underline">
          Support
        </Link>
      </p>
    </div>
  );
}
