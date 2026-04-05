import { differenceInDays, addDays, startOfDay } from "date-fns";

export type PhaseType = "menstrual" | "follicular" | "ovulatory" | "luteal";
export type FertilityStatus =
  | "period"
  | "safe"
  | "approaching"
  | "fertile"
  | "peak"
  | "safe-post";

export interface PeriodEntry {
  periodStart: Date;
  cycleLength?: number | null;
  isAnomaly?: boolean;
}

export interface CycleStats {
  average: number;
  median: number;
  min: number;
  max: number;
  stdDev: number;
  count: number;
  regularity:
    | "very-regular"
    | "regular"
    | "slightly-irregular"
    | "irregular"
    | "very-irregular";
  trend: "shortening" | "stable" | "lengthening";
  validCycles: number[];
}

export interface PhaseWindow {
  phase: PhaseType;
  label: string;
  startDate: Date;
  endDate: Date;
  startDay: number;
  endDay: number;
  color: string;
  icon: string;
  description: string;
  fertilityStatus: FertilityStatus;
}

export interface CyclePrediction {
  lastPeriod: Date;
  nextPeriodEarly: Date;
  nextPeriodAvg: Date;
  nextPeriodLate: Date;
  ovulationDate: Date;
  fertileWindowStart: Date;
  fertileWindowEnd: Date;
  cycleDay: number;
  currentPhase: PhaseType;
  phases: PhaseWindow[];
  daysToNextPeriod: number;
  daysToOvulation: number;
  fertilityStatus: FertilityStatus;
}

export interface UserSettings {
  averageCycleLen: number;
  lutealPhaseLen: number;
  periodDuration: number;
  mode: "ttc" | "avoid";
}

const PHASE_COLORS: Record<PhaseType, string> = {
  menstrual: "#c97b7b",
  follicular: "#7a9e8e",
  ovulatory: "#d4955a",
  luteal: "#9b8fc0",
};

const ANOMALY_THRESHOLD = 45;

export function computeCycleStats(
  periods: PeriodEntry[],
  rollingWindow = 12,
): CycleStats {
  const sorted = [...periods].sort(
    (a, b) => a.periodStart.getTime() - b.periodStart.getTime(),
  );

  const allGaps: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const gap = differenceInDays(
      sorted[i].periodStart,
      sorted[i - 1].periodStart,
    );
    allGaps.push(gap);
  }

  const validGaps = allGaps.filter((g) => g <= ANOMALY_THRESHOLD && g >= 15);

  const windowGaps = validGaps.slice(-rollingWindow);

  if (windowGaps.length === 0) {
    return {
      average: 28,
      median: 28,
      min: 28,
      max: 28,
      stdDev: 0,
      count: 0,
      regularity: "regular",
      trend: "stable",
      validCycles: [],
    };
  }

  const sum = windowGaps.reduce((a, b) => a + b, 0);
  const average = Math.round(sum / windowGaps.length);

  const sorted2 = [...windowGaps].sort((a, b) => a - b);
  const median = sorted2[Math.floor(sorted2.length / 2)];
  const min = sorted2[0];
  const max = sorted2[sorted2.length - 1];

  const variance =
    windowGaps.reduce((acc, v) => acc + Math.pow(v - average, 2), 0) /
    windowGaps.length;
  const stdDev = parseFloat(Math.sqrt(variance).toFixed(1));

  let regularity: CycleStats["regularity"];
  if (stdDev < 2) regularity = "very-regular";
  else if (stdDev < 3) regularity = "regular";
  else if (stdDev < 5) regularity = "slightly-irregular";
  else if (stdDev < 7) regularity = "irregular";
  else regularity = "very-irregular";

  let trend: CycleStats["trend"] = "stable";
  if (windowGaps.length >= 6) {
    const recent = windowGaps.slice(-3);
    const older = windowGaps.slice(-6, -3);
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
    const diff = recentAvg - olderAvg;
    if (diff <= -1.5) trend = "shortening";
    else if (diff >= 1.5) trend = "lengthening";
  }

  return {
    average,
    median,
    min,
    max,
    stdDev,
    count: windowGaps.length,
    regularity,
    trend,
    validCycles: windowGaps,
  };
}

export function computePhaseWindows(
  periodStart: Date,
  settings: UserSettings,
  stats: CycleStats,
): PhaseWindow[] {
  const cycleLen = stats.average || settings.averageCycleLen;
  const luteal = settings.lutealPhaseLen;
  const perdur = settings.periodDuration;
  const ovDay = cycleLen - luteal;

  const add = (days: number) => addDays(startOfDay(periodStart), days);

  return [
    {
      phase: "menstrual",
      label: "Menstrual Phase",
      startDate: add(0),
      endDate: add(perdur - 1),
      startDay: 1,
      endDay: perdur,
      color: PHASE_COLORS.menstrual,
      icon: "🩸",
      description:
        "Your period. The uterine lining sheds. Rest, stay hydrated, and eat iron-rich foods.",
      fertilityStatus: "period",
    },
    {
      phase: "follicular",
      label: "Follicular Phase",
      startDate: add(perdur),
      endDate: add(ovDay - 6),
      startDay: perdur + 1,
      endDay: ovDay - 5,
      color: PHASE_COLORS.follicular,
      icon: "🌱",
      description:
        "Estrogen rises, follicles develop, energy increases. Great time to take on new challenges.",
      fertilityStatus: "safe",
    },
    {
      phase: "ovulatory",
      label: "Fertile Window",
      startDate: add(ovDay - 5),
      endDate: add(ovDay + 1),
      startDay: ovDay - 4,
      endDay: ovDay + 1,
      color: PHASE_COLORS.ovulatory,
      icon: "🌸",
      description: `Ovulation occurs around day ${ovDay}. The egg is viable for 12–24 hours; sperm survive up to 5 days.`,
      fertilityStatus: "fertile",
    },
    {
      phase: "luteal",
      label: "Luteal Phase",
      startDate: add(ovDay + 2),
      endDate: add(cycleLen - 1),
      startDay: ovDay + 2,
      endDay: cycleLen,
      color: PHASE_COLORS.luteal,
      icon: "🌙",
      description:
        "Progesterone rises. PMS symptoms may appear in the second half. Body prepares for next cycle.",
      fertilityStatus: "safe-post",
    },
  ];
}

export function computePredictions(
  periods: PeriodEntry[],
  settings: UserSettings,
  today = new Date(),
): CyclePrediction | null {
  if (periods.length === 0) return null;

  const sorted = [...periods].sort(
    (a, b) => a.periodStart.getTime() - b.periodStart.getTime(),
  );

  const stats = computeCycleStats(sorted);
  const lastPeriod = startOfDay(sorted[sorted.length - 1].periodStart);
  const todayStart = startOfDay(today);

  const cycleDay = differenceInDays(todayStart, lastPeriod) + 1;
  const cycleLen = stats.average;
  const luteal = settings.lutealPhaseLen;
  const ovDay = cycleLen - luteal;

  const nextPeriodAvg = addDays(lastPeriod, cycleLen);
  const nextPeriodEarly = addDays(lastPeriod, stats.min || cycleLen - 2);
  const nextPeriodLate = addDays(lastPeriod, stats.max || cycleLen + 3);

  const ovulationDate = addDays(lastPeriod, ovDay - 1);
  const fertileWindowStart = addDays(lastPeriod, ovDay - 6);
  const fertileWindowEnd = addDays(lastPeriod, ovDay);

  let currentPhase: PhaseType = "luteal";
  if (cycleDay <= settings.periodDuration) currentPhase = "menstrual";
  else if (cycleDay <= ovDay - 5) currentPhase = "follicular";
  else if (cycleDay <= ovDay + 1) currentPhase = "ovulatory";

  let fertilityStatus: FertilityStatus = "safe";
  if (cycleDay <= settings.periodDuration) fertilityStatus = "period";
  else if (cycleDay === ovDay) fertilityStatus = "peak";
  else if (cycleDay >= ovDay - 5 && cycleDay <= ovDay + 1)
    fertilityStatus = "fertile";
  else if (cycleDay >= ovDay - 7 && cycleDay < ovDay - 5)
    fertilityStatus = "approaching";
  else if (cycleDay > ovDay + 1) fertilityStatus = "safe-post";

  const phases = computePhaseWindows(lastPeriod, settings, stats);

  const daysToNextPeriod = differenceInDays(nextPeriodAvg, todayStart);
  const daysToOvulation = differenceInDays(ovulationDate, todayStart);

  return {
    lastPeriod,
    nextPeriodEarly,
    nextPeriodAvg,
    nextPeriodLate,
    ovulationDate,
    fertileWindowStart,
    fertileWindowEnd,
    cycleDay,
    currentPhase,
    phases,
    daysToNextPeriod,
    daysToOvulation,
    fertilityStatus,
  };
}

export function getPhaseForDate(
  date: Date,
  periods: PeriodEntry[],
  settings: UserSettings,
  stats: CycleStats,
): { phase: PhaseType | "predicted"; label: string; cycleDay: number } | null {
  const d = startOfDay(date);
  const sorted = [...periods].sort(
    (a, b) => a.periodStart.getTime() - b.periodStart.getTime(),
  );

  const cycleLen = stats.average;
  const luteal = settings.lutealPhaseLen;
  const ovDay = cycleLen - luteal;

  for (let i = sorted.length - 1; i >= 0; i--) {
    const start = startOfDay(sorted[i].periodStart);
    const cycleEnd = addDays(start, cycleLen - 1);

    if (d >= start && d <= cycleEnd) {
      const dayNum = differenceInDays(d, start) + 1;
      let phase: PhaseType;
      if (dayNum <= settings.periodDuration) phase = "menstrual";
      else if (dayNum <= ovDay - 5) phase = "follicular";
      else if (dayNum <= ovDay + 1) phase = "ovulatory";
      else phase = "luteal";

      let label: string;
      if (phase === "menstrual") {
        label = "Menstrual phase";
      } else if (phase === "follicular") {
        label = "Follicular phase";
      } else if (phase === "ovulatory") {
        label = "Fertile window / ovulatory phase";
      } else {
        const premenstrualFromDay = Math.ceil(cycleLen) - 6;
        label =
          dayNum >= premenstrualFromDay
            ? "Pre-menstrual phase"
            : "Luteal phase";
      }

      return { phase, label, cycleDay: dayNum };
    }
  }

  if (sorted.length > 0) {
    const lastStart = startOfDay(sorted[sorted.length - 1].periodStart);
    const predStart = addDays(lastStart, cycleLen);
    const predEnd = addDays(predStart, settings.periodDuration - 1);
    if (d >= predStart && d <= predEnd) {
      return {
        phase: "predicted",
        label: "Predicted menstrual phase",
        cycleDay: differenceInDays(d, predStart) + 1,
      };
    }
  }

  return null;
}

/**
 * Fertile window (approx.) for the cycle that contains `date`, aligned with `computePhaseWindows`.
 */
export function getFertileWindowRangeForDate(
  date: Date,
  periods: PeriodEntry[],
  settings: UserSettings,
  stats: CycleStats,
): { start: Date; end: Date } | null {
  const sorted = [...periods].sort(
    (a, b) => a.periodStart.getTime() - b.periodStart.getTime(),
  );
  if (sorted.length === 0) return null;

  const d = startOfDay(date);
  const cycleLen = stats.average;
  const ovDay = cycleLen - settings.lutealPhaseLen;

  for (let i = sorted.length - 1; i >= 0; i--) {
    const start = startOfDay(sorted[i].periodStart);
    const cycleEnd = addDays(start, cycleLen - 1);
    if (d >= start && d <= cycleEnd) {
      return {
        start: addDays(start, ovDay - 5),
        end: addDays(start, ovDay),
      };
    }
  }

  return null;
}

/** Fertility indication for any calendar date (matches `computePredictions` rules). */
export function getFertilityStatusForDate(
  date: Date,
  periods: PeriodEntry[],
  settings: UserSettings,
  stats: CycleStats,
): FertilityStatus | null {
  const phaseInfo = getPhaseForDate(date, periods, settings, stats);
  if (!phaseInfo) return null;
  if (phaseInfo.phase === "predicted") return "period";

  const cycleLen = stats.average;
  const ovDay = cycleLen - settings.lutealPhaseLen;
  const cycleDay = phaseInfo.cycleDay;

  if (cycleDay <= settings.periodDuration) return "period";
  if (cycleDay === ovDay) return "peak";
  if (cycleDay >= ovDay - 5 && cycleDay <= ovDay + 1) return "fertile";
  if (cycleDay >= ovDay - 7 && cycleDay < ovDay - 5) return "approaching";
  if (cycleDay > ovDay + 1) return "safe-post";
  return "safe";
}

export interface HealthAlert {
  severity: "info" | "warning" | "critical";
  message: string;
  recommendation: string;
}

export function generateHealthAlerts(stats: CycleStats): HealthAlert[] {
  const alerts: HealthAlert[] = [];

  if (stats.count < 3) {
    alerts.push({
      severity: "info",
      message: "Log at least 3 period dates for accurate predictions.",
      recommendation:
        "The more data you log, the more personalised your predictions become.",
    });
  }

  if (stats.average < 21 && stats.count >= 3) {
    alerts.push({
      severity: "warning",
      message: "Your average cycle is shorter than 21 days (polymenorrhea).",
      recommendation:
        "Consult a gynaecologist to rule out hormonal imbalances.",
    });
  }

  if (stats.average > 35 && stats.count >= 3) {
    alerts.push({
      severity: "warning",
      message: "Your average cycle is longer than 35 days (oligomenorrhea).",
      recommendation:
        "This can be associated with PCOS or thyroid issues. Consider speaking to a doctor.",
    });
  }

  if (stats.regularity === "very-irregular") {
    alerts.push({
      severity: "warning",
      message:
        "Your cycles are highly irregular (standard deviation > 7 days).",
      recommendation:
        "Natural Family Planning may not be reliable. Use additional contraception.",
    });
  }

  if (stats.trend === "shortening") {
    alerts.push({
      severity: "info",
      message: "Your cycles have been getting shorter over the past 6 months.",
      recommendation:
        "This is normal for some women, but worth mentioning to your doctor at your next visit.",
    });
  }

  return alerts;
}

/** One row in the Phase × symptom heatmap (Phase 8 spec). */
export type PhaseSymptomHeatmapRow = {
  id: string;
  label: string;
  counts: Record<PhaseType, number>;
};

/** Symptom frequency by cycle phase, derived from logs + `getPhaseForDate`. */
export type PhaseSymptomHeatmap = {
  phaseOrder: PhaseType[];
  phaseLabels: Record<PhaseType, string>;
  /** How many symptom logs fell in each phase (denominator for tooltips). */
  phaseLogTotals: Record<PhaseType, number>;
  rows: PhaseSymptomHeatmapRow[];
};

export type SymptomLogForPhaseHeatmap = {
  logDate: Date;
  cramps: number | null;
  mood: string | null;
  energyLevel: number | null;
  headache: boolean;
  bloating: boolean;
  fatigue: boolean;
  stressLevel: number | null;
};

const HEATMAP_PHASE_ORDER: PhaseType[] = [
  "menstrual",
  "follicular",
  "ovulatory",
  "luteal",
];

const HEATMAP_PHASE_LABELS: Record<PhaseType, string> = {
  menstrual: "Menstrual",
  follicular: "Follicular",
  ovulatory: "Fertile Window",
  luteal: "Luteal",
};

const HEATMAP_ROW_DEFS: {
  id: string;
  label: string;
  test: (log: SymptomLogForPhaseHeatmap) => boolean;
}[] = [
  { id: "cramps", label: "Cramps", test: (l) => (l.cramps ?? 0) > 0 },
  { id: "mood", label: "Mood", test: (l) => Boolean(l.mood) },
  { id: "energy", label: "Energy", test: (l) => l.energyLevel != null },
  { id: "headache", label: "Headache", test: (l) => l.headache },
  { id: "bloating", label: "Bloating", test: (l) => l.bloating },
  { id: "fatigue", label: "Fatigue", test: (l) => l.fatigue },
  { id: "stress", label: "Stress", test: (l) => l.stressLevel != null },
];

export function computePhaseSymptomHeatmap(
  logs: SymptomLogForPhaseHeatmap[],
  periods: PeriodEntry[],
  settings: UserSettings,
  stats: CycleStats,
): PhaseSymptomHeatmap {
  const emptyCounts = (): Record<PhaseType, number> => ({
    menstrual: 0,
    follicular: 0,
    ovulatory: 0,
    luteal: 0,
  });

  const phaseLogTotals = emptyCounts();
  const bySymptom: Record<string, Record<PhaseType, number>> = {};
  for (const def of HEATMAP_ROW_DEFS) {
    bySymptom[def.id] = emptyCounts();
  }

  for (const log of logs) {
    const info = getPhaseForDate(log.logDate, periods, settings, stats);
    if (!info) continue;

    const phase: PhaseType =
      info.phase === "predicted" ? "menstrual" : info.phase;

    phaseLogTotals[phase] += 1;

    for (const def of HEATMAP_ROW_DEFS) {
      if (def.test(log)) {
        bySymptom[def.id][phase] += 1;
      }
    }
  }

  return {
    phaseOrder: [...HEATMAP_PHASE_ORDER],
    phaseLabels: HEATMAP_PHASE_LABELS,
    phaseLogTotals,
    rows: HEATMAP_ROW_DEFS.map((def) => ({
      id: def.id,
      label: def.label,
      counts: bySymptom[def.id],
    })),
  };
}
