"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { InsightsSymptomPoint } from "@/lib/insights-types";
import { cn } from "@/lib/utils";

const MIN_POINTS_FOR_CHART = 5;

/** Symptom cramps / stress / energy over time (Phase 7 follow-on, not the spec Phase 8 cycle-length chart). */
export function SymptomTrendChart({
  data,
  className,
}: {
  data: InsightsSymptomPoint[];
  className?: string;
}) {
  if (data.length === 0) {
    return (
      <p
        className={cn(
          "rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground",
          className,
        )}
      >
        Log symptoms with cramps or stress to see trends here.
      </p>
    );
  }

  if (data.length < MIN_POINTS_FOR_CHART) {
    return (
      <p
        className={cn(
          "rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground",
          className,
        )}
      >
        A clearer trend needs at least {MIN_POINTS_FOR_CHART} symptom days with cramps or
        stress logged (you have {data.length}). Keep logging — the chart will unlock soon.
      </p>
    );
  }

  return (
    <div
      className={cn(
        "h-72 w-full rounded-xl border border-border bg-card p-2 pt-4 shadow-sm",
        className,
      )}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted/40" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10 }}
            tickFormatter={(v: string) => v.slice(5)}
            minTickGap={24}
          />
          <YAxis
            yAxisId="left"
            domain={[0, 10]}
            tick={{ fontSize: 10 }}
            width={28}
            label={{ value: "Cramps", angle: -90, position: "insideLeft", fontSize: 10 }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[0, 5]}
            tick={{ fontSize: 10 }}
            width={28}
            label={{ value: "1–5", angle: 90, position: "insideRight", fontSize: 10 }}
          />
          <Tooltip
            labelFormatter={(label) => String(label)}
            contentStyle={{
              borderRadius: "8px",
              fontSize: "12px",
            }}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="cramps"
            name="Cramps (0–10)"
            stroke="#9b8fc0"
            strokeWidth={2}
            dot={false}
            connectNulls
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="stress"
            name="Stress (1–5)"
            stroke="#d4955a"
            strokeWidth={2}
            dot={false}
            connectNulls
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="energy"
            name="Energy (1–5)"
            stroke="#7a9e8e"
            strokeWidth={2}
            dot={false}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
