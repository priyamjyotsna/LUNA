"use client";

import { startOfDay } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { MedicalDisclaimer } from "@/components/shared/MedicalDisclaimer";
import { HealthAlertsList } from "@/components/shared/HealthAlertsList";
import { SectionErrorBoundary } from "@/components/shared/SectionErrorBoundary";
import { useCycleData } from "@/hooks/useCycleData";
import { usePredictionNotifications } from "@/hooks/usePredictionNotifications";
import { useSymptomLogForDate } from "@/hooks/useSymptoms";
import {
  DASHBOARD_ALL_SET_FOCUS_TITLE,
  focusActionForDashboard,
} from "@/lib/dashboard-widgets";
import { cn } from "@/lib/utils";
import { DashboardFocusCard } from "./DashboardFocusCard";
import { DashboardPhaseSkeleton } from "./DashboardPhaseSkeleton";
import { FertileWindowBanner } from "./FertileWindowBanner";
import { LatePeriodBanner } from "./LatePeriodBanner";
import { OverviewCards } from "./OverviewCards";
import { PhaseStrip } from "./PhaseStrip";
import { PhaseTimeline } from "./PhaseTimeline";
import { PhaseWheel } from "./PhaseWheel";
import { PredictionRangeBlock } from "./PredictionRangeBlock";
import { SymptomStreakBanner } from "./SymptomStreakBanner";
import { TodayBanner } from "./TodayBanner";

export function DashboardPredictionCard({ className }: { className?: string }) {
  const { prediction, stats, alerts, mode, isLoading, isError, error } = useCycleData();
  const today = startOfDay(new Date());
  const symptomTodayQuery = useSymptomLogForDate(today);

  usePredictionNotifications(prediction, mode, Boolean(prediction && stats));

  const hasSymptomLogToday =
    symptomTodayQuery.isSuccess && Boolean(symptomTodayQuery.data?.symptomLog);
  const focusAction = focusActionForDashboard(
    prediction != null,
    prediction,
    hasSymptomLogToday,
  );
  const showFocusCard =
    !(prediction != null && focusAction.title === DASHBOARD_ALL_SET_FOCUS_TITLE);
  const showFullCycleVisuals = stats != null && stats.count >= 2;

  if (isLoading) {
    return (
      <div
        className={cn("space-y-6", className)}
        aria-busy="true"
        aria-label="Loading dashboard"
      >
        <Skeleton className="h-24 w-full max-w-3xl rounded-xl" />
        <Skeleton className="h-32 w-full max-w-4xl rounded-xl" />
        <Skeleton className="mx-auto h-4 w-full max-w-lg" />
        <Skeleton className="h-14 w-full max-w-2xl rounded-xl" />
        <DashboardPhaseSkeleton />
        <Skeleton className="h-48 w-full rounded-xl" />
        <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
          <Skeleton className="min-h-[300px] w-full rounded-xl" />
          <Skeleton className="min-h-[300px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertTitle>Could not load predictions</AlertTitle>
        <AlertDescription>
          {error instanceof Error ? error.message : "Something went wrong. Try again."}
        </AlertDescription>
      </Alert>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className={cn("space-y-6", className)}>
      {showFocusCard ? (
        <DashboardFocusCard
          hasPeriods={prediction != null}
          prediction={prediction}
          hasSymptomLogToday={hasSymptomLogToday}
        />
      ) : null}

      {!prediction ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Log your first period to see your dashboard, phase wheel, and timeline.
          </p>
          {stats.count === 0 ? (
            <p className="text-xs text-muted-foreground">
              With at least three cycles, your forecasts become more personalised.
            </p>
          ) : null}
          {alerts.length > 0 ? <HealthAlertsList alerts={alerts} /> : null}
        </div>
      ) : (
        <>
          <SectionErrorBoundary title="Today summary could not be shown">
            <div className="overflow-hidden rounded-xl border border-border shadow-sm">
              <PhaseStrip prediction={prediction} />
              <TodayBanner
                prediction={prediction}
                mode={mode}
                className="rounded-none border-0 shadow-none"
              />
            </div>
          </SectionErrorBoundary>

          <MedicalDisclaimer className="text-center text-xs text-muted-foreground md:text-left" />

          <SectionErrorBoundary title="Late-period reminder could not be shown">
            <LatePeriodBanner prediction={prediction} />
          </SectionErrorBoundary>

          <SectionErrorBoundary title="Fertile window notice could not be shown">
            <FertileWindowBanner prediction={prediction} mode={mode} />
          </SectionErrorBoundary>

          <SectionErrorBoundary title="Overview could not be shown">
            <OverviewCards prediction={prediction} stats={stats} />
          </SectionErrorBoundary>

          <SymptomStreakBanner />

          {!showFullCycleVisuals ? (
            <p className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-3 text-center text-sm text-muted-foreground">
              Forecast range and the interactive cycle wheel unlock after at least two cycle gaps
              are in your history. Keep logging period start dates.
            </p>
          ) : (
            <>
              <SectionErrorBoundary title="Prediction range could not be shown">
                <PredictionRangeBlock prediction={prediction} stats={stats} />
              </SectionErrorBoundary>

              <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
                <SectionErrorBoundary title="Phase wheel could not be shown">
                  <PhaseWheel prediction={prediction} stats={stats} className="h-full" />
                </SectionErrorBoundary>
                <SectionErrorBoundary title="Phase timeline could not be shown">
                  <PhaseTimeline prediction={prediction} mode={mode} />
                </SectionErrorBoundary>
              </div>
            </>
          )}

          {alerts.length > 0 ? (
            <SectionErrorBoundary title="Health alerts could not be shown">
              <HealthAlertsList alerts={alerts} />
            </SectionErrorBoundary>
          ) : null}
        </>
      )}
    </div>
  );
}
