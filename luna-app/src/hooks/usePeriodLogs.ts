"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { PeriodLogDTO } from "@/types/period";

async function fetchPeriodLogs(): Promise<{ periodLogs: PeriodLogDTO[] }> {
  const res = await fetch("/api/periods");
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Failed to load periods");
  }
  return res.json() as Promise<{ periodLogs: PeriodLogDTO[] }>;
}

function invalidateCycleQueries(client: ReturnType<typeof useQueryClient>) {
  void client.invalidateQueries({ queryKey: queryKeys.periods });
  void client.invalidateQueries({ queryKey: queryKeys.predictions });
  void client.invalidateQueries({ queryKey: queryKeys.symptoms });
  void client.invalidateQueries({ queryKey: queryKeys.insights });
}

export function usePeriodLogs() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.periods,
    queryFn: fetchPeriodLogs,
  });

  const create = useMutation({
    mutationFn: async (body: {
      periodStart: string;
      flowIntensity?: string | null;
      notes?: string;
    }) => {
      const res = await fetch("/api/periods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error((data as { error?: string }).error ?? "Could not save period");
      }
      return data as { periodLog: PeriodLogDTO };
    },
    onSuccess: () => invalidateCycleQueries(queryClient),
  });

  const update = useMutation({
    mutationFn: async ({
      id,
      ...body
    }: {
      id: string;
      flowIntensity?: string | null;
      notes?: string | null;
    }) => {
      const res = await fetch(`/api/periods/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error((data as { error?: string }).error ?? "Could not update");
      }
      return data as { periodLog: PeriodLogDTO };
    },
    onSuccess: () => invalidateCycleQueries(queryClient),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/periods/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error((data as { error?: string }).error ?? "Could not delete");
      }
    },
    onSuccess: () => invalidateCycleQueries(queryClient),
  });

  return {
    ...query,
    createPeriod: create.mutateAsync,
    updatePeriod: update.mutateAsync,
    deletePeriod: remove.mutateAsync,
    isCreating: create.isPending,
    isUpdating: update.isPending,
    isDeleting: remove.isPending,
  };
}
