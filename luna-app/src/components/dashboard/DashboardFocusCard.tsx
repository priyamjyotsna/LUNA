"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import type { CyclePrediction } from "@/lib/cycle-engine";
import type { FocusPrimary } from "@/lib/dashboard-widgets";
import { focusActionForDashboard } from "@/lib/dashboard-widgets";
import { usePeriodLogLauncher } from "@/components/dashboard/period-log-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const PRIMARY_HREF: Record<Exclude<FocusPrimary, "period">, string> = {
  symptoms: "/symptoms",
  insights: "/insights",
  calendar: "/calendar",
};

export function DashboardFocusCard({
  hasPeriods,
  prediction,
  hasSymptomLogToday,
  className,
}: {
  hasPeriods: boolean;
  prediction: CyclePrediction | null;
  hasSymptomLogToday: boolean;
  className?: string;
}) {
  const { open: openPeriodLog } = usePeriodLogLauncher();
  const f = focusActionForDashboard(hasPeriods, prediction, hasSymptomLogToday);

  return (
    <Card
      className={cn(
        "border-primary/20 bg-gradient-to-br from-[var(--rose-pale)]/50 via-card to-card shadow-sm dark:from-primary/10 dark:via-card",
        className,
      )}
    >
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex min-w-0 gap-3">
          <span
            className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary"
            aria-hidden
          >
            <Sparkles className="size-5" />
          </span>
          <div className="min-w-0">
            <h2 className="font-display text-lg font-semibold text-foreground">
              {f.title}
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {f.description}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
          {f.primaryAction === "period" ? (
            <Button type="button" className="w-full min-w-[8rem] sm:w-auto" onClick={openPeriodLog}>
              {f.primaryLabel}
            </Button>
          ) : (
            <Button className="w-full min-w-[8rem] sm:w-auto" asChild>
              <Link href={PRIMARY_HREF[f.primaryAction]}>{f.primaryLabel}</Link>
            </Button>
          )}
          {f.secondaryHref ? (
            <Button variant="outline" className="w-full min-w-[8rem] sm:w-auto" asChild>
              <Link href={f.secondaryHref}>{f.secondaryLabel}</Link>
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
