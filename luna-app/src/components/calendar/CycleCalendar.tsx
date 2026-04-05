"use client";

import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCycleData } from "@/hooks/useCycleData";
import { usePeriodLogs } from "@/hooks/usePeriodLogs";
import { useSymptomLogForDate, useSymptomsInMonth } from "@/hooks/useSymptoms";
import {
  calendarCellFertilityLabel,
  calendarDayButtonClassName,
  formatCalendarDayTooltip,
  getCalendarDayMeta,
} from "@/lib/calendar-cell";
import type { PeriodEntry } from "@/lib/cycle-engine";
import { getFertileWindowRangeForDate } from "@/lib/cycle-engine";
import { cn } from "@/lib/utils";
import { CalendarDaySummary } from "./CalendarDaySummary";
import { CalendarMonthSnapshot } from "./CalendarMonthSnapshot";
import { CalendarPhaseLegend } from "./CalendarPhaseLegend";
import { DayDetailSheet } from "./DayDetailSheet";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export function CycleCalendar() {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selected, setSelected] = useState<Date>(() => startOfDay(new Date()));
  const [sheetOpen, setSheetOpen] = useState(false);

  const { data: periodsData, isLoading: periodsLoading } = usePeriodLogs();
  const { data: symptomsData } = useSymptomsInMonth(month);
  const { data: symptomDayData } = useSymptomLogForDate(selected);
  const {
    stats,
    settings,
    mode,
    isLoading: cycleLoading,
    isError,
    error,
  } = useCycleData();

  const periods: PeriodEntry[] = useMemo(() => {
    if (!periodsData?.periodLogs) return [];
    return periodsData.periodLogs.map((p) => ({
      periodStart: parseISO(p.periodStart),
      cycleLength: p.cycleLength,
      isAnomaly: p.isAnomaly,
    }));
  }, [periodsData]);

  const minMonth = useMemo(() => startOfMonth(subMonths(new Date(), 24)), []);
  const maxMonth = useMemo(() => startOfMonth(addMonths(new Date(), 3)), []);

  const monthStart = startOfMonth(month);
  const canPrev = isAfter(monthStart, minMonth);
  const canNext = isBefore(monthStart, maxMonth);

  const gridDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [month]);

  const selectedMeta =
    stats && settings
      ? getCalendarDayMeta(selected, periods, settings, stats)
      : null;

  const fertileWindowForSelected =
    stats && settings
      ? getFertileWindowRangeForDate(selected, periods, settings, stats)
      : null;

  const symptomLogForSelected = symptomDayData?.symptomLog ?? null;

  const loading = periodsLoading || cycleLoading;

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Calendar unavailable</AlertTitle>
        <AlertDescription>
          {error instanceof Error ? error.message : "Could not load cycle data."}
        </AlertDescription>
      </Alert>
    );
  }

  if (loading || !stats) {
    return (
      <div
        className="space-y-4 rounded-xl border border-border bg-card p-4"
        aria-busy="true"
        aria-label="Loading calendar"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-9 w-32" />
        </div>
        <Skeleton className="h-4 w-full max-w-lg" />
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={`h-${i}`} className="h-4 w-full" />
          ))}
          {Array.from({ length: 35 }).map((_, i) => (
            <Skeleton key={`c-${i}`} className="aspect-square w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  function selectDay(d: Date) {
    setSelected(startOfDay(d));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
          {format(month, "MMMM yyyy")}
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setMonth(startOfMonth(new Date()))}
          >
            Today
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            disabled={!canPrev}
            onClick={() => setMonth((m) => subMonths(m, 1))}
            aria-label="Previous month"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            disabled={!canNext}
            onClick={() => setMonth((m) => addMonths(m, 1))}
            aria-label="Next month"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        Navigate up to three months ahead to see predicted windows. Colours follow your logged
        cycles and averages.
      </p>

      <CalendarMonthSnapshot
        month={month}
        gridDays={gridDays}
        periods={periods}
        settings={settings}
        stats={stats}
        symptomLogs={symptomsData?.symptomLogs ?? []}
      />

      <CalendarPhaseLegend />

      <div className="rounded-xl border border-border bg-card p-2 shadow-sm sm:p-3 md:p-4">
        <div className="-mx-1 max-w-[100vw] overflow-x-auto overscroll-x-contain sm:mx-0 sm:max-w-none sm:overflow-visible">
          <div className="grid min-w-[300px] grid-cols-7 gap-0.5 sm:min-w-0 sm:gap-2 md:gap-2.5">
          {WEEKDAYS.map((w) => (
            <div
              key={w}
              className="pb-0.5 text-center text-[0.65rem] font-bold tracking-wide text-slate-600 uppercase dark:text-slate-400 sm:pb-1.5 sm:text-sm"
            >
              {w}
            </div>
          ))}
          {gridDays.map((day) => {
            const inMonth = isSameMonth(day, month);
            const meta = getCalendarDayMeta(day, periods, settings, stats);
            const hasSymptom = (symptomsData?.symptomLogs ?? []).some((log) =>
              isSameDay(parseISO(log.logDate), day),
            );
            const cls = calendarDayButtonClassName(
              meta.kind,
              isToday(day),
              inMonth,
              hasSymptom,
              true,
            );
            const dayNum = format(day, "d");
            const isSelected = isSameDay(day, selected);
            const title =
              stats && settings
                ? formatCalendarDayTooltip(day, meta, mode, periods, settings, stats)
                : format(day, "EEEE, MMMM d, yyyy");
            const phaseFull = meta.phaseLabel ?? "";
            const fertFull = calendarCellFertilityLabel(meta.fertility, mode);
            const ariaLabel = `${format(day, "MMMM d, yyyy")}${
              phaseFull ? ` — ${phaseFull}` : ""
            }${meta.cycleDay != null ? `, Day ${meta.cycleDay}` : ""}${
              fertFull ? `, ${fertFull}` : ""
            }`;
            return (
              <button
                key={day.toISOString()}
                type="button"
                className={cn(
                  cls,
                  isSelected &&
                    "z-[2] ring-2 ring-indigo-400 ring-offset-2 ring-offset-background dark:ring-indigo-500",
                )}
                onClick={() => selectDay(day)}
                title={title}
                aria-label={ariaLabel}
                aria-pressed={isSelected}
              >
                {hasSymptom ? (
                  <span
                    className="absolute right-1 top-1 size-2.5 rounded-full bg-indigo-500 shadow-sm ring-2 ring-white dark:bg-indigo-400 dark:ring-slate-900"
                    title="Symptom log"
                    aria-hidden
                  />
                ) : null}
                <span className="shrink-0 text-base font-bold tabular-nums leading-none sm:text-xl md:text-2xl">
                  {dayNum}
                </span>
                {meta.kind !== "neutral" && phaseFull ? (
                  <span className="hidden max-h-[6rem] min-w-0 flex-1 flex-col justify-center gap-1 overflow-hidden leading-snug md:flex sm:max-h-[6.5rem]">
                    <span className="line-clamp-3 text-balance text-center text-xs font-bold sm:text-sm">
                      {phaseFull}
                    </span>
                    {fertFull ? (
                      <span className="line-clamp-2 text-balance text-center text-[0.7rem] font-bold leading-tight opacity-95 sm:text-xs">
                        {fertFull}
                      </span>
                    ) : null}
                  </span>
                ) : (
                  <span className="hidden text-sm font-bold opacity-60 md:inline">—</span>
                )}
              </button>
            );
          })}
          </div>
        </div>
      </div>

      {stats && settings ? (
        <CalendarDaySummary
          date={selected}
          meta={selectedMeta}
          mode={mode}
          fertileWindow={fertileWindowForSelected}
          symptomLog={symptomLogForSelected}
          typicalCycleLength={stats.average}
          onOpenSidePanel={() => setSheetOpen(true)}
        />
      ) : null}

      <DayDetailSheet
        date={selected}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        meta={selectedMeta}
        mode={mode}
        symptomLog={symptomLogForSelected}
      />
    </div>
  );
}
