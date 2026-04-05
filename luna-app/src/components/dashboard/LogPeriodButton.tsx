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
      className="fixed bottom-20 right-4 z-40 size-14 rounded-full shadow-lg md:hidden"
      onClick={open}
      aria-label="Log period"
    >
      <Plus className="size-7" aria-hidden />
    </Button>
  );
}
