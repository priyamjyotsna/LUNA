export const EXPORT_TS_KEY = "luna-last-export-at";

export function recordExportCompleted(): void {
  try {
    localStorage.setItem(EXPORT_TS_KEY, new Date().toISOString());
  } catch {
    /* private mode / quota */
  }
}

export function readLastExportIso(): string | null {
  try {
    return localStorage.getItem(EXPORT_TS_KEY);
  } catch {
    return null;
  }
}
