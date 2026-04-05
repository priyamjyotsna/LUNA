"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO } from "date-fns";
import { Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { usePeriodLogs } from "@/hooks/usePeriodLogs";
import { flowLevelDisplayLabel } from "@/lib/period-flow";
import type { PeriodLogDTO } from "@/types/period";

const FLOW_NONE = "__none__" as const;

const editSchema = z.object({
  flowIntensity: z
    .enum(["spotting", "light", "moderate", "heavy"])
    .nullable(),
  notes: z.string().max(500).optional(),
});

type EditValues = z.infer<typeof editSchema>;

const PERIOD_HISTORY_COLLAPSED = 10;

export function PeriodHistory() {
  const router = useRouter();
  const {
    data,
    isLoading,
    isError,
    error,
    updatePeriod,
    deletePeriod,
    isUpdating,
  } = usePeriodLogs();

  const [editing, setEditing] = useState<PeriodLogDTO | null>(null);
  const [showAll, setShowAll] = useState(false);
  const deleteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingDeleteIdRef = useRef<string | null>(null);
  const deleteToastRef = useRef<string | number | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (deleteTimerRef.current) {
        clearTimeout(deleteTimerRef.current);
      }
    };
  }, []);

  const logs = data?.periodLogs ?? [];
  const sorted = [...logs].sort(
    (a, b) => parseISO(b.periodStart).getTime() - parseISO(a.periodStart).getTime(),
  );
  const hasMore = sorted.length > PERIOD_HISTORY_COLLAPSED;
  const visible = showAll || !hasMore ? sorted : sorted.slice(0, PERIOD_HISTORY_COLLAPSED);

  function scheduleDelete(log: PeriodLogDTO) {
    if (deleteTimerRef.current) {
      clearTimeout(deleteTimerRef.current);
      deleteTimerRef.current = null;
    }
    if (deleteToastRef.current != null) {
      toast.dismiss(deleteToastRef.current);
    }
    pendingDeleteIdRef.current = log.id;
    const label = format(parseISO(log.periodStart), "MMM d, yyyy");
    const tid = toast.message("Removing period entry…", {
      description: `Starting ${label}. Undo within 5 seconds.`,
      duration: 6000,
      action: {
        label: "Undo",
        onClick: () => {
          if (deleteTimerRef.current) {
            clearTimeout(deleteTimerRef.current);
            deleteTimerRef.current = null;
          }
          pendingDeleteIdRef.current = null;
          toast.dismiss(tid);
          toast.message("Deletion cancelled");
        },
      },
    });
    deleteToastRef.current = tid;
    deleteTimerRef.current = setTimeout(() => {
      deleteTimerRef.current = null;
      deleteToastRef.current = undefined;
      const id = pendingDeleteIdRef.current;
      pendingDeleteIdRef.current = null;
      if (!id) return;
      void (async () => {
        try {
          await deletePeriod(id);
          toast.success("Period removed");
          router.refresh();
        } catch (e) {
          toast.error(e instanceof Error ? e.message : "Delete failed");
        }
      })();
    }, 5000);
  }

  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-sm" aria-labelledby="period-history-heading">
      <h2 id="period-history-heading" className="font-display text-xl font-semibold">
        Period history
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Newest first. Dates and cycle lengths update automatically when you add or remove an entry.
      </p>

      {isLoading ? (
        <ul className="mt-6 divide-y divide-border" aria-busy="true" aria-label="Loading period history">
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="flex flex-col gap-3 py-4 first:pt-0 sm:flex-row sm:justify-between">
              <div className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-20" />
              </div>
            </li>
          ))}
        </ul>
      ) : isError ? (
        <p className="mt-6 text-sm text-destructive" role="alert">
          {error?.message ?? "Could not load history."}
        </p>
      ) : sorted.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">No periods logged yet.</p>
      ) : (
        <ul className="mt-6 divide-y divide-border">
          {visible.map((log) => (
            <li
              key={log.id}
              className="flex flex-col gap-3 py-4 first:pt-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-foreground">
                  {format(parseISO(log.periodStart), "EEEE, MMM d, yyyy")}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {log.cycleLength != null
                    ? `Cycle length: ${log.cycleLength} days${log.isAnomaly ? " (flagged gap)" : ""}`
                    : "First logged period"}
                  {log.flowIntensity ? (
                    <>
                      {" · "}
                      Flow: {flowLevelDisplayLabel(log.flowIntensity)}
                    </>
                  ) : null}
                </p>
                {log.notes ? (
                  <p className="mt-1 max-w-prose text-sm text-muted-foreground">{log.notes}</p>
                ) : null}
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={() => setEditing(log)}
                  aria-label={`Edit notes and flow for ${format(parseISO(log.periodStart), "MMM d, yyyy")}`}
                >
                  <Pencil className="size-3.5" aria-hidden />
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1 text-destructive hover:bg-destructive/10"
                  onClick={() => scheduleDelete(log)}
                  aria-label={`Delete period ${format(parseISO(log.periodStart), "MMM d, yyyy")}`}
                >
                  <Trash2 className="size-3.5" aria-hidden />
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {!isLoading && !isError && hasMore ? (
        <div className="mt-4 flex justify-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => setShowAll((v) => !v)}
          >
            {showAll
              ? "Show fewer"
              : `Show all ${sorted.length} entries`}
          </Button>
        </div>
      ) : null}

      {editing ? (
        <EditPeriodDialog
          key={editing.id}
          log={editing}
          open={!!editing}
          onOpenChange={(o) => !o && setEditing(null)}
          onSave={async (values) => {
            await updatePeriod({
              id: editing.id,
              flowIntensity: values.flowIntensity ?? null,
              notes: values.notes?.trim() || null,
            });
            toast.success("Period updated");
            setEditing(null);
            router.refresh();
          }}
          isSaving={isUpdating}
        />
      ) : null}

    </section>
  );
}

function EditPeriodDialog({
  log,
  open,
  onOpenChange,
  onSave,
  isSaving,
}: {
  log: PeriodLogDTO;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (v: EditValues) => Promise<void>;
  isSaving: boolean;
}) {
  const initialFlow = log.flowIntensity;

  const form = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    values: {
      flowIntensity: initialFlow,
      notes: log.notes ?? "",
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Edit period · {format(parseISO(log.periodStart), "MMM d, yyyy")}
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(async (v) => {
            await onSave(v);
          })}
          className="space-y-4"
        >
          <p className="text-sm text-muted-foreground">
            To change the start date, delete this entry and add a new one.
          </p>
          <div className="space-y-2">
            <Label htmlFor="edit-flow">Flow intensity (optional)</Label>
            <Controller
              control={form.control}
              name="flowIntensity"
              render={({ field }) => (
                <Select
                  value={field.value ?? FLOW_NONE}
                  onValueChange={(v) =>
                    field.onChange(v === FLOW_NONE ? null : v)
                  }
                >
                  <SelectTrigger id="edit-flow" aria-label="Flow intensity">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={FLOW_NONE}>Not recorded</SelectItem>
                    <SelectItem value="spotting">Spotting</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="heavy">Heavy</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-notes">Notes</Label>
            <Textarea id="edit-notes" rows={3} maxLength={500} {...form.register("notes")} />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
