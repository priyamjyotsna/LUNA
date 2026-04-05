"use client";

import type { CycleStats } from "@/lib/cycle-engine";
import { cn } from "@/lib/utils";

const MIN_CYCLES = 6;

function blurb(stats: CycleStats): string {
  const { average, min, max, count, regularity, trend } = stats;
  const reg = regularity.replace(/-/g, " ");
  const trendLine =
    trend === "shortening"
      ? "Recent gaps look a bit shorter than earlier ones."
      : trend === "lengthening"
        ? "Recent gaps look a bit longer than earlier ones."
        : "Cycle length has been fairly stable lately.";
  return `Across ${count} logged intervals, your typical gap is about ${average} days (${min}–${max} day range). That reads as ${reg}. ${trendLine} Keep logging period starts so this stays tuned to you — for awareness only, not a diagnosis.`;
}

export function CyclePersonalityCard({
  stats,
  className,
}: {
  stats: CycleStats;
  className?: string;
}) {
  if (stats.count < MIN_CYCLES) {
    return (
      <div
        className={cn(
          "rounded-xl border border-dashed border-border bg-muted/15 px-4 py-6 text-center text-sm text-muted-foreground",
          className,
        )}
      >
        Log at least {MIN_CYCLES} cycle gaps to unlock your plain-English cycle summary here.
      </div>
    );
  }

  return (
    <section
      className={cn(
        "rounded-xl border border-primary/20 bg-gradient-to-br from-[var(--rose-pale)]/40 via-card to-card p-5 shadow-sm dark:from-primary/10 dark:via-card",
        className,
      )}
      aria-label="Your cycle summary"
    >
      <h2 className="font-display text-lg font-semibold text-foreground">Your rhythm, in words</h2>
      <p className="mt-3 text-sm leading-relaxed text-foreground">{blurb(stats)}</p>
    </section>
  );
}
