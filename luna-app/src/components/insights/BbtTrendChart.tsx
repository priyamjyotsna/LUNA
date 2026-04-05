"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { InsightsSymptomPoint } from "@/lib/insights-types";
import { cn } from "@/lib/utils";

const MIN_BBTS_FOR_CHART = 5;

type Row = { date: string; bbt: number };

/** BBT vs °C with reference line at 37°C (illustrative; not medical interpretation). */
export function BbtTrendChart({
  data,
  className,
}: {
  data: InsightsSymptomPoint[];
  className?: string;
}) {
  const series: Row[] = data
    .filter((p) => p.bbt != null && Number.isFinite(p.bbt))
    .map((p) => ({ date: p.date, bbt: p.bbt as number }));

  if (series.length === 0) {
    return (
      <p
        className={cn(
          "rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground",
          className,
        )}
      >
        Log basal body temperature (BBT) on the Symptoms page to see it charted here.
      </p>
    );
  }

  if (series.length < MIN_BBTS_FOR_CHART) {
    return (
      <p
        className={cn(
          "rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground",
          className,
        )}
      >
        A clearer BBT line needs at least {MIN_BBTS_FOR_CHART} days with temperature logged (you
        have {series.length}). Keep logging — the chart will unlock soon.
      </p>
    );
  }

  const lows = series.map((r) => r.bbt);
  const yMin = Math.floor((Math.min(...lows) - 0.15) * 10) / 10;
  const yMax = Math.ceil((Math.max(...lows) + 0.15) * 10) / 10;

  return (
    <div
      className={cn(
        "h-72 w-full rounded-xl border border-border bg-card p-2 pt-4 shadow-sm",
        className,
      )}
    >
      <p className="px-2 pb-2 text-xs text-muted-foreground">
        Reference line at 37°C is a common visual anchor; interpretation is personal and not a
        diagnosis.
      </p>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted/40" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10 }}
            tickFormatter={(v: string) => v.slice(5)}
            minTickGap={24}
          />
          <YAxis
            domain={[yMin, yMax]}
            tick={{ fontSize: 10 }}
            width={36}
            label={{ value: "°C", angle: -90, position: "insideLeft", fontSize: 10 }}
          />
          <Tooltip
            labelFormatter={(label) => String(label)}
            formatter={(value) =>
              typeof value === "number"
                ? [`${value.toFixed(2)} °C`, "BBT"]
                : [String(value ?? ""), "BBT"]
            }
            contentStyle={{
              borderRadius: "8px",
              fontSize: "12px",
            }}
          />
          <ReferenceLine
            y={37}
            stroke="#c97b7b"
            strokeDasharray="4 4"
            label={{ value: "37°C", position: "right", fontSize: 10, fill: "var(--muted-foreground)" }}
          />
          <Line
            type="monotone"
            dataKey="bbt"
            name="BBT (°C)"
            stroke="#7a9e8e"
            strokeWidth={2}
            dot={{ r: 3, strokeWidth: 1 }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
