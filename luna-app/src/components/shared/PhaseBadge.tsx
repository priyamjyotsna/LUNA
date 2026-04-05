import { cn } from "@/lib/utils";
import type { PhaseType } from "@/lib/cycle-engine";

const LABELS: Record<PhaseType | "predicted", string> = {
  menstrual: "Menstrual",
  follicular: "Follicular",
  ovulatory: "Fertile / Ovulatory",
  luteal: "Luteal",
  predicted: "Predicted",
};

export function PhaseBadge({
  phase,
  className,
}: {
  phase: PhaseType | "predicted";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        phase === "menstrual" && "bg-[var(--phase-menstrual)]/20 text-[var(--phase-menstrual)]",
        phase === "follicular" &&
          "bg-[var(--phase-follicular)]/20 text-[var(--phase-follicular)]",
        phase === "ovulatory" &&
          "bg-[var(--phase-ovulatory)]/20 text-[var(--phase-ovulatory)]",
        phase === "luteal" && "bg-[var(--phase-luteal)]/20 text-[var(--phase-luteal)]",
        phase === "predicted" &&
          "bg-[var(--phase-predicted)]/40 text-[var(--ink-soft)]",
        className,
      )}
      aria-label={`Cycle phase: ${LABELS[phase]}`}
    >
      {LABELS[phase]}
    </span>
  );
}
