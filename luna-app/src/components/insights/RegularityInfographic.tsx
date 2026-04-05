"use client";

import type { CycleStats } from "@/lib/cycle-engine";
import { cn } from "@/lib/utils";

const REG_STEPS: { key: CycleStats["regularity"]; label: string; hint: string }[] = [
  { key: "very-regular", label: "Very steady", hint: "Little month-to-month change" },
  { key: "regular", label: "Regular", hint: "Typical variation" },
  { key: "slightly-irregular", label: "Some variation", hint: "Worth watching over time" },
  { key: "irregular", label: "Irregular", hint: "Gaps differ quite a bit" },
  { key: "very-irregular", label: "Highly variable", hint: "Talk with a clinician if concerned" },
];

export function RegularityInfographic({
  stats,
  className,
}: {
  stats: CycleStats;
  className?: string;
}) {
  const activeIdx = REG_STEPS.findIndex((s) => s.key === stats.regularity);
  const idx = activeIdx >= 0 ? activeIdx : 2;
  const active = REG_STEPS[idx]!;
  const sigma = stats.stdDev;
  const meterMax = 14;

  return (
    <div className={cn("rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5", className)}>
      <h3 className="font-display text-lg font-semibold text-foreground">Cycle regularity</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        From how much your <span className="font-medium text-foreground">logged</span> cycle lengths
        vary. σ ≈ {stats.stdDev.toFixed(1)} days in your stats window.
      </p>

      <div className="mt-5 space-y-2">
        <div
          className="flex h-3 overflow-hidden rounded-full"
          role="meter"
          aria-valuemin={0}
          aria-valuemax={meterMax}
          aria-valuenow={Number(sigma.toFixed(1))}
          aria-valuetext={`${active.label}; typical spread about ${sigma.toFixed(1)} days between cycles`}
          aria-label={`Cycle regularity: ${active.label} (sigma about ${sigma.toFixed(1)} days)`}
        >
          {REG_STEPS.map((step, i) => (
            <div
              key={step.key}
              className={cn(
                "min-w-0 flex-1 border-r border-background/40 last:border-r-0",
                i === 0 && "bg-emerald-500/80",
                i === 1 && "bg-emerald-400/75",
                i === 2 && "bg-amber-400/85",
                i === 3 && "bg-orange-400/85",
                i === 4 && "bg-rose-500/75",
                i === idx && "ring-2 ring-inset ring-primary/90 dark:ring-primary/70",
              )}
              aria-hidden
            />
          ))}
        </div>
        <div className="flex text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">
          {REG_STEPS.map((s, i) => (
            <span key={s.key} className="min-w-0 flex-1 text-center">
              {i === idx ? <span className="text-foreground">{s.label}</span> : "\u00a0"}
            </span>
          ))}
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        <span className="font-medium text-foreground">{active.label}</span>
        {" — "}
        {active.hint}
      </p>

      {stats.count < 3 ? (
        <p className="mt-3 rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          Add a few more period starts for a steadier read on regularity.
        </p>
      ) : null}
    </div>
  );
}
