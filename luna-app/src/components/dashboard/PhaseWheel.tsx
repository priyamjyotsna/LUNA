"use client";

import { differenceInDays } from "date-fns";
import { useMemo } from "react";
import type { CyclePrediction, CycleStats } from "@/lib/cycle-engine";
import { cn } from "@/lib/utils";

const CX = 100;
const CY = 100;
const R_OUT = 84;
const R_IN = 54;

function polar(cx: number, cy: number, r: number, angleRad: number) {
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

function donutSlicePath(a0: number, a1: number) {
  const largeArc = a1 - a0 > Math.PI ? 1 : 0;
  const p0o = polar(CX, CY, R_OUT, a0);
  const p1o = polar(CX, CY, R_OUT, a1);
  const p1i = polar(CX, CY, R_IN, a1);
  const p0i = polar(CX, CY, R_IN, a0);
  return [
    `M ${p0o.x} ${p0o.y}`,
    `A ${R_OUT} ${R_OUT} 0 ${largeArc} 1 ${p1o.x} ${p1o.y}`,
    `L ${p1i.x} ${p1i.y}`,
    `A ${R_IN} ${R_IN} 0 ${largeArc} 0 ${p0i.x} ${p0i.y}`,
    "Z",
  ].join(" ");
}

function phaseToAngles(startDay: number, endDay: number, cycleLen: number) {
  const aStart = -Math.PI / 2 + ((startDay - 1) / cycleLen) * 2 * Math.PI;
  const aEnd = -Math.PI / 2 + (endDay / cycleLen) * 2 * Math.PI;
  return { aStart, aEnd };
}

function dayCenterAngle(day: number, cycleLen: number) {
  return -Math.PI / 2 + ((day - 0.5) / cycleLen) * 2 * Math.PI;
}

export function PhaseWheel({
  prediction,
  stats,
  className,
}: {
  prediction: CyclePrediction;
  stats: CycleStats;
  className?: string;
}) {
  const cycleLen = useMemo(() => {
    const fromStats = stats.average;
    const fromPhases = Math.max(...prediction.phases.map((p) => p.endDay), 1);
    return Math.max(fromStats, fromPhases, 1);
  }, [prediction.phases, stats.average]);

  const ovDay =
    differenceInDays(prediction.ovulationDate, prediction.lastPeriod) + 1;

  const needleAngle = dayCenterAngle(prediction.cycleDay, cycleLen);
  const ovAngle = dayCenterAngle(ovDay, cycleLen);

  /** Degrees: 0 = upward (day at top), clockwise positive — matches spec “needle to current day”. */
  const needleDeg = ((needleAngle + Math.PI / 2) * 180) / Math.PI;

  const ovDot = polar(CX, CY, R_OUT + 2, ovAngle);
  const m = polar(CX, CY, R_OUT + 1, needleAngle);

  return (
    <div
      className={cn("rounded-xl border border-border bg-card p-4 shadow-sm", className)}
      aria-label="Cycle phase wheel"
    >
      <h3 className="text-center font-display text-lg font-semibold">Cycle wheel</h3>
      <p className="mt-1 text-center text-xs text-muted-foreground">
        Today on your current cycle
      </p>
      <svg
        viewBox="0 0 200 200"
        className="mx-auto mt-4 h-auto w-full max-w-[min(100%,280px)] overflow-visible"
        role="img"
        aria-hidden={false}
        aria-label={`Cycle day ${prediction.cycleDay} of about ${cycleLen}`}
      >
        <title>{`Cycle day ${prediction.cycleDay} of ${cycleLen}`}</title>
        {prediction.phases.map((ph) => {
          const { aStart, aEnd } = phaseToAngles(ph.startDay, ph.endDay, cycleLen);
          return (
            <path
              key={ph.phase}
              d={donutSlicePath(aStart, aEnd)}
              fill={ph.color}
              fillOpacity={0.88}
              stroke="var(--card)"
              strokeWidth={1.5}
              className="dark:stroke-border"
            />
          );
        })}
        <circle
          cx={m.x}
          cy={m.y}
          r={5}
          className="fill-background stroke-foreground stroke-2"
          strokeWidth={2.5}
        />
        <circle
          cx={ovDot.x}
          cy={ovDot.y}
          r={5}
          fill="var(--amber)"
          stroke="var(--card)"
          strokeWidth={1.5}
          aria-label="Approximate ovulation"
        />
        <g
          style={{
            transformOrigin: `${CX}px ${CY}px`,
            transition: "transform 0.85s cubic-bezier(0.33, 1, 0.68, 1)",
            transform: `rotate(${needleDeg}deg)`,
          }}
        >
          <line
            x1={CX}
            y1={CY}
            x2={CX}
            y2={CY - (R_OUT - 6)}
            stroke="currentColor"
            strokeWidth={3}
            strokeLinecap="round"
            className="text-foreground"
          />
        </g>
        <text
          x={CX}
          y={CY + 6}
          textAnchor="middle"
          className="fill-foreground font-display text-[22px] font-semibold"
        >
          {prediction.cycleDay}
        </text>
        <text
          x={CX}
          y={CY + 26}
          textAnchor="middle"
          className="fill-muted-foreground text-[11px]"
        >
          day
        </text>
      </svg>
      <p className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <span className="size-2 rounded-full bg-[var(--amber)]" aria-hidden />
          Ovulation (~day {ovDay})
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="size-2 rounded-full ring-2 ring-foreground" aria-hidden />
          Today
        </span>
      </p>
    </div>
  );
}
