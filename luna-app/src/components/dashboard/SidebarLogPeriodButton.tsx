"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePeriodLogLauncher } from "./period-log-context";

export function SidebarLogPeriodButton() {
  const { open } = usePeriodLogLauncher();

  return (
    <Button
      type="button"
      className="mx-2 mb-3 w-[calc(100%-1rem)] gap-2"
      onClick={open}
      aria-label="Open log period form"
    >
      <Plus className="size-4" aria-hidden />
      Log period
    </Button>
  );
}
