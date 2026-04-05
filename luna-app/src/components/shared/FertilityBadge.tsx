import { cn } from "@/lib/utils";
import type { FertilityStatus } from "@/lib/cycle-engine";
import type { UserMode } from "@/types";

function messageFor(
  status: FertilityStatus,
  mode: UserMode,
): { text: string; className: string } {
  if (mode === "ttc") {
    if (status === "peak" || status === "fertile") {
      return {
        text: "BEST DAYS TO TRY 🌸",
        className: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200",
      };
    }
    if (status === "approaching") {
      return {
        text: "Fertile window approaching",
        className: "bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200",
      };
    }
    if (status === "period") {
      return { text: "Period", className: "bg-muted text-muted-foreground" };
    }
    return {
      text: "Lower Fertility",
      className: "bg-muted text-muted-foreground",
    };
  }

  // avoid pregnancy
  if (status === "peak") {
    return {
      text: "⚠ PEAK RISK — USE PROTECTION",
      className: "bg-red-100 text-red-900 dark:bg-red-950/60 dark:text-red-200",
    };
  }
  if (status === "fertile") {
    return {
      text: "⚠ HIGH RISK",
      className: "bg-orange-100 text-orange-900 dark:bg-orange-950/50 dark:text-orange-200",
    };
  }
  if (status === "approaching") {
    return {
      text: "APPROACHING FERTILE WINDOW",
      className: "bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200",
    };
  }
  if (status === "period") {
    return { text: "Period", className: "bg-muted text-muted-foreground" };
  }
  return {
    text: "✓ LOWER RISK",
    className: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200",
  };
}

export function FertilityBadge({
  status,
  mode,
  className,
}: {
  status: FertilityStatus;
  mode: UserMode;
  className?: string;
}) {
  const { text, className: tone } = messageFor(status, mode);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold tracking-wide",
        tone,
        className,
      )}
      aria-label={`Fertility indication: ${text}`}
    >
      {text}
    </span>
  );
}
