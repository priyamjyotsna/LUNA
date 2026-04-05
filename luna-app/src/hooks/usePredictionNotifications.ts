"use client";

import { addDays, format, isSameDay, startOfDay } from "date-fns";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { toast } from "sonner";
import type { CyclePrediction } from "@/lib/cycle-engine";

const STORAGE_PREFIX = "luna-ntf";

function storageKey(userId: string, id: string) {
  return `${STORAGE_PREFIX}:${userId}:${id}`;
}

function hasFired(userId: string, id: string): boolean {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(storageKey(userId, id)) === "1";
  } catch {
    return true;
  }
}

function markFired(userId: string, id: string) {
  try {
    localStorage.setItem(storageKey(userId, id), "1");
  } catch {
    /* ignore */
  }
}

/**
 * In-app toasts for prediction milestones (deduped per user + trigger in localStorage).
 */
export function usePredictionNotifications(
  prediction: CyclePrediction | null,
  mode: "ttc" | "avoid",
  enabled: boolean,
) {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? "";

  useEffect(() => {
    if (!enabled || !prediction || !userId) return;

    const today = startOfDay(new Date());
    const early = startOfDay(prediction.nextPeriodEarly);
    const avg = startOfDay(prediction.nextPeriodAvg);
    const fStart = startOfDay(prediction.fertileWindowStart);

    const maybeToast = (id: string, message: string) => {
      if (hasFired(userId, id)) return;
      toast(message, { duration: 12_000 });
      markFired(userId, id);
    };

    // 7 days before earliest predicted start
    if (isSameDay(today, addDays(early, -7))) {
      maybeToast(
        `early-7:${format(early, "yyyy-MM-dd")}`,
        "Your period may arrive in about a week. Stock up on supplies.",
      );
    }

    // 3 days before average
    if (isSameDay(today, addDays(avg, -3))) {
      maybeToast(
        `avg-3:${format(avg, "yyyy-MM-dd")}`,
        "Your period is approaching in ~3 days. Prepare.",
      );
    }

    // Day of average predicted start
    if (isSameDay(today, avg)) {
      maybeToast(
        `avg-0:${format(avg, "yyyy-MM-dd")}`,
        "Period expected today. Log it when it starts.",
      );
    }

    // 3 / 7 days after average if still overdue vs prediction model
    if (prediction.daysToNextPeriod === -3) {
      maybeToast(
        `late-3:${format(avg, "yyyy-MM-dd")}`,
        "No period logged yet. Is it late?",
      );
    }
    if (prediction.daysToNextPeriod === -7) {
      maybeToast(
        `late-7:${format(avg, "yyyy-MM-dd")}`,
        "Your period appears late. Consider a pregnancy test, or consult a doctor if concerned.",
      );
    }

    // Fertile window starts tomorrow
    if (isSameDay(addDays(today, 1), fStart)) {
      if (mode === "avoid") {
        maybeToast(
          `fw-avoid:${format(fStart, "yyyy-MM-dd")}`,
          "Your fertile window begins tomorrow. Use protection.",
        );
      } else {
        maybeToast(
          `fw-ttc:${format(fStart, "yyyy-MM-dd")}`,
          "Your fertile window starts tomorrow — best days to try to conceive.",
        );
      }
    }

  }, [enabled, prediction, mode, userId]);
}
