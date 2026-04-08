import type { ReactNode } from "react";
import Link from "next/link";

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-full flex-1 bg-background px-4 py-10 sm:py-14">
      <div id="main-content" className="mx-auto w-full max-w-2xl" tabIndex={-1}>
        <p className="mb-8 text-center">
          <Link
            href="/login"
            className="font-display text-lg font-semibold text-foreground underline-offset-4 hover:underline"
          >
            Luna
          </Link>
        </p>
        {children}
      </div>
    </div>
  );
}
