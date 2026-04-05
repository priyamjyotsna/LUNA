"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button, buttonVariants } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { periodCreateSchema } from "@/lib/validations/period";
import { useRouter } from "next/navigation";
import { usePeriodLogs } from "@/hooks/usePeriodLogs";

const FLOW_NONE = "__none__" as const;

const logPeriodFormSchema = z.object({
  periodStart: z.date({ message: "Choose a date" }),
  flowIntensity: z.enum(["spotting", "light", "moderate", "heavy"]).optional(),
  notes: z.string().max(500).optional(),
});

type LogPeriodFormValues = z.infer<typeof logPeriodFormSchema>;

export function LogPeriodForm({
  onSuccess,
  className,
}: {
  onSuccess?: () => void;
  className?: string;
}) {
  const { createPeriod, isCreating } = usePeriodLogs();
  const router = useRouter();

  const form = useForm<LogPeriodFormValues>({
    resolver: zodResolver(logPeriodFormSchema),
    defaultValues: {
      periodStart: new Date(),
      notes: "",
    },
  });

  async function onSubmit(values: LogPeriodFormValues) {
    const payload = periodCreateSchema.parse({
      periodStart: values.periodStart.toISOString(),
      flowIntensity: values.flowIntensity ?? null,
      notes: values.notes?.trim() || undefined,
    });

    try {
      await createPeriod(payload);
      toast.success(`Period logged for ${format(values.periodStart, "MMM d, yyyy")} ✓`);
      form.reset({
        periodStart: new Date(),
        notes: "",
      });
      router.refresh();
      onSuccess?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className={cn("space-y-4", className)}
    >
      <div className="space-y-2">
        <Label>Start date</Label>
        <Controller
          control={form.control}
          name="periodStart"
          render={({ field }) => (
            <Popover>
              <PopoverTrigger
                className={cn(
                  buttonVariants({ variant: "outline", size: "default" }),
                  "w-full justify-start text-left font-normal",
                  !field.value && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 size-4 opacity-70" aria-hidden />
                {field.value ? format(field.value, "PPP") : "Pick a date"}
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  defaultMonth={field.value}
                  captionLayout="dropdown"
                  fromYear={1970}
                  toYear={new Date().getFullYear() + 1}
                />
              </PopoverContent>
            </Popover>
          )}
        />
        {form.formState.errors.periodStart?.message ? (
          <p className="text-sm text-destructive" role="alert">
            {String(form.formState.errors.periodStart.message)}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="flow">Flow intensity (optional)</Label>
        <p className="text-xs text-muted-foreground">
          Only shown in your history if you choose a level.
        </p>
        <Controller
          control={form.control}
          name="flowIntensity"
          render={({ field }) => (
            <Select
              value={field.value ?? FLOW_NONE}
              onValueChange={(v) =>
                field.onChange(v === FLOW_NONE ? undefined : v)
              }
            >
              <SelectTrigger id="flow" className="w-full" aria-label="Flow intensity">
                <SelectValue placeholder="Not recorded" />
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
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          placeholder="How are you feeling?"
          rows={3}
          maxLength={500}
          {...form.register("notes")}
        />
        {form.formState.errors.notes?.message ? (
          <p className="text-sm text-destructive" role="alert">
            {form.formState.errors.notes.message}
          </p>
        ) : null}
      </div>

      <Button type="submit" className="w-full" disabled={isCreating}>
        {isCreating ? "Saving…" : "Save period"}
      </Button>
    </form>
  );
}
