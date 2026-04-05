"use client";

import { differenceInDays, format, max, parseISO, startOfDay, subMonths } from "date-fns";
import type { PeriodHistoryRow } from "@/lib/insights-types";
import { cn } from "@/lib/utils";

/** Long timeline window so dense histories stay readable. */
const MAX_SPAN_DAYS = 730;

function clampViewRange(rows: PeriodHistoryRow[]): { start: Date; end: Date; items: PeriodHistoryRow[] } | null {
  if (rows.length === 0) return null;

  const sorted = [...rows].sort(
    (a, b) => parseISO(a.periodStart).getTime() - parseISO(b.periodStart).getTime(),
  );
  const dates = sorted.map((r) => startOfDay(parseISO(r.periodStart)));
  const dataFirst = dates[0]!;
  const dataLast = dates[dates.length - 1]!;
  const today = startOfDay(new Date());
  const span = differenceInDays(dataLast, dataFirst);

  let viewStart: Date;
  let viewEnd: Date = max([dataLast, today]);

  if (span > MAX_SPAN_DAYS) {
    viewStart = subMonths(viewEnd, 24);
  } else {
    viewStart = dataFirst;
    const padDays = Math.max(7, Math.round((differenceInDays(viewEnd, viewStart) || 1) * 0.04));
    viewStart = new Date(viewStart.getTime() - padDays * 86400000);
  }

  let items = sorted.filter((r) => {
    const d = startOfDay(parseISO(r.periodStart));
    return d >= viewStart && d <= viewEnd;
  });

  if (items.length === 0) {
    items = sorted;
    viewEnd = max([dataLast, today]);
    viewStart = dataFirst;
    const padDays = Math.max(7, Math.round((differenceInDays(viewEnd, viewStart) || 1) * 0.04));
    viewStart = new Date(viewStart.getTime() - padDays * 86400000);
  }

  return { start: viewStart, end: viewEnd, items };
}

export function PeriodRhythmTimeline({
  periodHistory,
  className,
}: {
  periodHistory: PeriodHistoryRow[];
  className?: string;
}) {
  const range = clampViewRange(periodHistory);

  if (!range || range.items.length === 0) {
    return (
      <p
        className={cn(
          "rounded-xl border border-dashed border-border bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground",
          className,
        )}
      >
        Log at least one period start to see your rhythm across time.
      </p>
    );
  }

  const { start, end, items } = range;
  const totalDays = Math.max(1, differenceInDays(end, start));

  return (
    <div className={cn("rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5", className)}>
      <h3 className="font-display text-lg font-semibold text-foreground">Period rhythm</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Each marker is a period start you logged. Closer markers mean shorter cycles; wider gaps mean
        longer ones. Flagged cycles use a ring.
      </p>

      <div
        className="mt-6"
        role="group"
        aria-label="Timeline of period start dates — each control marks one period start"
      >
        <div className="relative h-14 sm:h-16">
          <div
            className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-gradient-to-r from-[var(--rose-pale)] via-muted to-[var(--rose-pale)] dark:from-rose-950/40 dark:via-muted dark:to-rose-950/40"
            aria-hidden
          />
          {items.map((r) => {
            const d = startOfDay(parseISO(r.periodStart));
            const offset = differenceInDays(d, start);
            const pct = Math.min(100, Math.max(0, (offset / totalDays) * 100));
            const tip = `${format(d, "MMMM d, yyyy")}${r.isAnomaly ? " — flagged gap" : ""}`;
            return (
              <div
                key={r.id}
                className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${pct}%` }}
              >
                <button
                  type="button"
                  className={cn(
                    "group relative flex size-3.5 rounded-full border-2 border-background bg-primary shadow-sm outline-none sm:size-4",
                    "ring-offset-2 focus-visible:ring-2 focus-visible:ring-primary",
                    r.isAnomaly && "bg-amber-500 ring-2 ring-amber-400/80 dark:bg-amber-600",
                  )}
                  aria-label={`Period start on ${tip}`}
                >
                  <span
                    className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-card px-2 py-1 text-[0.7rem] font-medium text-foreground opacity-0 shadow-md transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 sm:text-xs"
                    aria-hidden
                  >
                    {format(d, "MMM d, yyyy")}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <time dateTime={start.toISOString()}>{format(start, "MMM yyyy")}</time>
          <time dateTime={end.toISOString()}>{format(end, "MMM yyyy")}</time>
        </div>
      </div>

    </div>
  );
}
