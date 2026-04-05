import { format, startOfDay, subDays } from "date-fns";
import type { CyclePrediction } from "@/lib/cycle-engine";

/** Consecutive calendar days with a symptom log, counting backward from today. */
export function computeSymptomLoggingStreak(
  loggedIsoDays: readonly string[],
  today = new Date(),
): number {
  const set = new Set(loggedIsoDays.map((d) => d.slice(0, 10)));
  let d = startOfDay(today);
  let streak = 0;
  while (set.has(format(d, "yyyy-MM-dd"))) {
    streak += 1;
    d = subDays(d, 1);
    if (streak > 400) break;
  }
  return streak;
}

export type FocusPrimary = "period" | "symptoms" | "insights" | "calendar";

export type FocusAction = {
  title: string;
  description: string;
  primaryLabel: string;
  primaryAction: FocusPrimary;
  secondaryLabel?: string;
  secondaryHref?: string;
};

/** Shown when symptoms are logged and no higher-priority focus applies; hide focus card if TodayBanner already carries context. */
export const DASHBOARD_ALL_SET_FOCUS_TITLE = "You're all set for today" as const;

export function focusActionForDashboard(
  hasPeriods: boolean,
  prediction: CyclePrediction | null,
  hasSymptomLogToday: boolean,
): FocusAction {
  if (!hasPeriods || !prediction) {
    return {
      title: "Start your timeline",
      description: "Add your most recent period start date — Luna will build predictions from there.",
      primaryLabel: "Log period",
      primaryAction: "period",
      secondaryLabel: "Calendar",
      secondaryHref: "/calendar",
    };
  }

  if (!hasSymptomLogToday) {
    return {
      title: "Quick check-in",
      description: "A one-minute symptom log helps spot patterns in Insights over time.",
      primaryLabel: "Log today's symptoms",
      primaryAction: "symptoms",
      secondaryLabel: "Calendar",
      secondaryHref: "/calendar",
    };
  }

  if (
    prediction.daysToNextPeriod <= 1 &&
    prediction.fertilityStatus !== "period"
  ) {
    return {
      title: "Period may be close",
      description: "If your bleed has started, log the new period so averages stay accurate.",
      primaryLabel: "Log new period",
      primaryAction: "period",
      secondaryLabel: "Calendar",
      secondaryHref: "/calendar",
    };
  }

  if (prediction.daysToNextPeriod >= 2 && prediction.daysToNextPeriod <= 5) {
    return {
      title: "Coming up soon",
      description: `Period rough estimate in about ${prediction.daysToNextPeriod} days — adjust anytime after it starts.`,
      primaryLabel: "Open calendar",
      primaryAction: "calendar",
      secondaryLabel: "Log symptoms",
      secondaryHref: "/symptoms",
    };
  }

  return {
    title: DASHBOARD_ALL_SET_FOCUS_TITLE,
    description: "Explore Insights for trends, or browse the month on the calendar.",
    primaryLabel: "View insights",
    primaryAction: "insights",
    secondaryLabel: "Symptoms",
    secondaryHref: "/symptoms",
  };
}
