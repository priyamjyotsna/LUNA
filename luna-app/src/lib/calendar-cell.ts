import { format } from "date-fns";
import type {
  CycleStats,
  FertilityStatus,
  PeriodEntry,
  UserSettings,
} from "@/lib/cycle-engine";
import {
  getFertileWindowRangeForDate,
  getFertilityStatusForDate,
  getPhaseForDate,
} from "@/lib/cycle-engine";
import type { UserMode } from "@/types";
import { cn } from "@/lib/utils";

export type CalendarCellKind =
  | "period"
  | "ovulation"
  | "fertile"
  | "luteal"
  | "follicular"
  | "predicted"
  | "neutral";

export type CalendarDayMeta = {
  kind: CalendarCellKind;
  phaseLabel: string | null;
  cycleDay: number | null;
  fertility: ReturnType<typeof getFertilityStatusForDate>;
};

export function getCalendarDayMeta(
  date: Date,
  periods: PeriodEntry[],
  settings: UserSettings,
  stats: CycleStats,
): CalendarDayMeta {
  const phaseInfo = getPhaseForDate(date, periods, settings, stats);
  const fertility = getFertilityStatusForDate(date, periods, settings, stats);

  if (!phaseInfo) {
    return {
      kind: "neutral",
      phaseLabel: null,
      cycleDay: null,
      fertility: null,
    };
  }

  if (phaseInfo.phase === "predicted") {
    return {
      kind: "predicted",
      phaseLabel: phaseInfo.label,
      cycleDay: phaseInfo.cycleDay,
      fertility,
    };
  }

  if (phaseInfo.phase === "menstrual") {
    return {
      kind: "period",
      phaseLabel: phaseInfo.label,
      cycleDay: phaseInfo.cycleDay,
      fertility,
    };
  }

  if (phaseInfo.phase === "luteal") {
    return {
      kind: "luteal",
      phaseLabel: phaseInfo.label,
      cycleDay: phaseInfo.cycleDay,
      fertility,
    };
  }

  if (phaseInfo.phase === "follicular") {
    return {
      kind: "follicular",
      phaseLabel: phaseInfo.label,
      cycleDay: phaseInfo.cycleDay,
      fertility,
    };
  }

  const cycleLen = stats.average;
  const ovDay = cycleLen - settings.lutealPhaseLen;
  if (phaseInfo.cycleDay === ovDay) {
    return {
      kind: "ovulation",
      phaseLabel: "Ovulation day",
      cycleDay: phaseInfo.cycleDay,
      fertility,
    };
  }

  return {
    kind: "fertile",
    phaseLabel: phaseInfo.label,
    cycleDay: phaseInfo.cycleDay,
    fertility,
  };
}

const RING: Record<CalendarCellKind, string> = {
  period: "ring-rose-300 dark:ring-rose-600",
  ovulation: "ring-orange-300 dark:ring-orange-600",
  fertile: "ring-amber-300 dark:ring-amber-600",
  luteal: "ring-violet-300 dark:ring-violet-500",
  follicular: "ring-teal-300 dark:ring-teal-600",
  predicted: "ring-fuchsia-300 dark:ring-fuchsia-600",
  neutral: "ring-slate-300 dark:ring-slate-600",
};

/**
 * Soft, restrained palette: light tinted surfaces, deep text, thin borders.
 */
const BASE: Record<CalendarCellKind, string> = {
  period:
    "border border-rose-200 bg-rose-50 text-rose-950 shadow-sm dark:border-rose-800 dark:bg-rose-950/55 dark:text-rose-100",
  ovulation:
    "border border-orange-200 bg-orange-50 text-orange-950 shadow-sm dark:border-orange-800 dark:bg-orange-950/50 dark:text-orange-100",
  fertile:
    "border border-amber-200 bg-amber-50 text-amber-950 shadow-sm dark:border-amber-800 dark:bg-amber-950/45 dark:text-amber-100",
  luteal:
    "border border-violet-200 bg-violet-50 text-violet-950 shadow-sm dark:border-violet-800 dark:bg-violet-950/50 dark:text-violet-100",
  follicular:
    "border border-teal-200 bg-teal-50 text-teal-950 shadow-sm dark:border-teal-800 dark:bg-teal-950/45 dark:text-teal-100",
  predicted:
    "border border-dashed border-fuchsia-300 bg-fuchsia-50 text-fuchsia-950 shadow-sm dark:border-fuchsia-700 dark:bg-fuchsia-950/40 dark:text-fuchsia-100",
  neutral:
    "border border-slate-200 bg-slate-100 text-slate-800 shadow-sm dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-100",
};

/** Background/border classes for a legend swatch (same palette as grid cells). */
export function calendarKindLegendSwatch(kind: CalendarCellKind): string {
  return BASE[kind];
}

export function calendarDayButtonClassName(
  kind: CalendarCellKind,
  isToday: boolean,
  inMonth: boolean,
  hasSymptomDot?: boolean,
  /** Narrow screens: number + colour only — full labels in summary below. */
  compact?: boolean,
): string {
  return cn(
    "relative flex h-full w-full flex-col items-center justify-start self-stretch rounded-xl font-bold transition-[opacity,box-shadow]",
    compact
      ? "min-h-10 gap-0 px-0.5 py-0.5 [font-size:0.8125rem] md:min-h-[8rem] md:gap-1 md:px-1.5 md:py-2 md:text-base"
      : "min-h-[8rem] gap-1 px-1.5 py-2 sm:min-h-[8.5rem]",
    BASE[kind],
    !inMonth && "opacity-55",
    isToday && cn("z-[1] ring-2 ring-offset-2 ring-offset-background shadow-sm", RING[kind]),
    hasSymptomDot && "pt-1.5 md:pt-2",
  );
}

function fertilityTooltipLine(status: FertilityStatus, mode: UserMode): string {
  if (mode === "ttc") {
    if (status === "peak") return "Peak fertility — best day to try if timing conception.";
    if (status === "fertile") return "High fertility — good days to try.";
    if (status === "period") return "Period — lower conception likelihood.";
    if (status === "approaching") return "Fertile window approaching.";
    if (status === "safe-post") return "After ovulation — lower fertility.";
    return "Lower fertility window.";
  }
  if (status === "peak") return "Peak conception risk — use protection if avoiding pregnancy.";
  if (status === "fertile") return "High conception risk — use protection.";
  if (status === "approaching") return "Approaching fertile window — plan protection.";
  if (status === "period") return "Menstrual bleeding.";
  if (status === "safe-post") return "Typically lower conception risk after ovulation.";
  return "Lower conception risk.";
}

/** Native tooltip: full date, phase, cycle day, fertility, fertile window range. */
export function formatCalendarDayTooltip(
  date: Date,
  meta: CalendarDayMeta,
  mode: UserMode,
  periods: PeriodEntry[],
  settings: UserSettings,
  stats: CycleStats,
): string {
  const lines: string[] = [];
  lines.push(format(date, "EEEE, MMMM d, yyyy"));
  if (meta.phaseLabel) lines.push(`Phase: ${meta.phaseLabel}`);
  if (meta.cycleDay != null) lines.push(`Cycle day ${meta.cycleDay}`);
  if (meta.fertility) {
    lines.push(fertilityTooltipLine(meta.fertility, mode));
  }
  if (meta.kind !== "neutral" && meta.kind !== "predicted") {
    const fw = getFertileWindowRangeForDate(date, periods, settings, stats);
    if (fw) {
      lines.push(
        `This cycle’s fertile window: ${format(fw.start, "MMM d")} – ${format(fw.end, "MMM d, yyyy")}`,
      );
    }
  }
  return lines.join("\n");
}

/** Full fertility / conception label for calendar cells (no abbreviations). */
export function calendarCellFertilityLabel(
  status: FertilityStatus | null | undefined,
  mode: UserMode,
): string {
  if (!status) return "";
  if (mode === "ttc") {
    const t: Record<FertilityStatus, string> = {
      period: "Menstrual period",
      safe: "Lower fertility window",
      approaching: "Approaching fertile window",
      fertile: "High fertility window",
      peak: "Peak fertility",
      "safe-post": "After ovulation — lower fertility",
    };
    return t[status];
  }
  const a: Record<FertilityStatus, string> = {
    period: "Menstrual period",
    safe: "Lower conception risk",
    approaching: "Approaching fertile window",
    fertile: "High conception risk",
    peak: "Peak conception risk",
    "safe-post": "After ovulation — lower conception risk",
  };
  return a[status];
}
