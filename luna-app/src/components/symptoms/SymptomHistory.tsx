"use client";

import { format, parseISO } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import type { SymptomLogDTO } from "@/types/symptom";

export function SymptomHistory({ logs }: { logs: SymptomLogDTO[] }) {
  if (logs.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No symptom logs in this range yet.
      </p>
    );
  }

  return (
    <ScrollArea className="h-[min(420px,50vh)] rounded-xl border border-border p-3 md:p-4">
      <ul className="space-y-3 pr-3">
        {logs.map((log) => (
          <li
            key={log.id}
            className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-medium">
                {format(parseISO(log.logDate), "EEE, MMM d, yyyy")}
              </span>
              {log.phase ? (
                <Badge variant="outline" className="text-xs capitalize">
                  {log.phase}
                </Badge>
              ) : null}
            </div>
            {log.cycleDay != null ? (
              <p className="mt-1 text-xs text-muted-foreground">Cycle day {log.cycleDay}</p>
            ) : null}
            <p className="mt-1 text-xs text-muted-foreground">
              {[
                log.cramps != null && log.cramps > 0 ? `cramps ${log.cramps}/10` : null,
                log.bbt != null ? `BBT ${log.bbt}°C` : null,
                log.mood,
                log.cervicalMucus ? `mucus: ${log.cervicalMucus}` : null,
                log.exercised ? "exercise" : null,
              ]
                .filter(Boolean)
                .join(" · ") || "Tap edit via calendar or re-save from form"}
            </p>
          </li>
        ))}
      </ul>
    </ScrollArea>
  );
}
