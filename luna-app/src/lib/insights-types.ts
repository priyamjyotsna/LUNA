import type {
  CycleStats,
  HealthAlert,
  PhaseSymptomHeatmap,
  UserSettings,
} from "@/lib/cycle-engine";
import type { RecordedFlowLevel } from "@/lib/period-flow";

/** Wire format for GET /api/insights */
export type InsightsSymptomPoint = {
  date: string;
  cramps: number | null;
  stress: number | null;
  energy: number | null;
  bbt: number | null;
};

export type PeriodHistoryRow = {
  id: string;
  periodStart: string;
  cycleLength: number | null;
  flowIntensity: RecordedFlowLevel | null;
  isAnomaly: boolean;
  notes: string | null;
};

/** One completed cycle: period start date → days since previous period. */
export type CycleLengthPoint = {
  date: string;
  cycleLength: number;
};

export type InsightsApiResponse = {
  stats: CycleStats;
  alerts: HealthAlert[];
  mode: "ttc" | "avoid";
  settings: UserSettings;
  /** Cycle-length trend (Phase 8); excludes first period and outlier gaps. */
  cycleLengthSeries: CycleLengthPoint[];
  symptomSeries: InsightsSymptomPoint[];
  phaseSymptomHeatmap: PhaseSymptomHeatmap;
  periodHistory: PeriodHistoryRow[];
  symptomLogCount: number;
};
