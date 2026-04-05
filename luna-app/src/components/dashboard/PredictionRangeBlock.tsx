"use client";

import { differenceInDays, format } from "date-fns";
import { CircleHelp } from "lucide-react";
import type { CyclePrediction, CycleStats } from "@/lib/cycle-engine";
import { predictionConfidenceLabel } from "@/lib/prediction-confidence";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function PredictionRangeBlock({
  prediction,
  stats,
  className,
}: {
  prediction: CyclePrediction;
  stats: CycleStats;
  className?: string;
}) {
  const early = prediction.nextPeriodEarly;
  const avg = prediction.nextPeriodAvg;
  const late = prediction.nextPeriodLate;
  const span = Math.max(1, differenceInDays(late, early));
  const offset = Math.min(span, Math.max(0, differenceInDays(avg, early)));
  const pct = (offset / span) * 100;
  const conf = predictionConfidenceLabel(stats);

  return (
    <section
      className={cn(
        "rounded-xl border border-border bg-card p-5 shadow-sm md:p-6",
        className,
      )}
      aria-label="Next period prediction range"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Next period expected
          </p>
          <p className="mt-1 font-display text-2xl font-semibold text-foreground md:text-3xl">
            {format(early, "MMM d")} – {format(late, "MMM d")}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Most likely around{" "}
            <span className="font-medium text-foreground">{format(avg, "MMM d")}</span>
          </p>
        </div>
        <span className="flex shrink-0 items-center gap-1.5">
          <Badge variant="outline" className="font-normal" title={conf.detail}>
            {conf.label}
          </Badge>
          <button
            type="button"
            className="inline-flex rounded-sm text-muted-foreground outline-offset-2 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            title={conf.detail}
            aria-label={`About ${conf.label}: ${conf.detail}`}
          >
            <CircleHelp className="size-4 shrink-0" aria-hidden />
          </button>
        </span>
      </div>

      <div className="mt-5 space-y-2">
        <div className="relative h-4 overflow-hidden rounded-full bg-gradient-to-r from-[var(--rose-light)] via-[var(--rose-pale)] to-[var(--rose-light)] dark:from-rose-950/50 dark:via-rose-900/30 dark:to-rose-950/50">
          <span
            className="pointer-events-none absolute inset-y-0 left-0 w-px bg-foreground/25"
            style={{ left: 0 }}
            aria-hidden
          />
          <span
            className="pointer-events-none absolute inset-y-0 right-0 w-px bg-foreground/25"
            style={{ right: 0 }}
            aria-hidden
          />
          <span
            className="pointer-events-none absolute top-1/2 z-10 h-6 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-sm"
            style={{ left: `${pct}%` }}
            title="Most likely (average-based)"
            aria-label="Most likely date marker"
          />
        </div>
        <div className="flex justify-between text-[11px] text-muted-foreground">
          <span>Earlier ({format(early, "MMM d")})</span>
          <span>Later ({format(late, "MMM d")})</span>
        </div>
        <p className="text-xs text-muted-foreground">{conf.detail}</p>
      </div>
    </section>
  );
}
