"use client";

import { format, parseISO, subMonths } from "date-fns";
import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CycleLengthPoint } from "@/lib/insights-types";
import type { CycleStats } from "@/lib/cycle-engine";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type RangeKey = "3m" | "6m" | "1y" | "all";

const RANGE_LABELS: Record<RangeKey, string> = {
  "3m": "3 mo",
  "6m": "6 mo",
  "1y": "1 yr",
  all: "All",
};

function monthsForRange(k: RangeKey): number | null {
  if (k === "3m") return 3;
  if (k === "6m") return 6;
  if (k === "1y") return 12;
  return null;
}

function dotFill(length: number, avg: number, std: number): string {
  const d = Math.abs(length - avg);
  if (std < 0.01) return d < 1 ? "#22c55e" : "#f59e0b";
  if (d <= std) return "#22c55e";
  if (d <= 2 * std) return "#f59e0b";
  return "#ef4444";
}

/**
 * Phase 8 spec: cycle lengths over time with personal average (dashed) and ±1σ band.
 */
export function TrendChart({
  series,
  stats,
  className,
}: {
  series: CycleLengthPoint[];
  stats: CycleStats;
  className?: string;
}) {
  const [range, setRange] = useState<RangeKey>("all");

  const filtered = useMemo(() => {
    if (series.length === 0) return [];
    const end = parseISO(series[series.length - 1].date);
    const mo = monthsForRange(range);
    if (mo == null) return series;
    const start = subMonths(end, mo);
    return series.filter((p) => parseISO(p.date) >= start);
  }, [series, range]);

  const avg = stats.average;
  const std = stats.stdDev;

  if (series.length === 0) {
    return (
      <p
        className={cn(
          "rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground",
          className,
        )}
      >
        Log at least two periods to see cycle length changes over time.
      </p>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">Range:</span>
        {(Object.keys(RANGE_LABELS) as RangeKey[]).map((k) => (
          <Button
            key={k}
            type="button"
            variant={range === k ? "default" : "outline"}
            size="sm"
            className="h-8 rounded-md px-2.5 text-xs"
            onClick={() => setRange(k)}
          >
            {RANGE_LABELS[k]}
          </Button>
        ))}
      </div>
      <div className="h-80 w-full rounded-xl border border-border bg-card p-2 pt-4 shadow-sm">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={filtered} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted/40" />
            {std > 0 ? (
              <ReferenceArea
                y1={avg - std}
                y2={avg + std}
                fill="var(--rose-pale)"
                fillOpacity={0.35}
                strokeOpacity={0}
              />
            ) : null}
            <ReferenceLine
              y={avg}
              stroke="#c97b7b"
              strokeDasharray="6 4"
              strokeWidth={2}
              label={{
                value: `Avg ${avg}`,
                position: "insideTopRight",
                fill: "var(--muted-foreground)",
                fontSize: 10,
              }}
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10 }}
              tickFormatter={(v: string) => format(parseISO(v), "MMM ''yy")}
              minTickGap={18}
            />
            <YAxis domain={[18, 40]} tick={{ fontSize: 10 }} width={32} label={{ value: "Days", angle: -90, position: "insideLeft", fontSize: 10 }} />
            <Tooltip
              labelFormatter={(label) => format(parseISO(String(label)), "MMM d, yyyy")}
              formatter={(value) => [
                typeof value === "number" ? `${value} days` : `${String(value)} days`,
                "Cycle length",
              ]}
              contentStyle={{ borderRadius: "8px", fontSize: "12px" }}
            />
            <Line
              type="monotone"
              dataKey="cycleLength"
              name="Cycle length"
              stroke="#57534e"
              strokeWidth={2}
              connectNulls
              dot={(props: {
                cx?: number;
                cy?: number;
                payload?: { cycleLength: number };
              }) => {
                const { cx, cy, payload } = props;
                if (cx == null || cy == null || payload == null) return null;
                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={5}
                    fill={dotFill(payload.cycleLength, avg, std)}
                    stroke="var(--card)"
                    strokeWidth={1.5}
                  />
                );
              }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-muted-foreground">
        Dots: <span className="text-emerald-600 dark:text-emerald-400">within 1σ</span>
        {" · "}
        <span className="text-amber-600 dark:text-amber-400">1–2σ</span>
        {" · "}
        <span className="text-red-600 dark:text-red-400">&gt;2σ</span> from your average. Shaded
        band is ±1 standard deviation.
      </p>
    </div>
  );
}
