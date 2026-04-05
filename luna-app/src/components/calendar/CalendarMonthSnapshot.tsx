"use client";

import { isSameDay, isSameMonth, parseISO } from "date-fns";
import { Droplets, HeartPulse, SmilePlus } from "lucide-react";
import { useMemo } from "react";
import type { CalendarCellKind } from "@/lib/calendar-cell";
import { getCalendarDayMeta } from "@/lib/calendar-cell";
import type { CycleStats, PeriodEntry, UserSettings } from "@/lib/cycle-engine";
import type { SymptomLogDTO } from "@/types/symptom";
import { cn } from "@/lib/utils";

function isFertileKind(k: CalendarCellKind): boolean {
  return k === "fertile" || k === "ovulation";
}

export function CalendarMonthSnapshot({
  month,
  gridDays,
  periods,
  settings,
  stats,
  symptomLogs,
  className,
}: {
  month: Date;
  gridDays: Date[];
  periods: PeriodEntry[];
  settings: UserSettings;
  stats: CycleStats;
  symptomLogs: SymptomLogDTO[];
  className?: string;
}) {
  const { periodDays, fertileDays, symptomDays } = useMemo(() => {
    let periodDays = 0;
    let fertileDays = 0;
    let symptomDays = 0;

    for (const day of gridDays) {
      if (!isSameMonth(day, month)) continue;
      const meta = getCalendarDayMeta(day, periods, settings, stats);
      if (meta.kind === "period") periodDays += 1;
      if (isFertileKind(meta.kind)) fertileDays += 1;
      if (symptomLogs.some((log) => isSameDay(parseISO(log.logDate), day))) {
        symptomDays += 1;
      }
    }

    return { periodDays, fertileDays, symptomDays };
  }, [gridDays, month, periods, settings, stats, symptomLogs]);

  const chips = [
    {
      label: "Period days",
      value: periodDays,
      icon: Droplets,
      className: "text-rose-700 dark:text-rose-200",
    },
    {
      label: "Fertile / peak days",
      value: fertileDays,
      icon: HeartPulse,
      className: "text-amber-800 dark:text-amber-200",
    },
    {
      label: "Symptom logs",
      value: symptomDays,
      icon: SmilePlus,
      className: "text-indigo-800 dark:text-indigo-200",
    },
  ];

  return (
    <div
      className={cn(
        "flex flex-wrap gap-2 sm:gap-3",
        className,
      )}
      role="region"
      aria-label="This month at a glance"
    >
      {chips.map(({ label, value, icon: Icon, className: chipCls }) => (
        <div
          key={label}
          className="flex min-w-[7.5rem] flex-1 items-center gap-2 rounded-xl border border-border bg-card/90 px-3 py-2 shadow-sm sm:min-w-0 sm:flex-initial sm:px-4"
        >
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/60",
              chipCls,
            )}
            aria-hidden
          >
            <Icon className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="text-lg font-semibold tabular-nums leading-none text-foreground">
              {value}
            </p>
            <p className="mt-0.5 text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">
              {label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
