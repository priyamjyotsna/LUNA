"use client";

import type { CalendarCellKind } from "@/lib/calendar-cell";
import { calendarKindLegendSwatch } from "@/lib/calendar-cell";
import { cn } from "@/lib/utils";

const ITEMS: { kind: CalendarCellKind; label: string }[] = [
  { kind: "period", label: "Period" },
  { kind: "follicular", label: "Follicular" },
  { kind: "fertile", label: "Fertile" },
  { kind: "ovulation", label: "Ovulation" },
  { kind: "luteal", label: "Luteal" },
  { kind: "predicted", label: "Forecast" },
  { kind: "neutral", label: "No data" },
];

export function CalendarPhaseLegend({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/80 bg-muted/15 px-3 py-3 sm:px-4",
        className,
      )}
      role="region"
      aria-label="Calendar colour key"
    >
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Colour key
      </p>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
        {ITEMS.map(({ kind, label }) => (
          <li key={kind} className="flex items-center gap-2 text-xs text-foreground">
            <span
              className={cn(
                "size-4 shrink-0 rounded-md shadow-sm",
                calendarKindLegendSwatch(kind),
              )}
              aria-hidden
            />
            <span>{label}</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[0.7rem] text-muted-foreground sm:text-xs">
        Indigo dot on a day = symptom log. Dashed forecast = before your first logged period.
      </p>
    </div>
  );
}
