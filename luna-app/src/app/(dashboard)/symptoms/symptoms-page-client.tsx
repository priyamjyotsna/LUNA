"use client";

import { addMonths, format, startOfMonth } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { SymptomHistory } from "@/components/symptoms/SymptomHistory";
import { SymptomLogForm } from "@/components/symptoms/SymptomLogForm";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSymptomsInMonth } from "@/hooks/useSymptoms";

export function SymptomsPageClient() {
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(new Date()));
  const todayMonth = startOfMonth(new Date());
  const { data, isLoading, refetch } = useSymptomsInMonth(viewMonth);
  const canGoNext =
    addMonths(viewMonth, 1).getTime() <= todayMonth.getTime();

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header>
        <h1 className="font-display text-3xl font-semibold">Symptoms</h1>
        <p className="mt-1 text-muted-foreground">
          Log how you feel. Entries are tied to your cycle day and phase when you save.
        </p>
      </header>
      <SymptomLogForm onSaved={() => refetch()} />
      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl font-semibold">Symptom log history</h2>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={() => setViewMonth((m) => addMonths(m, -1))}
              aria-label="View previous month"
            >
              <ChevronLeft className="size-4" aria-hidden />
            </Button>
            <span className="min-w-[10.5rem] text-center text-sm font-medium tabular-nums">
              {format(viewMonth, "MMMM yyyy")}
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={() => setViewMonth((m) => addMonths(m, 1))}
              disabled={!canGoNext}
              aria-label="View next month"
            >
              <ChevronRight className="size-4" aria-hidden />
            </Button>
          </div>
        </div>
        {isLoading ? (
          <div className="space-y-3 rounded-xl border border-border bg-card p-4" aria-busy="true" aria-label="Loading history">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2 border-b border-border/60 pb-3 last:border-0">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-full max-w-md" />
              </div>
            ))}
          </div>
        ) : (
          <SymptomHistory logs={data?.symptomLogs ?? []} />
        )}
      </section>
    </div>
  );
}
