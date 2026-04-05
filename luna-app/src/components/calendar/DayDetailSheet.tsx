"use client";

import { format } from "date-fns";
import Link from "next/link";
import type { FertilityStatus } from "@/lib/cycle-engine";
import type { UserMode } from "@/types";
import type { CalendarDayMeta } from "@/lib/calendar-cell";
import type { SymptomLogDTO } from "@/types/symptom";
import { buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { MedicalDisclaimer } from "@/components/shared/MedicalDisclaimer";
import { PhaseBadge } from "@/components/shared/PhaseBadge";
import { FertilityBadge } from "@/components/shared/FertilityBadge";
import { SmilePlus } from "lucide-react";
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
  if (log.energyLevel != null) parts.push(`Energy ${log.energyLevel}/5`);
  if (log.stressLevel != null) parts.push(`Stress ${log.stressLevel}/5`);
  if (log.cervicalMucus) parts.push(`Mucus: ${log.cervicalMucus}`);
  if (log.headache) parts.push("Headache");
  if (log.fatigue) parts.push("Fatigue");
  if (log.exercised) parts.push("Exercised");
  if (log.notes?.trim()) parts.push("Has notes");
  return parts.length > 0 ? parts.join(" · ") : "Logged — open Symptoms to edit details.";
}

export function DayDetailSheet({
  date,
  open,
  onOpenChange,
  meta,
  mode,
  symptomLog,
}: {
  date: Date | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meta: CalendarDayMeta | null;
  mode: UserMode;
  symptomLog?: SymptomLogDTO | null;
}) {
  const label = date
    ? format(date, "EEEE, MMMM d, yyyy")
    : "";

  const ariaDay = date ? format(date, "MMMM d") : "";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full max-w-md flex-col gap-4">
        <SheetHeader className="text-left">
          <SheetTitle className="font-display text-2xl">{label}</SheetTitle>
        </SheetHeader>

        {!date ? null : !meta || meta.kind === "neutral" ? (
          <p className="text-sm text-muted-foreground">
            No cycle phase estimated for this day. Log period starts so Luna can map your
            calendar.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <PhaseBadge phase={phaseForBadge(meta)} />
              {meta.phaseLabel ? (
                <span className="text-sm text-muted-foreground">{meta.phaseLabel}</span>
              ) : null}
            </div>

            {meta.cycleDay != null ? (
              <p className="text-sm font-medium text-foreground">
                Day {meta.cycleDay} of this cycle
              </p>
            ) : null}

            {meta.fertility ? (
              <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Fertility indication
                </p>
                <FertilityBadge status={meta.fertility} mode={mode} />
                <p className="text-xs text-muted-foreground">
                  {FERTILITY_HELP[meta.fertility]}
                </p>
              </div>
            ) : null}
          </div>
        )}

        {date ? (
          <div className="space-y-2 rounded-lg border border-border p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Symptoms
            </p>
            {symptomLog ? (
              <>
                <p className="text-sm text-foreground">{symptomSummary(symptomLog)}</p>
                {symptomLog.phase ? (
                  <p className="text-xs text-muted-foreground">
                    Saved as cycle day {symptomLog.cycleDay ?? "—"} · {symptomLog.phase}
                  </p>
                ) : null}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                No symptom log for this day yet.
              </p>
            )}
            <Link
              href="/symptoms"
              className={cn(
                buttonVariants({ variant: "outline", size: "default" }),
                "w-full gap-2 no-underline",
              )}
              aria-label="Open symptoms log"
            >
              <SmilePlus className="size-4" aria-hidden />
              Log or edit symptoms
            </Link>
          </div>
        ) : null}

        <MedicalDisclaimer className="mt-auto text-xs text-muted-foreground" />

        <span className="sr-only" aria-live="polite">
          {open && date
            ? `Details for ${ariaDay}`
            : ""}
        </span>
      </SheetContent>
    </Sheet>
  );
}
