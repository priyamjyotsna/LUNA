"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("[global-error]", error);
    }
  }, [error]);

  return (
    <html lang="en">
      <body className="m-0 bg-[#fefaf7] px-6 py-16 font-sans text-[#1e1429] antialiased dark:bg-[#1e1429] dark:text-[#fdf2f8]">
        <div className="mx-auto max-w-md text-center">
          <h1 className="font-serif text-2xl font-semibold tracking-tight">
            Luna hit a problem
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            Something went wrong at the root of the app. Your data is not shown here. Try again,
            or close and reopen Luna.
          </p>
          {process.env.NODE_ENV === "development" ? (
            <pre className="mt-6 max-h-40 overflow-auto rounded-lg bg-black/5 p-3 text-left text-xs dark:bg-white/10">
              {error.message}
            </pre>
          ) : null}
          <button
            type="button"
            onClick={() => reset()}
            className="mt-8 rounded-lg border border-[#c97b7b] bg-[#c97b7b] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
