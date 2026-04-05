"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format, parse } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { MedicalDisclaimer } from "@/components/shared/MedicalDisclaimer";
import { useSaveSymptom } from "@/hooks/useSymptoms";
import { cn } from "@/lib/utils";
import { symptomLogSchema, type SymptomLogInput } from "@/lib/validations/symptom";

const MOODS = [
  { v: "happy" as const, label: "Happy", emoji: "😊" },
  { v: "neutral" as const, label: "Neutral", emoji: "😐" },
  { v: "sad" as const, label: "Sad", emoji: "😢" },
  { v: "irritable" as const, label: "Irritable", emoji: "😤" },
  { v: "anxious" as const, label: "Anxious", emoji: "😰" },
];

const MUCUS = [
  { v: "dry" as const, label: "Dry" },
  { v: "sticky" as const, label: "Sticky" },
  { v: "creamy" as const, label: "Creamy" },
  { v: "watery" as const, label: "Watery" },
  { v: "egg-white" as const, label: "Egg-white" },
];

function StarRow({
  value,
  onChange,
  label,
  id,
}: {
  value: number | null | undefined;
  onChange: (n: number | null) => void;
  label: string;
  id: string;
}) {
  const v = value ?? 0;
  return (
    <div className="space-y-2">
      <Label id={id}>{label}</Label>
      <div className="flex gap-1" role="group" aria-labelledby={id}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            className={cn(
              "size-9 rounded-md border text-sm font-medium transition-colors",
              v >= n
                ? "border-primary bg-primary/15 text-primary"
                : "border-border bg-background text-muted-foreground",
            )}
            onClick={() => onChange(n === v ? null : n)}
            aria-label={`${label} ${n} of 5`}
            aria-pressed={v >= n}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

export function SymptomLogForm({
  initialDate = new Date(),
  onSaved,
}: {
  initialDate?: Date;
  onSaved?: () => void;
}) {
  const { mutateAsync: save, isPending } = useSaveSymptom();

  const form = useForm<SymptomLogInput>({
    resolver: zodResolver(symptomLogSchema),
    defaultValues: {
      logDate: format(initialDate, "yyyy-MM-dd"),
      cramps: 0,
      headache: false,
      bloating: false,
      nausea: false,
      backPain: false,
      breastTenderness: false,
      fatigue: false,
      acne: false,
      mood: null,
      energyLevel: null,
      anxietyLevel: null,
      libido: null,
      sleepHours: null,
      exercised: false,
      stressLevel: null,
      waterIntake: null,
      cervicalMucus: null,
      spotting: false,
      bbt: null,
      ovulationPain: false,
      notes: null,
    },
  });

  async function onSubmit(values: SymptomLogInput) {
    try {
      await save(values);
      toast.success("Symptom log saved");
      onSaved?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    }
  }

  const cramps = form.watch("cramps") ?? 0;

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-8 rounded-xl border border-border bg-card p-5 shadow-sm md:p-6"
    >
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-2">
          <Label>Date</Label>
          <Controller
            control={form.control}
            name="logDate"
            render={({ field }) => {
              const d = parse(field.value, "yyyy-MM-dd", new Date());
              const dateVal = Number.isNaN(d.getTime()) ? new Date() : d;
              return (
                <Popover>
                  <PopoverTrigger
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "w-full max-w-xs justify-start text-left font-normal sm:w-auto",
                    )}
                  >
                    <CalendarIcon className="mr-2 size-4 opacity-70" aria-hidden />
                    {format(dateVal, "PPP")}
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateVal}
                      onSelect={(next) => {
                        if (next) field.onChange(format(next, "yyyy-MM-dd"));
                      }}
                      defaultMonth={dateVal}
                      captionLayout="dropdown"
                      fromYear={1970}
                      toYear={new Date().getFullYear() + 1}
                    />
                  </PopoverContent>
                </Popover>
              );
            }}
          />
        </div>
      </div>

      <section className="space-y-4" aria-labelledby="phys-heading">
        <h3 id="phys-heading" className="font-display text-lg font-semibold">
          Physical
        </h3>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Cramps (0 = none)</Label>
            <Slider
              min={0}
              max={10}
              step={1}
              value={[cramps]}
              onValueChange={(v) => {
                const n = Array.isArray(v) ? v[0] : v;
                form.setValue("cramps", n ?? 0);
              }}
              aria-label="Cramps intensity"
            />
            <p className="text-xs text-muted-foreground">{cramps} / 10</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                ["headache", "Headache"],
                ["bloating", "Bloating"],
                ["nausea", "Nausea"],
                ["backPain", "Back pain"],
                ["breastTenderness", "Breast tenderness"],
                ["fatigue", "Fatigue"],
                ["acne", "Acne"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between gap-2 rounded-lg border border-border/60 px-3 py-2">
                <Label htmlFor={key} className="cursor-pointer text-sm font-normal">
                  {label}
                </Label>
                <Switch
                  id={key}
                  checked={form.watch(key) ?? false}
                  onCheckedChange={(c) => form.setValue(key, c)}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      <section className="space-y-4" aria-labelledby="emo-heading">
        <h3 id="emo-heading" className="font-display text-lg font-semibold">
          Emotional
        </h3>
        <div className="space-y-2">
          <Label>Mood</Label>
          <div className="flex flex-wrap gap-2">
            {MOODS.map((m) => (
              <button
                key={m.v}
                type="button"
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
                  form.watch("mood") === m.v
                    ? "border-primary bg-primary/10"
                    : "border-border bg-background",
                )}
                onClick={() =>
                  form.setValue("mood", form.watch("mood") === m.v ? null : m.v)
                }
              >
                <span aria-hidden>{m.emoji}</span>
                {m.label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <StarRow
            id="energy"
            label="Energy"
            value={form.watch("energyLevel")}
            onChange={(n) => form.setValue("energyLevel", n)}
          />
          <StarRow
            id="libido"
            label="Libido (optional)"
            value={form.watch("libido")}
            onChange={(n) => form.setValue("libido", n)}
          />
        </div>
      </section>

      <Separator />

      <section className="space-y-4" aria-labelledby="life-heading">
        <h3 id="life-heading" className="font-display text-lg font-semibold">
          Lifestyle
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="sleep">Sleep hours (0–12)</Label>
            <Input
              id="sleep"
              type="number"
              step={0.25}
              min={0}
              max={12}
              {...form.register("sleepHours", {
                setValueAs: (v) => {
                  if (v === "" || v == null) return undefined;
                  const n = Number(v);
                  return Number.isFinite(n) ? n : undefined;
                },
              })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="water">Water (litres)</Label>
            <Input
              id="water"
              type="number"
              step={0.1}
              min={0}
              {...form.register("waterIntake", {
                setValueAs: (v) => {
                  if (v === "" || v == null) return undefined;
                  const n = Number(v);
                  return Number.isFinite(n) ? n : undefined;
                },
              })}
            />
          </div>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2">
          <Label htmlFor="ex">Exercised today</Label>
          <Switch
            id="ex"
            checked={form.watch("exercised") ?? false}
            onCheckedChange={(c) => form.setValue("exercised", c)}
          />
        </div>
        <div className="space-y-2">
          <Label>Stress (1–5)</Label>
          <Slider
            min={1}
            max={5}
            step={1}
            value={[form.watch("stressLevel") ?? 3]}
            onValueChange={(v) => {
              const n = Array.isArray(v) ? v[0] : v;
              form.setValue("stressLevel", n ?? null);
            }}
            aria-label="Stress level"
          />
        </div>
      </section>

      <Separator />

      <section className="space-y-4" aria-labelledby="cyc-heading">
        <h3 id="cyc-heading" className="font-display text-lg font-semibold">
          Cycle-specific
        </h3>
        <div className="space-y-2">
          <Label>Cervical mucus</Label>
          <div className="flex flex-wrap gap-2">
            {MUCUS.map((m) => (
              <button
                key={m.v}
                type="button"
                className={cn(
                  "rounded-md border px-2.5 py-1.5 text-xs font-medium",
                  form.watch("cervicalMucus") === m.v
                    ? "border-amber-600/50 bg-amber-500/10"
                    : "border-border",
                )}
                onClick={() =>
                  form.setValue(
                    "cervicalMucus",
                    form.watch("cervicalMucus") === m.v ? null : m.v,
                  )
                }
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2">
            <Label htmlFor="spot">Spotting</Label>
            <Switch
              id="spot"
              checked={form.watch("spotting") ?? false}
              onCheckedChange={(c) => form.setValue("spotting", c)}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2">
            <Label htmlFor="ovp">Ovulation pain</Label>
            <Switch
              id="ovp"
              checked={form.watch("ovulationPain") ?? false}
              onCheckedChange={(c) => form.setValue("ovulationPain", c)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="bbt">BBT °C (optional)</Label>
          <Input
            id="bbt"
            type="number"
            step={0.01}
            min={35}
            max={40}
            {...form.register("bbt", {
              setValueAs: (v) => {
                if (v === "" || v == null) return undefined;
                const n = Number(v);
                return Number.isFinite(n) ? n : undefined;
              },
            })}
          />
        </div>
      </section>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" rows={3} {...form.register("notes")} />
      </div>

      <MedicalDisclaimer className="text-xs text-muted-foreground" />

      <Button type="submit" className="w-full sm:w-auto" disabled={isPending}>
        {isPending ? "Saving…" : "Save log"}
      </Button>
    </form>
  );
}
