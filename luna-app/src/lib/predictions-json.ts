import { parseISO } from "date-fns";
import type {
  CyclePrediction,
  CycleStats,
  FertilityStatus,
  HealthAlert,
  PhaseType,
  PhaseWindow,
  UserSettings,
} from "@/lib/cycle-engine";

/** Wire format returned by GET /api/predictions */
export type PhaseWindowJson = Omit<PhaseWindow, "startDate" | "endDate"> & {
  startDate: string;
  endDate: string;
};

export type CyclePredictionJson = Omit<
  CyclePrediction,
  | "lastPeriod"
  | "nextPeriodEarly"
  | "nextPeriodAvg"
  | "nextPeriodLate"
  | "ovulationDate"
  | "fertileWindowStart"
  | "fertileWindowEnd"
  | "phases"
> & {
  lastPeriod: string;
  nextPeriodEarly: string;
  nextPeriodAvg: string;
  nextPeriodLate: string;
  ovulationDate: string;
  fertileWindowStart: string;
  fertileWindowEnd: string;
  phases: PhaseWindowJson[];
};

export type PredictionsApiResponse = {
  prediction: CyclePredictionJson | null;
  stats: CycleStats;
  alerts: HealthAlert[];
  mode: "ttc" | "avoid";
  settings: UserSettings;
};

export function cyclePredictionToJson(p: CyclePrediction): CyclePredictionJson {
  return {
    lastPeriod: p.lastPeriod.toISOString(),
    nextPeriodEarly: p.nextPeriodEarly.toISOString(),
    nextPeriodAvg: p.nextPeriodAvg.toISOString(),
    nextPeriodLate: p.nextPeriodLate.toISOString(),
    ovulationDate: p.ovulationDate.toISOString(),
    fertileWindowStart: p.fertileWindowStart.toISOString(),
    fertileWindowEnd: p.fertileWindowEnd.toISOString(),
    cycleDay: p.cycleDay,
    currentPhase: p.currentPhase,
    phases: p.phases.map((ph) => ({
      ...ph,
      startDate: ph.startDate.toISOString(),
      endDate: ph.endDate.toISOString(),
    })),
    daysToNextPeriod: p.daysToNextPeriod,
    daysToOvulation: p.daysToOvulation,
    fertilityStatus: p.fertilityStatus,
  };
}

export function parseCyclePredictionJson(p: CyclePredictionJson): CyclePrediction {
  return {
    lastPeriod: parseISO(p.lastPeriod),
    nextPeriodEarly: parseISO(p.nextPeriodEarly),
    nextPeriodAvg: parseISO(p.nextPeriodAvg),
    nextPeriodLate: parseISO(p.nextPeriodLate),
    ovulationDate: parseISO(p.ovulationDate),
    fertileWindowStart: parseISO(p.fertileWindowStart),
    fertileWindowEnd: parseISO(p.fertileWindowEnd),
    cycleDay: p.cycleDay,
    currentPhase: p.currentPhase as PhaseType,
    phases: p.phases.map((ph) => ({
      ...ph,
      phase: ph.phase as PhaseType,
      startDate: parseISO(ph.startDate),
      endDate: parseISO(ph.endDate),
      fertilityStatus: ph.fertilityStatus as FertilityStatus,
    })),
    daysToNextPeriod: p.daysToNextPeriod,
    daysToOvulation: p.daysToOvulation,
    fertilityStatus: p.fertilityStatus as FertilityStatus,
  };
}

export function parsePredictionsApiResponse(
  data: PredictionsApiResponse,
): {
  prediction: CyclePrediction | null;
  stats: CycleStats;
  alerts: HealthAlert[];
  mode: "ttc" | "avoid";
  settings: UserSettings;
} {
  const mode = data.mode === "ttc" ? "ttc" : "avoid";
  const settings: UserSettings = data.settings ?? {
    averageCycleLen: 28,
    lutealPhaseLen: 14,
    periodDuration: 5,
    mode,
  };
  return {
    prediction: data.prediction ? parseCyclePredictionJson(data.prediction) : null,
    stats: data.stats,
    alerts: data.alerts,
    mode: settings.mode,
    settings,
  };
}
