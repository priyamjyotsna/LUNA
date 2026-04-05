"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  parsePredictionsApiResponse,
  type PredictionsApiResponse,
} from "@/lib/predictions-json";
import type {
  CyclePrediction,
  CycleStats,
  HealthAlert,
  UserSettings,
} from "@/lib/cycle-engine";

async function fetchPredictions(): Promise<{
  prediction: CyclePrediction | null;
  stats: CycleStats;
  alerts: HealthAlert[];
  mode: "ttc" | "avoid";
  settings: UserSettings;
}> {
  const res = await fetch("/api/predictions");
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Failed to load predictions");
  }
  const data = (await res.json()) as PredictionsApiResponse;
  return parsePredictionsApiResponse(data);
}

/**
 * Live cycle prediction, stats, and health alerts for the signed-in user.
 * Invalidates when period logs change (see usePeriodLogs).
 */
export function useCycleData() {
  const query = useQuery({
    queryKey: queryKeys.predictions,
    queryFn: fetchPredictions,
  });

  const defaultSettings: UserSettings = {
    averageCycleLen: 28,
    lutealPhaseLen: 14,
    periodDuration: 5,
    mode: "avoid",
  };

  return {
    prediction: query.data?.prediction ?? null,
    stats: query.data?.stats,
    alerts: query.data?.alerts ?? [],
    mode: query.data?.mode ?? "avoid",
    settings: query.data?.settings ?? defaultSettings,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
