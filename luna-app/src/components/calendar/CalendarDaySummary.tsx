"use client";

import { format } from "date-fns";
import Link from "next/link";
import type { FertilityStatus } from "@/lib/cycle-engine";
import type { UserMode } from "@/types";
import type { CalendarDayMeta } from "@/lib/calendar-cell";
import type { SymptomLogDTO } from "@/types/symptom";
import { Button, buttonVariants } from "@/components/ui/button";
import { MedicalDisclaimer } from "@/components/shared/MedicalDisclaimer";
import { PhaseBadge } from "@/components/shared/PhaseBadge";
import { FertilityBadge } from "@/components/shared/FertilityBadge";
import { CycleDayProgressRing } from "@/components/calendar/CycleDayProgressRing";
import { PanelRight, SmilePlus } from "lucide-react";
import { cn } from "@/lib/utils";

const FERTILITY_HELP: Record<FertilityStatus, string> = {
  period: "Period or predicted bleed",
  safe: "Lower fertility window",
  approaching: "Approaching fertile days",
  fertile: "Fertile window",
  peak: "Peak fertility (around ovulation)",
  "safe-post": "After ovulation — typically lower risk for conception",
};

function phaseForBadge(
  meta: CalendarDayMeta,
): "menstrual" | "follicular" | "ovulatory" | "luteal" | "predicted" {
  switch (meta.kind) {
    case "period":
      return "menstrual";
    case "follicular":
      return "follicular";
    case "fertile":
    case "ovulation":
      return "ovulatory";
    case "luteal":
      return "luteal";
    case "predicted":
      return "predicted";
    default:
      return "follicular";
  }
}

function symptomSummary(log: SymptomLogDTO): string {
  const parts: string[] = [];
  if (log.cramps != null && log.cramps > 0) parts.push(`Cramps ${log.cramps}/10`);
  if (log.mood) parts.push(`Mood: ${log.mood}`);
  if (log.stressLevel != null) parts.push(`Stress ${log.stressLevel}/5`);
  if (log.notes?.trim()) parts.push("Has notes");
  return parts.length > 0 ? parts.join(" · ") : "Logged — see Symptoms to edit.";
}

export function CalendarDaySummary({
  date,
  meta,
  mode,
  fertileWindow,
  symptomLog,
  typicalCycleLength,
  onOpenSidePanel,
}: {
  date: Date;
  meta: CalendarDayMeta | null;
  mode: UserMode;
  fertileWindow: { start: Date; end: Date } | null;
  symptomLog: SymptomLogDTO | null | undefined;
  /** Average cycle length for progress ring (~day N of cycle). */
  typicalCycleLength: number;
  onOpenSidePanel: () => void;
}) {
  const heading = format(date, "EEEE, MMMM d, yyyy");

  return (
    <section
      className="rounded-xl border border-border bg-card p-4 shadow-sm"
      aria-label="Selected day cycle details"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-lg font-semibold text-foreground">{heading}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Phase, fertile window, and conception indication for this date.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 gap-1.5"
          onClick={onOpenSidePanel}
        >
          <PanelRight className="size-4" aria-hidden />
          Side panel
        </Button>
      </div>

      <div className="mt-4 space-y-4">
        {!meta || meta.kind === "neutral" ? (
          <p className="text-sm text-muted-foreground">
            No cycle phase estimated for this day. Log period starts so Luna can map your
            calendar.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-start">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
              <PhaseBadge phase={phaseForBadge(meta)} />
              {meta.phaseLabel ? (
                <span className="text-sm font-medium text-foreground">{meta.phaseLabel}</span>
              ) : null}
              </div>

              {meta.cycleDay != null ? (
              <p className="text-sm text-muted-foreground md:hidden">
                <span className="font-medium text-foreground">Cycle day {meta.cycleDay}</span>
                {" · "}relative to the logged period start for this cycle.
              </p>
              ) : null}

              {fertileWindow && meta.kind !== "predicted" ? (
              <div className="rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Fertile window (this cycle)
                </p>
                <p className="mt-1 font-medium text-foreground">
                  {format(fertileWindow.start, "MMM d")} –{" "}
                  {format(fertileWindow.end, "MMM d, yyyy")}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Approximate range from your averages; not a medical guarantee.
                </p>
              </div>
              ) : null}

              {meta.fertility ? (
              <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Conception / fertility indication
                  {mode === "avoid" ? " (avoiding pregnancy)" : " (trying to conceive)"}
                </p>
                <FertilityBadge status={meta.fertility} mode={mode} />
                <p className="text-xs text-muted-foreground">{FERTILITY_HELP[meta.fertility]}</p>
              </div>
              ) : null}
            </div>

            {meta.cycleDay != null ? (
              <div className="flex justify-center md:justify-end md:pt-1">
                <CycleDayProgressRing
                  kind={meta.kind}
                  cycleDay={meta.cycleDay}
                  typicalCycleLength={typicalCycleLength}
                />
              </div>
            ) : null}
          </div>
        )}

        <div className="space-y-2 rounded-lg border border-border p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Symptoms
          </p>
          {symptomLog ? (
            <>
              <p className="text-sm text-foreground">{symptomSummary(symptomLog)}</p>
              {symptomLog.cramps != null && symptomLog.cramps > 0 ? (
                <div className="space-y-1">
                  <p className="text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">
                    Cramps (0–10)
                  </p>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-[width] duration-300"
                      style={{ width: `${Math.min(100, (symptomLog.cramps / 10) * 100)}%` }}
                    />
                  </div>
                </div>
              ) : null}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No symptom log for this day.</p>
          )}
          <Link
            href="/symptoms"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "inline-flex w-full gap-2 no-underline sm:w-auto",
            )}
          >
            <SmilePlus className="size-4" aria-hidden />
            Log symptoms
          </Link>
        </div>
      </div>

      <MedicalDisclaimer className="mt-4 text-xs text-muted-foreground" />
    </section>
  );
}
