import { z } from "zod";

export const periodCreateSchema = z.object({
  periodStart: z
    .string()
    .min(1)
    .refine((val) => !Number.isNaN(Date.parse(val)), "Invalid date"),
  /** Omit or null when the user does not want to record flow. */
  flowIntensity: z
    .enum(["spotting", "light", "moderate", "heavy"])
    .nullable()
    .optional(),
  notes: z.string().max(500).optional(),
});

export const periodUpdateSchema = z.object({
  flowIntensity: z
    .enum(["spotting", "light", "moderate", "heavy"])
    .nullable()
    .optional(),
  notes: z.string().max(500).nullable().optional(),
});

export type PeriodCreateInput = z.infer<typeof periodCreateSchema>;
export type PeriodUpdateInput = z.infer<typeof periodUpdateSchema>;
