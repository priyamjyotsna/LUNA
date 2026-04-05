"use client";

import { formatDistanceToNow } from "date-fns";
import { useMemo, useSyncExternalStore } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  EXPORT_TS_KEY,
  readLastExportIso,
  recordExportCompleted,
} from "@/lib/export-tracking";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

type ExportSectionSnap = { lastIso: string | null; stale: boolean };

function touchExportTimestamp() {
  recordExportCompleted();
  window.dispatchEvent(new CustomEvent("luna-export"));
}

function subscribeExportSection(onStoreChange: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === EXPORT_TS_KEY || e.key === null) onStoreChange();
  };
  const onCustom = () => onStoreChange();
  window.addEventListener("storage", onStorage);
  window.addEventListener("luna-export", onCustom);
  const hourly = window.setInterval(onStoreChange, 60 * 60 * 1000);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("luna-export", onCustom);
    window.clearInterval(hourly);
  };
}

function getExportSectionSnapshot(): string {
  const lastIso = readLastExportIso();
  if (!lastIso) {
    return JSON.stringify({ lastIso: null, stale: false } satisfies ExportSectionSnap);
  }
  const t = Date.parse(lastIso);
  if (Number.isNaN(t)) {
    return JSON.stringify({ lastIso, stale: false } satisfies ExportSectionSnap);
  }
  const stale = Date.now() - t > THIRTY_DAYS_MS;
  return JSON.stringify({ lastIso, stale } satisfies ExportSectionSnap);
}

function getServerExportSectionSnapshot(): string {
  return JSON.stringify({ lastIso: null, stale: false } satisfies ExportSectionSnap);
}

function useExportSectionState(): ExportSectionSnap {
  const raw = useSyncExternalStore(
    subscribeExportSection,
    getExportSectionSnapshot,
    getServerExportSectionSnapshot,
  );
  return useMemo(() => JSON.parse(raw) as ExportSectionSnap, [raw]);
}

function TrackedExportLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className={cn(buttonVariants({ variant: "outline" }), "inline-flex no-underline")}
      onClick={touchExportTimestamp}
    >
      {children}
    </a>
  );
}

/** Reminders based on this browser&apos;s last export click + download buttons that update the timestamp. */
export function ExportSection() {
  const { lastIso, stale } = useExportSectionState();
  const never = !lastIso;

  return (
    <div className="flex flex-col gap-4">
      {never ? (
        <Alert className="border-sky-500/30 bg-sky-500/[0.06]">
          <AlertTitle className="text-sm">Backup your data</AlertTitle>
          <AlertDescription className="text-xs">
            No export has been recorded in this browser yet. JSON or PDF is a useful snapshot for
            your records.
          </AlertDescription>
        </Alert>
      ) : stale ? (
        <Alert className="border-amber-500/35 bg-amber-500/[0.06]">
          <AlertTitle className="text-sm">Time for a fresh export?</AlertTitle>
          <AlertDescription className="text-xs">
            Last download recorded here{" "}
            {formatDistanceToNow(Date.parse(lastIso!), { addSuffix: true })}.
          </AlertDescription>
        </Alert>
      ) : (
        <p className="text-xs text-muted-foreground">
          Last export from this browser:{" "}
          {formatDistanceToNow(Date.parse(lastIso!), { addSuffix: true })}.
        </p>
      )}
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <TrackedExportLink href="/api/export/json">JSON</TrackedExportLink>
        <TrackedExportLink href="/api/export/ical">iCal (.ics)</TrackedExportLink>
        <TrackedExportLink href="/api/export/pdf">PDF summary</TrackedExportLink>
      </div>
    </div>
  );
}
