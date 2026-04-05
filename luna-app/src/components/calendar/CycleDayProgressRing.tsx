"use client";

import type { CalendarCellKind } from "@/lib/calendar-cell";
import { cn } from "@/lib/utils";

const STROKE: Record<CalendarCellKind, string> = {
  period: "stroke-[var(--phase-menstrual)]",
  follicular: "stroke-[var(--phase-follicular)]",
  fertile: "stroke-[var(--phase-ovulatory)]",
  ovulation: "stroke-[var(--phase-ovulatory)]",
  luteal: "stroke-[var(--phase-luteal)]",
  predicted: "stroke-[var(--phase-predicted)]",
  neutral: "stroke-muted-foreground",
};

export function CycleDayProgressRing({
  kind,
  cycleDay,
  typicalCycleLength,
  className,
}: {
  kind: CalendarCellKind;
  cycleDay: number;
  typicalCycleLength: number;
  className?: string;
}) {
  const len = Math.max(1, typicalCycleLength);
  const p = Math.min(1, cycleDay / len);
  const r = 38;
  const c = 2 * Math.PI * r;
  const dash = p * c;

  return (
    <div
      className={cn("flex flex-col items-center gap-1", className)}
      role="img"
      aria-label={`Cycle day ${cycleDay} of about ${typicalCycleLength} days`}
    >
      <svg
        width="104"
        height="104"
        viewBox="0 0 100 100"
        className="shrink-0 -rotate-90"
        aria-hidden
      >
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          className="stroke-muted/50"
          strokeWidth="8"
        />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          className={cn(STROKE[kind], "transition-[stroke-dasharray] duration-500 ease-out")}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
        />
      </svg>
      <div className="text-center">
        <p className="text-lg font-semibold tabular-nums text-foreground">Day {cycleDay}</p>
        <p className="text-xs text-muted-foreground">of ~{typicalCycleLength} d</p>
      </div>
    </div>
  );
}
