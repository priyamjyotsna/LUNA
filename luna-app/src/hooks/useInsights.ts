"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { InsightsApiResponse } from "@/lib/insights-types";

async function fetchInsights(): Promise<InsightsApiResponse> {
  const res = await fetch("/api/insights");
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Failed to load insights");
  }
  return (await res.json()) as InsightsApiResponse;
}

export function useInsights() {
  return useQuery({
    queryKey: queryKeys.insights,
    queryFn: fetchInsights,
  });
}
