"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("[dashboard error]", error);
    }
  }, [error]);

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 rounded-xl border border-destructive/30 bg-card p-8 text-center shadow-sm">
      <h1 className="font-display text-xl font-semibold text-foreground">Something went wrong</h1>
      <p className="text-sm text-muted-foreground">
        A part of the app crashed. Your data is still safe — try again, or refresh the page.
      </p>
      {process.env.NODE_ENV === "development" ? (
        <pre className="max-h-32 w-full overflow-auto rounded-md bg-muted p-2 text-left text-xs">
          {error.message}
        </pre>
      ) : null}
      <Button type="button" onClick={() => reset()}>
        Try again
      </Button>
    </div>
  );
}
