"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { LogPeriodDialogContent } from "./LogPeriodDialogShell";

type PeriodLogContextValue = {
  open: () => void;
  close: () => void;
  isOpen: boolean;
};

const PeriodLogContext = createContext<PeriodLogContextValue | null>(null);

export function PeriodLogProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  const value = useMemo(
    () => ({
      open: () => setOpen(true),
      close: () => setOpen(false),
      isOpen: open,
    }),
    [open],
  );

  return (
    <PeriodLogContext.Provider value={value}>
      {children}
      <LogPeriodDialogContent open={open} onOpenChange={setOpen} />
    </PeriodLogContext.Provider>
  );
}

export function usePeriodLogLauncher() {
  const ctx = useContext(PeriodLogContext);
  if (!ctx) {
    throw new Error("usePeriodLogLauncher must be used within PeriodLogProvider");
  }
  return ctx;
}
