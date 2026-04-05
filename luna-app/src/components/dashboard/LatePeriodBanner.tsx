"use client";

import { differenceInDays, format, startOfDay } from "date-fns";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { CyclePrediction } from "@/lib/cycle-engine";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MedicalDisclaimer } from "@/components/shared/MedicalDisclaimer";
import { buttonVariants } from "@/components/ui/button";
import { usePeriodLogLauncher } from "./period-log-context";
import { cn } from "@/lib/utils";

function dismissKey(lastPeriodIso: string) {
  return `luna-late-dismiss:${lastPeriodIso}`;
}

export function LatePeriodBanner({
  prediction,
  className,
}: {
  prediction: CyclePrediction;
  className?: string;
}) {
  const { open: openLogPeriod } = usePeriodLogLauncher();
  const today = startOfDay(new Date());
  const lateEnd = startOfDay(prediction.nextPeriodLate);
  const [irregularOpen, setIrregularOpen] = useState(false);
  const [pregnantOpen, setPregnantOpen] = useState(false);

  const isLate = today > lateEnd;
  const lateDays = isLate ? differenceInDays(today, lateEnd) : 0;

  const lastIso = prediction.lastPeriod.toISOString();
  const [dismissed, setDismissed] = useState(false);

  const alreadyDismissed = useMemo(() => {
    if (typeof window === "undefined") return false;
    try {
      return sessionStorage.getItem(dismissKey(lastIso)) === "1";
    } catch {
      return false;
    }
  }, [lastIso]);

  if (!isLate || dismissed || alreadyDismissed) return null;

  function dismissForCycle() {
    try {
      sessionStorage.setItem(dismissKey(lastIso), "1");
    } catch {
      /* ignore */
    }
    setDismissed(true);
  }

  return (
    <>
      <div
        className={cn(
          "rounded-xl border-2 border-destructive/50 bg-destructive/10 p-4 shadow-sm md:p-5",
          className,
        )}
        role="alert"
      >
        <p className="font-display text-lg font-semibold text-destructive md:text-xl">
          Your period is late by {lateDays} day{lateDays === 1 ? "" : "s"}.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Latest expected start in your current range was around{" "}
          <span className="font-medium text-foreground">{format(lateEnd, "MMM d, yyyy")}</span>.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" onClick={() => openLogPeriod()}>
            Log period now
          </Button>
          <Button type="button" variant="outline" onClick={() => setIrregularOpen(true)}>
            Mark as irregular
          </Button>
          <Button type="button" variant="outline" onClick={() => setPregnantOpen(true)}>
            I might be pregnant
          </Button>
        </div>
        <MedicalDisclaimer className="mt-3 text-xs text-muted-foreground" />
      </div>

      <Dialog open={irregularOpen} onOpenChange={setIrregularOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Irregular cycle</DialogTitle>
            <DialogDescription>
              Variations happen. Continue logging starts and ends when you can. If delays are new or
              worrying, speak with a healthcare provider.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setIrregularOpen(false)}>
              Close
            </Button>
            <Button
              type="button"
              onClick={() => {
                setIrregularOpen(false);
                dismissForCycle();
              }}
            >
              Hide banner for this cycle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={pregnantOpen} onOpenChange={setPregnantOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>If you might be pregnant</AlertDialogTitle>
            <AlertDialogDescription>
              Home apps and calendars are not medical tests. A pharmacist or clinician can guide
              you on testing and next steps.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <MedicalDisclaimer className="text-xs text-muted-foreground" />
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
            <Link
              href="/symptoms"
              className={cn(buttonVariants({ variant: "secondary" }), "no-underline")}
            >
              Log how you feel
            </Link>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
