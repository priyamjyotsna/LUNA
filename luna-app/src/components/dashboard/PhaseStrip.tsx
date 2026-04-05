"use client";

import type { CyclePrediction } from "@/lib/cycle-engine";
import { cn } from "@/lib/utils";

/** Soft phase-colour bar behind the today summary (cycle proportions). */
export function PhaseStrip({
  prediction,
  className,
}: {
  prediction: CyclePrediction;
  className?: string;
}) {
  const cycleLen = Math.max(
    ...prediction.phases.map((p) => p.endDay),
    prediction.cycleDay,
    1,
  );

  return (
    <div
      className={cn(
        "flex h-2.5 w-full overflow-hidden rounded-full shadow-inner ring-1 ring-black/5 dark:ring-white/10",
        className,
      )}
      role="presentation"
      aria-hidden
    >
      {prediction.phases.map((ph) => {
        const days = Math.max(1, ph.endDay - ph.startDay + 1);
        const pct = (days / cycleLen) * 100;
        return (
          <div
            key={`${ph.phase}-${ph.startDay}`}
            className="min-w-0 transition-[width] duration-500"
            style={{
              width: `${pct}%`,
              backgroundColor: ph.color,
              opacity: 0.85,
            }}
          />
        );
      })}
    </div>
  );
}
