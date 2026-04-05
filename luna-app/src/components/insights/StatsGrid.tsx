import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CycleStats } from "@/lib/cycle-engine";
import { cn } from "@/lib/utils";

/**
 * Phase 8 — six stat tiles: average, range, recent (6), count, regularity, trend.
 */
export function StatsGrid({ stats, className }: { stats: CycleStats; className?: string }) {
  const last6 = stats.validCycles.slice(-6);
  const recentAvg =
    last6.length === 0
      ? "—"
      : `${(last6.reduce((a, b) => a + b, 0) / last6.length).toFixed(1)} d`;

  const trendDisplay =
    stats.trend === "shortening"
      ? "Shortening ↓"
      : stats.trend === "lengthening"
        ? "Lengthening ↑"
        : "Stable →";

  const regularityDisplay = stats.regularity.replace(/-/g, " ");

  const items = [
    {
      label: "Average cycle",
      value: `${stats.average} d`,
      hint: "From your recent valid cycles",
    },
    {
      label: "Cycle range",
      value: stats.count > 0 ? `${stats.min}–${stats.max} d` : "—",
      hint: "Shortest to longest gap",
    },
    {
      label: "Recent average",
      value: recentAvg,
      hint: "Mean of last 6 cycles",
    },
    {
      label: "Cycles tracked",
      value: String(stats.count),
      hint: "Intervals in your stats window",
    },
    {
      label: "Regularity",
      value: regularityDisplay,
      hint: "Based on day-to-day variation",
    },
    {
      label: "Trend",
      value: trendDisplay,
      hint: "Recent vs earlier gaps",
    },
  ];

  return (
    <div className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {items.map((item) => (
        <Card key={item.label} className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {item.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-2xl font-semibold capitalize">{item.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{item.hint}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
