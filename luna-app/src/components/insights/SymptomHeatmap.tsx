"use client";

import type { PhaseSymptomHeatmap } from "@/lib/cycle-engine";
import { cn } from "@/lib/utils";

function cellIntensity(count: number, rowMax: number): number {
  if (rowMax <= 0) return 0;
  return Math.min(1, count / rowMax);
}

export function SymptomHeatmap({
  data,
  className,
}: {
  data: PhaseSymptomHeatmap;
  className?: string;
}) {
  const totalPhaseLogs = data.phaseOrder.reduce(
    (s, p) => s + data.phaseLogTotals[p],
    0,
  );

  if (totalPhaseLogs === 0) {
    return (
      <p
        className={cn(
          "rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground",
          className,
        )}
      >
        Log symptoms on days inside your tracked cycles to see phase patterns here. Period
        history is used to place each log in Menstrual, Follicular, Fertile Window, or Luteal
        phase.
      </p>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-xs text-muted-foreground">
        Rows: symptoms you log · Columns: cycle phase when you logged · Darker = more logs in
        that phase (relative to the row).
      </p>
      <div
        className="overflow-x-auto rounded-xl border border-border bg-card p-3"
        role="grid"
        aria-label="Symptom frequency by cycle phase"
      >
        <div
          className="grid gap-1"
          style={{
            gridTemplateColumns: `minmax(5rem,7rem) repeat(${data.phaseOrder.length}, minmax(2.5rem, 1fr))`,
          }}
        >
          <div />
          {data.phaseOrder.map((ph) => (
            <div
              key={ph}
              className="text-center text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground sm:text-xs"
            >
              {data.phaseLabels[ph]}
            </div>
          ))}
          {data.rows.map((row) => {
            const rowMax = Math.max(
              ...data.phaseOrder.map((ph) => row.counts[ph]),
              1,
            );
            return (
              <div key={row.id} className="contents">
                <div className="flex items-center text-xs font-medium text-foreground sm:text-sm">
                  {row.label}
                </div>
                {data.phaseOrder.map((phase) => {
                  const count = row.counts[phase];
                  const denom = data.phaseLogTotals[phase];
                  const t = cellIntensity(count, rowMax);
                  const phaseName = data.phaseLabels[phase];
                  const title =
                    denom === 0
                      ? `${row.label}: no logs in ${phaseName} phase yet`
                      : `${row.label} logged on ${count} of ${denom} symptom logs (${phaseName} phase)`;
                  return (
                    <div
                      key={`${row.id}-${phase}`}
                      role="gridcell"
                      title={title}
                      aria-label={title}
                        className={cn(
                          "flex aspect-square max-h-10 min-h-8 items-center justify-center rounded-md text-[0.65rem] font-semibold tabular-nums text-foreground/90 sm:max-h-11",
                          count === 0 && "bg-muted/40",
                          count > 0 && t <= 0.25 && "bg-primary/25",
                          count > 0 && t > 0.25 && t <= 0.5 && "bg-primary/45",
                          count > 0 && t > 0.5 && t <= 0.75 && "bg-primary/70",
                          count > 0 && t > 0.75 && "bg-primary text-primary-foreground",
                        )}
                    >
                      {count > 0 ? count : ""}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
