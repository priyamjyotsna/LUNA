"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { UserPatchInput } from "@/lib/validations/user";

export type UserProfile = {
  id: string;
  name: string | null;
  email: string | null;
  averageCycleLen: number;
  lutealPhaseLen: number;
  periodDuration: number;
  mode: "ttc" | "avoid";
  notificationsOn: boolean;
  theme: string;
  dateOfBirth: string | null;
};

async function fetchUser(): Promise<{ user: UserProfile }> {
  const res = await fetch("/api/user");
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Failed to load profile");
  }
  return res.json() as Promise<{ user: UserProfile }>;
}

export function useUser() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: queryKeys.user,
    queryFn: fetchUser,
  });

  const save = useMutation({
    mutationFn: async (patch: UserPatchInput) => {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error((data as { error?: string }).error ?? "Could not save settings");
      }
      return data as { user: UserProfile };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.user, data);
      void queryClient.invalidateQueries({ queryKey: queryKeys.predictions });
      void queryClient.invalidateQueries({ queryKey: queryKeys.insights });
    },
  });

  return {
    ...query,
    saveProfile: save.mutateAsync,
    isSaving: save.isPending,
  };
}
