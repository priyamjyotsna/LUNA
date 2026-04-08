import { format, parseISO } from "date-fns";
import type { PeriodHistoryRow } from "@/lib/insights-types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function HistoryTable({
  rows,
  className,
}: {
  rows: PeriodHistoryRow[];
  className?: string;
}) {
  if (rows.length === 0) {
    return (
      <p className={cn("text-sm text-muted-foreground", className)}>
        No period history yet.
      </p>
    );
  }

  return (
    <div className={cn("overflow-x-auto rounded-xl border border-border", className)}>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-3 py-2 font-medium">Start</th>
            <th className="px-3 py-2 font-medium">Length</th>
            <th className="px-3 py-2 font-medium">Notes / flags</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-border/60 last:border-0">
              <td className="whitespace-nowrap px-3 py-2">
                {format(parseISO(r.periodStart), "MMM d, yyyy")}
              </td>
              <td className="px-3 py-2 tabular-nums">
                {r.cycleLength != null ? `${r.cycleLength} d` : "—"}
              </td>
              <td className="max-w-[14rem] px-3 py-2">
                <div className="flex flex-col gap-1">
                  {r.isAnomaly ? (
                    <Badge variant="outline" className="w-fit text-xs">
                      Flagged gap
                    </Badge>
                  ) : null}
                  {r.notes ? (
                    <span className="text-muted-foreground">{r.notes}</span>
                  ) : !r.isAnomaly ? (
                    <span className="text-muted-foreground">—</span>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
