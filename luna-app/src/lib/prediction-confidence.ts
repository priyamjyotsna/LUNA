import type { CycleStats } from "@/lib/cycle-engine";

export function predictionConfidenceLabel(stats: CycleStats): {
  label: string;
  detail: string;
} {
  if (stats.count < 1) {
    return {
      label: "Building confidence",
      detail: "Log more full cycles for tighter date ranges.",
    };
  }

  const s = stats.stdDev;
  if (s <= 2) {
    return {
      label: "High confidence",
      detail: "Standard deviation ≤ 2 days based on recent cycles.",
    };
  }
  if (s <= 5) {
    return {
      label: "Moderate confidence",
      detail:
        "Typical variation — your range is wider than for very regular cycles. Logging a few more full periods usually tightens the estimate.",
    };
  }
  return {
    label: "Low confidence — cycle is irregular",
    detail: "Use the full range; consider discussing patterns with a clinician.",
  };
}
