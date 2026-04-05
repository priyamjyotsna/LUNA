import { z } from "zod";

const isoDateOnly = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .nullable()
  .optional();

export const userPatchSchema = z
  .object({
    name: z.string().max(120).nullable().optional(),
    dateOfBirth: isoDateOnly,
    averageCycleLen: z.number().int().min(21).max(45).optional(),
    lutealPhaseLen: z.number().int().min(10).max(20).optional(),
    periodDuration: z.number().int().min(2).max(12).optional(),
    mode: z.enum(["ttc", "avoid"]).optional(),
    notificationsOn: z.boolean().optional(),
    theme: z.enum(["light", "dark", "system"]).optional(),
  })
  .strict();

export type UserPatchInput = z.infer<typeof userPatchSchema>;

export const pushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
  expirationTime: z.number().nullable().optional(),
});

export type PushSubscriptionInput = z.infer<typeof pushSubscriptionSchema>;

export const deleteDataConfirmSchema = z.object({
  confirm: z.literal("DELETE_MY_DATA"),
});
