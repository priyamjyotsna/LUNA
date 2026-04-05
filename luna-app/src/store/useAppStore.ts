import { create } from "zustand";

/** Client UI state; expand in later phases. */
export const useAppStore = create<{
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}>((set) => ({
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
