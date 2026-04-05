"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { X } from "lucide-react";
import { useSymptomLoggingStreak } from "@/hooks/useSymptoms";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DISMISS_KEY = "luna-dismiss-symptom-streak";
const STREAK_DISMISS_EVENT = "luna-streak-dismiss";

function subscribeStreakDismiss(onStoreChange: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === DISMISS_KEY || e.key === null) onStoreChange();
  };
  const onLocal = () => onStoreChange();
  window.addEventListener("storage", onStorage);
  window.addEventListener(STREAK_DISMISS_EVENT, onLocal);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(STREAK_DISMISS_EVENT, onLocal);
  };
}

function getStreakDismissed(): boolean {
  try {
    if (localStorage.getItem(DISMISS_KEY) === "1") return true;
  } catch {
    /* private mode / disabled storage */
  }
  try {
    return sessionStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

function getServerStreakDismissed(): boolean {
  return false;
}

function dismissStreakBanner() {
  try {
    localStorage.setItem(DISMISS_KEY, "1");
  } catch {
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  }
  window.dispatchEvent(new Event(STREAK_DISMISS_EVENT));
}

function useStreakBannerDismissed(): boolean {
  return useSyncExternalStore(
    subscribeStreakDismiss,
    getStreakDismissed,
    getServerStreakDismissed,
  );
}

export function SymptomStreakBanner({ className }: { className?: string }) {
  const { data, isLoading } = useSymptomLoggingStreak();
  const dismissed = useStreakBannerDismissed();

  if (dismissed || isLoading || !data || data.distinctDays < 1) return null;

  const { streak, distinctDays } = data;
  const title =
    streak >= 2
      ? `${streak}-day logging streak`
      : streak === 1
        ? "Nice — logged today"
        : "Keep the habit going";
  const desc =
    streak >= 2
      ? "Consecutive days with a symptom entry. Skip a day and the count resets — that is OK."
      : streak === 1
        ? "Come back tomorrow to grow your streak."
        : `You have logged on ${distinctDays} day${distinctDays === 1 ? "" : "s"} recently. Log today to start a streak.`;

  return (
    <div
      className={cn(
        "relative flex flex-col gap-2 rounded-xl border border-indigo-200/60 bg-indigo-50/80 px-4 py-3 pr-10 dark:border-indigo-900/50 dark:bg-indigo-950/40 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
      </div>
      <Button variant="outline" size="sm" className="shrink-0 border-indigo-300/50" asChild>
        <Link href="/symptoms">Open symptoms</Link>
      </Button>
      <button
        type="button"
        onClick={dismissStreakBanner}
        className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground hover:bg-background/80 hover:text-foreground"
        aria-label="Dismiss streak reminder"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
