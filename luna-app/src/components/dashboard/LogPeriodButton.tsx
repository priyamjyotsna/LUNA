"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePeriodLogLauncher } from "./period-log-context";

/** Floating action — mobile only; desktop uses sidebar control. */
export function LogPeriodFab() {
  const { open } = usePeriodLogLauncher();

  return (
    <Button
      type="button"
      size="icon"
      className="fixed right-4 z-40 size-14 rounded-full shadow-lg md:hidden"
      style={{
        bottom: "calc(5rem + env(safe-area-inset-bottom, 0px) + 0.25rem)",
      }}
      onClick={open}
      aria-label="Log period"
    >
      <Plus className="size-7" aria-hidden />
    </Button>
  );
}
