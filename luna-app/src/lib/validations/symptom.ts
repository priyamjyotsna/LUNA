import { z } from "zod";

export const symptomLogSchema = z.object({
  logDate: z.string().min(1).refine((d) => !Number.isNaN(Date.parse(d)), "Invalid date"),
  cramps: z.number().int().min(0).max(10).optional(),
  headache: z.boolean().optional(),
  bloating: z.boolean().optional(),
  nausea: z.boolean().optional(),
  backPain: z.boolean().optional(),
  breastTenderness: z.boolean().optional(),
  fatigue: z.boolean().optional(),
  acne: z.boolean().optional(),
  mood: z
    .enum(["happy", "neutral", "sad", "irritable", "anxious"])
    .nullable()
    .optional(),
  energyLevel: z.number().int().min(1).max(5).nullable().optional(),
  anxietyLevel: z.number().int().min(1).max(5).nullable().optional(),
  libido: z.number().int().min(1).max(5).nullable().optional(),
  sleepHours: z.number().min(0).max(12).nullable().optional(),
  exercised: z.boolean().optional(),
  stressLevel: z.number().int().min(1).max(5).nullable().optional(),
  waterIntake: z.number().min(0).max(20).nullable().optional(),
  cervicalMucus: z
    .enum(["dry", "sticky", "creamy", "watery", "egg-white"])
    .nullable()
    .optional(),
  spotting: z.boolean().optional(),
  bbt: z.number().min(35).max(40).nullable().optional(),
  ovulationPain: z.boolean().optional(),
  notes: z.string().max(2000).nullable().optional(),
});

export type SymptomLogInput = z.infer<typeof symptomLogSchema>;
