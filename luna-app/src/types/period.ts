import {
  flowIntensityForUserDisplay,
  normalizeRecordedFlowIntensity,
  type RecordedFlowLevel,
} from "@/lib/period-flow";

export type PeriodLogDTO = {
  id: string;
  userId: string;
  periodStart: string;
  periodEnd: string | null;
  cycleLength: number | null;
  flowIntensity: RecordedFlowLevel | null;
  isAnomaly: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export function toPeriodLogDTO(row: {
  id: string;
  userId: string;
  periodStart: Date;
  periodEnd: Date | null;
  cycleLength: number | null;
  flowIntensity: string | null;
  flowUserEntered: boolean;
  isAnomaly: boolean;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}): PeriodLogDTO {
  return {
    id: row.id,
    userId: row.userId,
    periodStart: row.periodStart.toISOString(),
    periodEnd: row.periodEnd?.toISOString() ?? null,
    cycleLength: row.cycleLength,
    flowIntensity: flowIntensityForUserDisplay(row),
    isAnomaly: row.isAnomaly,
    notes: row.notes,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** Full snapshot for JSON export (includes whether flow was user-confirmed). */
export function toPeriodLogExportSnapshot(row: {
  id: string;
  userId: string;
  periodStart: Date;
  periodEnd: Date | null;
  cycleLength: number | null;
  flowIntensity: string | null;
  flowUserEntered: boolean;
  isAnomaly: boolean;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: row.id,
    userId: row.userId,
    periodStart: row.periodStart.toISOString(),
    periodEnd: row.periodEnd?.toISOString() ?? null,
    cycleLength: row.cycleLength,
    flowIntensity: normalizeRecordedFlowIntensity(row.flowIntensity),
    flowUserEntered: row.flowUserEntered,
    isAnomaly: row.isAnomaly,
    notes: row.notes,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
