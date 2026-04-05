"use client";

import { HealthAlertsList } from "@/components/shared/HealthAlertsList";
import { SectionErrorBoundary } from "@/components/shared/SectionErrorBoundary";
import { MedicalDisclaimer } from "@/components/shared/MedicalDisclaimer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { HistoryTable } from "@/components/insights/HistoryTable";
import { InsightsPageSkeleton } from "@/components/insights/InsightsPageSkeleton";
import { PeriodRhythmTimeline } from "@/components/insights/PeriodRhythmTimeline";
import { RegularityInfographic } from "@/components/insights/RegularityInfographic";
import { BbtTrendChart } from "@/components/insights/BbtTrendChart";
import { CyclePersonalityCard } from "@/components/insights/CyclePersonalityCard";
import { StatsGrid } from "@/components/insights/StatsGrid";
import { SymptomHeatmap } from "@/components/insights/SymptomHeatmap";
import { SymptomTrendChart } from "@/components/insights/SymptomTrendChart";
import { TrendChart } from "@/components/insights/TrendChart";
import { useInsights } from "@/hooks/useInsights";

const SYMPTOM_TREND_MIN = 5;

export function InsightsPageClient() {
  const { data, isLoading, isError, error } = useInsights();

  if (isLoading) {
    return <InsightsPageSkeleton />;
  }

  if (isError || !data) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Could not load insights</AlertTitle>
        <AlertDescription>
          {error instanceof Error ? error.message : "Try refreshing the page."}
        </AlertDescription>
      </Alert>
    );
  }

  const showSymptomTrends = data.symptomSeries.length >= SYMPTOM_TREND_MIN;

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <header>
        <h1 className="font-display text-3xl font-semibold">Insights</h1>
        <p className="mt-1 text-muted-foreground">
          Cycle statistics, symptom patterns, and recent period history — for self-tracking
          only, not medical advice.
        </p>
      </header>

      <MedicalDisclaimer className="text-xs text-muted-foreground" />

      <SectionErrorBoundary title="Cycle summary could not be shown">
        <CyclePersonalityCard stats={data.stats} />
      </SectionErrorBoundary>

      <SectionErrorBoundary title="Statistics could not be shown">
        <StatsGrid stats={data.stats} />
      </SectionErrorBoundary>

      <SectionErrorBoundary title="Visual summaries could not be shown">
        <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
          <PeriodRhythmTimeline periodHistory={data.periodHistory} />
          <RegularityInfographic stats={data.stats} />
        </div>
      </SectionErrorBoundary>

      <SectionErrorBoundary title="Cycle trend chart could not be shown">
        <section className="space-y-3">
          <h2 className="font-display text-xl font-semibold">Cycle length trend</h2>
          <TrendChart series={data.cycleLengthSeries} stats={data.stats} />
        </section>
      </SectionErrorBoundary>

      <SectionErrorBoundary title="Health alerts could not be shown">
        <HealthAlertsList alerts={data.alerts} />
      </SectionErrorBoundary>

      {showSymptomTrends ? (
        <SectionErrorBoundary title="Symptom trends could not be shown">
          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold">Symptom trends</h2>
            <SymptomTrendChart data={data.symptomSeries} />
          </section>
        </SectionErrorBoundary>
      ) : null}

      <SectionErrorBoundary title="BBT chart could not be shown">
        <section className="space-y-3">
          <h2 className="font-display text-xl font-semibold">Basal body temperature</h2>
          <BbtTrendChart data={data.symptomSeries} />
        </section>
      </SectionErrorBoundary>

      <SectionErrorBoundary title="Heatmap could not be shown">
        <section className="space-y-3">
          <h2 className="font-display text-xl font-semibold">Symptom heatmap</h2>
          <SymptomHeatmap data={data.phaseSymptomHeatmap} />
        </section>
      </SectionErrorBoundary>

      <SectionErrorBoundary title="Period history table could not be shown">
        <section className="space-y-3">
          <h2 className="font-display text-xl font-semibold">Period history</h2>
          <HistoryTable rows={data.periodHistory} />
        </section>
      </SectionErrorBoundary>
    </div>
  );
}
