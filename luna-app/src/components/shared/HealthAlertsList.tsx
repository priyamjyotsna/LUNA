import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { HealthAlert } from "@/lib/cycle-engine";
import { cn } from "@/lib/utils";

export function HealthAlertsList({
  alerts,
  className,
  emptyMessage = "No alerts right now. If something stands out from your logs, guidance will appear here — for awareness only, not a diagnosis.",
}: {
  alerts: HealthAlert[];
  className?: string;
  emptyMessage?: string;
}) {
  return (
    <section className={cn("space-y-3", className)} aria-labelledby="health-alerts-heading">
      <h2 id="health-alerts-heading" className="font-display text-xl font-semibold">
        Health alerts
      </h2>
      {alerts.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-muted/25 px-4 py-6 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </p>
      ) : (
        <div className="space-y-2">
          {alerts.map((a, i) => (
            <Alert
              key={`${a.severity}-${i}`}
              variant={a.severity === "critical" ? "destructive" : "default"}
              className={
                a.severity === "info"
                  ? "border-sky-400/50 bg-sky-500/[0.08] text-foreground dark:border-sky-500/35 dark:bg-sky-950/35"
                  : a.severity === "warning"
                    ? "border-amber-500/45 bg-amber-500/[0.07] text-foreground dark:bg-amber-950/30"
                    : undefined
              }
            >
              <AlertTitle className="text-sm capitalize">{a.severity}</AlertTitle>
              <AlertDescription className="text-sm">
                <span className="block font-medium text-foreground">{a.message}</span>
                <span className="mt-1 block text-muted-foreground">{a.recommendation}</span>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}
    </section>
  );
}
