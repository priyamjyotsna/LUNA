import { CycleCalendar } from "@/components/calendar/CycleCalendar";

export default function CalendarPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold">Calendar</h1>
        <p className="mt-1 text-muted-foreground">
          Month overview chips, a colour key, phase-tinted days, and a cycle-day ring in the
          selected-day panel.
        </p>
      </header>
      <CycleCalendar />
    </div>
  );
}
