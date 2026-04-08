import type { Metadata } from "next";
import Link from "next/link";
import { SITE_SUPPORT_EMAIL } from "@/lib/site-contact";

export const metadata: Metadata = {
  title: "Privacy Policy — Luna",
  description: "How Luna collects, uses, and stores your information.",
};

const updated = "April 5, 2026";

export default function PrivacyPage() {
  return (
    <article className="rounded-xl border border-border bg-card p-6 shadow-[0_8px_30px_var(--shadow-luna)] sm:p-8">
      <h1 className="font-display text-3xl font-semibold text-foreground">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: {updated}</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-foreground">
        <section className="space-y-2">
          <h2 className="font-display text-xl font-semibold">Overview</h2>
          <p className="text-muted-foreground">
            Luna (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is a wellness tool for tracking menstrual
            cycles and related information. This policy describes how we handle information when you
            use Luna (web or mobile shell). Luna is not a medical device and does not replace
            professional care.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl font-semibold">What we collect</h2>
          <ul className="list-inside list-disc space-y-1 text-muted-foreground">
            <li>
              <span className="text-foreground">Account data:</span> such as email address, name
              (if you provide it), and credentials or authentication details needed to sign in.
            </li>
            <li>
              <span className="text-foreground">Data you choose to log:</span> period and cycle
              information, symptoms, notes, and related wellness entries you save in the app.
            </li>
            <li>
              <span className="text-foreground">Technical data:</span> information our hosting and
              infrastructure need to operate the service (for example, standard server logs,
              security events, and cookies or similar technologies used for sign-in sessions).
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl font-semibold">How we use it</h2>
          <p className="text-muted-foreground">
            We use this information to provide core app features—such as storing your log,
            computing predictions from your history, syncing your account across devices, and
            improving reliability and security. We do not sell your personal information. We do not
            use it for third-party advertising unless we introduce that separately with clear notice
            and, where required, consent.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl font-semibold">Sign-in with Google</h2>
          <p className="text-muted-foreground">
            If you use Google to sign in, Google processes information under Google&apos;s policies.
            We receive the profile details needed to create or link your Luna account.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl font-semibold">Storage and security</h2>
          <p className="text-muted-foreground">
            Your data is stored using industry-standard cloud infrastructure (including encrypted
            connections). Access is limited to what is needed to run the service. No method of
            transmission or storage is 100% secure; we work to protect your information using
            reasonable safeguards.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl font-semibold">Retention and your choices</h2>
          <p className="text-muted-foreground">
            We keep your information while your account is active and as needed to provide the
            service or comply with law. You may request access, correction, or deletion of your
            account and associated data by contacting us—see{" "}
            <Link href="/support" className="font-medium text-primary underline-offset-4 hover:underline">
              Support
            </Link>
            .
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl font-semibold">Children</h2>
          <p className="text-muted-foreground">
            Luna is not directed at children under 13, and we do not knowingly collect personal
            information from children under 13. If you believe we have, please contact us.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl font-semibold">Changes</h2>
          <p className="text-muted-foreground">
            We may update this policy from time to time. We will post the updated version on this
            page and adjust the &quot;Last updated&quot; date.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl font-semibold">Contact</h2>
          <p className="text-muted-foreground">
            Questions about privacy:{" "}
            <a
              href={`mailto:${SITE_SUPPORT_EMAIL}`}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              {SITE_SUPPORT_EMAIL}
            </a>
            . For general help, visit{" "}
            <Link href="/support" className="font-medium text-primary underline-offset-4 hover:underline">
              Support
            </Link>
            .
          </p>
        </section>
      </div>
    </article>
  );
}
