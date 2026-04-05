/** Values the user can explicitly choose when logging flow. Nothing else is treated as recorded data. */
export const RECORDED_FLOW_LEVELS = [
  "spotting",
  "light",
  "moderate",
  "heavy",
] as const;

export type RecordedFlowLevel = (typeof RECORDED_FLOW_LEVELS)[number];

const FLOW_SET = new Set<string>(RECORDED_FLOW_LEVELS);

/**
 * Normalize DB/API flow: only the four explicit levels count as user-provided.
 * Null/empty, UI sentinel `__none__`, and any unknown string are treated as not recorded
 * (column stays available to fill later; nothing is invented in the UI).
 */
export function normalizeRecordedFlowIntensity(
  raw: string | null | undefined,
): RecordedFlowLevel | null {
  if (raw == null) return null;
  const s = raw.trim();
  if (s === "" || s === "__none__") return null;
  if (FLOW_SET.has(s)) return s as RecordedFlowLevel;
  return null;
}

/**
 * Flow shown whenever a valid level is stored. Imports should leave `flowIntensity` null;
 * `flowUserEntered` is still set on create/update for exports and future use.
 */
export function flowIntensityForUserDisplay(row: {
  flowUserEntered: boolean;
  flowIntensity: string | null;
}): RecordedFlowLevel | null {
  void row.flowUserEntered;
  return normalizeRecordedFlowIntensity(row.flowIntensity);
}

export function flowLevelDisplayLabel(level: RecordedFlowLevel): string {
  const m: Record<RecordedFlowLevel, string> = {
    spotting: "Spotting",
    light: "Light",
    moderate: "Moderate",
    heavy: "Heavy",
  };
  return m[level];
}
