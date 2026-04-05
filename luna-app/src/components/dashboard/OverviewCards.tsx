"use client";

import { differenceInDays, format } from "date-fns";
import { CalendarHeart, Droplets, Moon, Orbit } from "lucide-react";
import type { CyclePrediction, CycleStats } from "@/lib/cycle-engine";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function ovulationDayOfCycle(prediction: CyclePrediction): number {
  return differenceInDays(prediction.ovulationDate, prediction.lastPeriod) + 1;
}

function ovulationMainLine(prediction: CyclePrediction): string {
  const d = prediction.daysToOvulation;
  if (d === 0) return "Today";
  if (d > 0) return `In ${d} days`;
  return `${Math.abs(d)} days ago`;
}

export function OverviewCards({
  prediction,
  stats,
  className,
}: {
  prediction: CyclePrediction;
  stats: CycleStats;
  className?: string;
}) {
  const cycleLen = stats.average;
  const ovDay = ovulationDayOfCycle(prediction);
  const rangeStart = format(prediction.nextPeriodEarly, "MMM d");
  const rangeEnd = format(prediction.nextPeriodLate, "MMM d");
  const avgLine = format(prediction.nextPeriodAvg, "MMM d");

  const cards = [
    {
      label: "Day of cycle",
      main: `Day ${prediction.cycleDay}`,
      sub: `of ~${cycleLen}-day cycle`,
      icon: Orbit,
    },
    {
      label: "Next period",
      main:
        prediction.daysToNextPeriod <= 0
          ? "Expected around now"
          : `In ~${prediction.daysToNextPeriod} days`,
      sub: `${rangeStart}–${rangeEnd} (range) · ~${avgLine} most likely`,
      icon: CalendarHeart,
    },
    {
      label: "Ovulation",
      main: ovulationMainLine(prediction),
      sub: `Day ${ovDay} of cycle`,
      icon: Droplets,
    },
    {
      label: "Cycle length",
      main: `${stats.average} days`,
      sub:
        stats.count > 0
          ? `avg over ${stats.count} cycle${stats.count === 1 ? "" : "s"}`
          : "add more logs for stats",
      icon: Moon,
    },
  ];

  return (
    <div
      className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-4", className)}
      aria-label="Cycle overview stats"
    >
      {cards.map(({ label, main, sub, icon: Icon }) => (
        <Card key={label} className="border-border/80 shadow-sm">
          <CardContent className="flex gap-3 p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-5" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {label}
              </p>
              <p className="mt-1 font-display text-xl font-semibold leading-tight text-foreground">
                {main}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
