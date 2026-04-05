"use client";

import { format } from "date-fns";
import type { CyclePrediction } from "@/lib/cycle-engine";
import type { UserMode } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MedicalDisclaimer } from "@/components/shared/MedicalDisclaimer";
import { FertilityBadge } from "@/components/shared/FertilityBadge";
import { cn } from "@/lib/utils";

export function PhaseTimeline({
  prediction,
  mode,
  className,
}: {
  prediction: CyclePrediction;
  mode: UserMode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)} aria-label="Phase timeline">
      <h3 className="text-center font-display text-lg font-semibold md:text-left">
        Phase timeline
      </h3>
      <p className="text-center text-xs leading-relaxed text-muted-foreground md:text-left">
        Luna splits <span className="font-medium text-foreground">early follicular</span> (recovery
        after bleeding) from the{" "}
        <span className="font-medium text-foreground">fertile window</span> on purpose: the fertile
        block is when conception risk is modeled highest, even though biologically phases overlap.
      </p>
      <div className="flex flex-col gap-3">
        {prediction.phases.map((ph) => {
          const active = prediction.currentPhase === ph.phase;
          const isOvulatory = ph.phase === "ovulatory";
          const isLuteal = ph.fertilityStatus === "safe-post";

          return (
            <Card
              key={ph.phase}
              className={cn(
                "relative overflow-hidden border-border/80 transition-shadow",
                active &&
                  "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-md dark:ring-offset-background",
              )}
            >
              {active ? (
                <div
                  className="pointer-events-none absolute inset-0 rounded-lg bg-primary/[0.06] opacity-90"
                  aria-hidden
                />
              ) : null}
              <CardHeader className="relative flex flex-row flex-wrap items-start justify-between gap-2 space-y-0 pb-2">
                <div className="flex items-start gap-2">
                  <span className="text-2xl leading-none" aria-hidden>
                    {ph.icon}
                  </span>
                  <div>
                    <p className="font-display text-base font-semibold">{ph.label}</p>
                    <p className="text-xs text-muted-foreground">
                      Days {ph.startDay}–{ph.endDay} ·{" "}
                      {format(ph.startDate, "MMM d")} – {format(ph.endDate, "MMM d")}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {active ? (
                    <Badge className="bg-primary text-primary-foreground">Now</Badge>
                  ) : null}
                  {isOvulatory && mode === "ttc" ? (
                    <Badge className="border-emerald-600/30 bg-emerald-100 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200">
                      Best days
                    </Badge>
                  ) : null}
                  {isOvulatory && mode === "avoid" ? (
                    <Badge
                      variant="destructive"
                      className="font-semibold"
                    >
                      High risk
                    </Badge>
                  ) : null}
                  {isLuteal && ph.phase === "luteal" ? (
                    <Badge
                      variant="outline"
                      className="border-emerald-600/40 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
                    >
                      Lower risk
                    </Badge>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent className="relative space-y-2 pb-4">
                <p className="text-sm leading-relaxed text-muted-foreground">{ph.description}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted-foreground">Fertility:</span>
                  <FertilityBadge status={ph.fertilityStatus} mode={mode} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <MedicalDisclaimer className="text-[10px] leading-snug text-muted-foreground" />
    </div>
  );
}
