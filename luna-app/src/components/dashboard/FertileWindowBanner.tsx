"use client";

import { differenceInCalendarDays, isWithinInterval, startOfDay } from "date-fns";
import { Info } from "lucide-react";
import type { CyclePrediction } from "@/lib/cycle-engine";
import type { UserMode } from "@/types";
import { cn } from "@/lib/utils";

export function FertileWindowBanner({
  prediction,
  mode,
  className,
}: {
  prediction: CyclePrediction;
  mode: UserMode;
  className?: string;
}) {
  const today = startOfDay(new Date());
  const fwStart = startOfDay(prediction.fertileWindowStart);
  const fwEnd = startOfDay(prediction.fertileWindowEnd);

  const inWindow = isWithinInterval(today, { start: fwStart, end: fwEnd });
  const daysUntil = differenceInCalendarDays(fwStart, today);

  if (inWindow) {
    const body =
      mode === "ttc"
        ? "You’re in your fertile window — these are your best days to try if you’re timing conception."
        : "You’re in your fertile window — use extra protection if you’re avoiding pregnancy.";
    return (
      <div
        className={cn(
          "flex gap-3 rounded-xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm text-amber-950 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/35 dark:text-amber-100",
          className,
        )}
        role="status"
      >
        <Info className="mt-0.5 size-5 shrink-0 opacity-80" aria-hidden />
        <p>{body}</p>
      </div>
    );
  }

  if (daysUntil < 1 || daysUntil > 5) return null;

  const body =
    mode === "ttc"
      ? `Your fertile window starts in ${daysUntil} day${daysUntil === 1 ? "" : "s"} — plan around your best days to try.`
      : `Your fertile window starts in ${daysUntil} day${daysUntil === 1 ? "" : "s"} — plan protection if avoiding pregnancy.`;

  return (
    <div
      className={cn(
        "flex gap-3 rounded-xl border border-sky-200/80 bg-sky-50/85 px-4 py-3 text-sm text-sky-950 shadow-sm dark:border-sky-900/40 dark:bg-sky-950/30 dark:text-sky-100",
        className,
      )}
      role="status"
    >
      <Info className="mt-0.5 size-5 shrink-0 opacity-80" aria-hidden />
      <p>{body}</p>
    </div>
  );
}
