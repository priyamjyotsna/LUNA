"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  endOfMonth,
  format,
  startOfDay,
  startOfMonth,
  subDays,
} from "date-fns";
import { computeSymptomLoggingStreak } from "@/lib/dashboard-widgets";
import { queryKeys } from "@/lib/query-keys";
import type { SymptomLogInput } from "@/lib/validations/symptom";
import type { SymptomLogDTO } from "@/types/symptom";

function rangeKey(month: Date) {
  const from = format(startOfMonth(month), "yyyy-MM-dd");
  const to = format(endOfMonth(month), "yyyy-MM-dd");
  return { from, to, key: [...queryKeys.symptoms, from, to] as const };
}

export function useSymptomsInMonth(month: Date) {
  const { from, to, key } = rangeKey(month);
  return useQuery({
    queryKey: key,
    queryFn: async (): Promise<{ symptomLogs: SymptomLogDTO[] }> => {
      const res = await fetch(
        `/api/symptoms?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? "Failed to load symptoms");
      }
      return res.json() as Promise<{ symptomLogs: SymptomLogDTO[] }>;
    },
  });
}

/** Single-day symptom log for calendar detail (any month). */
export function useSymptomLogForDate(date: Date | null) {
  const key = date
    ? ([...queryKeys.symptoms, "day", format(date, "yyyy-MM-dd")] as const)
    : (["symptoms", "day", null] as const);

  return useQuery({
    queryKey: key,
    queryFn: async (): Promise<{ symptomLog: SymptomLogDTO | null }> => {
      const d = format(date!, "yyyy-MM-dd");
      const res = await fetch(`/api/symptoms?date=${encodeURIComponent(d)}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? "Failed to load symptoms");
      }
      return res.json() as Promise<{ symptomLog: SymptomLogDTO | null }>;
    },
    enabled: Boolean(date),
  });
}

/** ~4 month lookback for dashboard streak. */
export function useSymptomLoggingStreak() {
  const today = startOfDay(new Date());
  const from = format(subDays(today, 120), "yyyy-MM-dd");
  const to = format(today, "yyyy-MM-dd");
  return useQuery({
    queryKey: [...queryKeys.symptoms, "streak", from, to] as const,
    queryFn: async (): Promise<{ streak: number; distinctDays: number }> => {
      const res = await fetch(
        `/api/symptoms?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? "Failed to load symptoms");
      }
      const data = (await res.json()) as { symptomLogs: SymptomLogDTO[] };
      const daySet = new Set(data.symptomLogs.map((l) => l.logDate.slice(0, 10)));
      const days = [...daySet];
      return {
        streak: computeSymptomLoggingStreak(days, today),
        distinctDays: daySet.size,
      };
    },
  });
}

export function useSaveSymptom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: SymptomLogInput) => {
      const res = await fetch("/api/symptoms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error((data as { error?: string }).error ?? "Could not save");
      }
      return data as { symptomLog: SymptomLogDTO };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.symptoms });
      void queryClient.invalidateQueries({ queryKey: queryKeys.insights });
    },
  });
}
