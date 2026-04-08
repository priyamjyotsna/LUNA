import type { Metadata } from "next";
import Link from "next/link";
import { SITE_SUPPORT_EMAIL } from "@/lib/site-contact";

export const metadata: Metadata = {
  title: "Support — Luna",
  description: "Contact Luna support.",
};

export default function SupportPage() {
  return (
    <article className="rounded-xl border border-border bg-card p-6 shadow-[0_8px_30px_var(--shadow-luna)] sm:p-8">
      <h1 className="font-display text-3xl font-semibold text-foreground">Support</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        For help with Luna—including account issues, feedback, or privacy requests—email us. We aim
        to respond when we can; this is a small team.
      </p>

      <p className="mt-8 text-center">
        <a
          href={`mailto:${SITE_SUPPORT_EMAIL}`}
          className="inline-block rounded-lg border border-border bg-muted/40 px-6 py-3 font-medium text-foreground transition-colors hover:bg-muted/60"
        >
          {SITE_SUPPORT_EMAIL}
        </a>
      </p>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link href="/privacy" className="font-medium text-primary underline-offset-4 hover:underline">
          Privacy Policy
        </Link>
        {" · "}
        <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </article>
  );
}
