"use client";

import type { CyclePrediction } from "@/lib/cycle-engine";
import type { UserMode } from "@/types";
import { cn } from "@/lib/utils";

function bannerFor(
  prediction: CyclePrediction,
  mode: UserMode,
): { icon: string; title: string; message: string } {
  const { currentPhase, cycleDay, fertilityStatus, daysToNextPeriod } = prediction;

  if (fertilityStatus === "period" || currentPhase === "menstrual") {
    return {
      icon: "🩸",
      title: `Period Day ${cycleDay}`,
      message: "Rest and take care of yourself today.",
    };
  }

  if (fertilityStatus === "peak") {
    return {
      icon: "🥚",
      title: "Ovulation Day",
      message: "Peak fertility today. Egg released.",
    };
  }

  if (fertilityStatus === "fertile" || fertilityStatus === "approaching") {
    return {
      icon: "🌸",
      title: "Fertile Window",
      message:
        mode === "ttc"
          ? "Great days to try to conceive."
          : "High pregnancy risk — use protection.",
    };
  }

  if (daysToNextPeriod >= 1 && daysToNextPeriod <= 3) {
    return {
      icon: "📅",
      title: "Period Approaching",
      message: `Your period is expected in ~${daysToNextPeriod} days.`,
    };
  }

  if (currentPhase === "luteal") {
    return {
      icon: "🌙",
      title: "Luteal Phase",
      message: `Progesterone is high. Period in ~${Math.max(0, daysToNextPeriod)} days.`,
    };
  }

  if (currentPhase === "follicular") {
    return {
      icon: "🌱",
      title: "Follicular Phase",
      message: "Energy is building! Great week for new projects.",
    };
  }

  return {
    icon: "🌙",
    title: "Today",
    message: "Track how you feel and stay hydrated.",
  };
}

export function TodayBanner({
  prediction,
  mode,
  className,
}: {
  prediction: CyclePrediction;
  mode: UserMode;
  className?: string;
}) {
  const { icon, title, message } = bannerFor(prediction, mode);

  return (
    <div
      className={cn(
        "flex gap-4 rounded-xl border border-border bg-gradient-to-br from-[var(--rose-pale)]/80 to-card px-5 py-5 shadow-sm dark:from-[var(--rose)]/10 dark:to-card md:px-6 md:py-6",
        className,
      )}
      role="region"
      aria-label="Today summary"
    >
      <span className="font-display text-4xl leading-none select-none md:text-5xl" aria-hidden>
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p
          className="font-display text-xl font-semibold tracking-tight text-foreground md:text-2xl"
          role="status"
        >
          {title}
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground md:text-base">{message}</p>
      </div>
    </div>
  );
}
