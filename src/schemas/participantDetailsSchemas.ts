import { z } from "zod";

export type ParticipantDetails = z.infer<typeof participantDetailsSchema>;

export const reactivationNotesSchema = z.object({
  plan_id: z.string().optional().nullable(),
  plan_type: z.string().optional().nullable(),
  plan_label: z.string().optional().nullable(),
  formatted_address: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  no_address: z.boolean().optional().default(true),
  notes: z.string().optional().nullable(),
});

export type ReactivationNotes = z.infer<typeof reactivationNotesSchema>;

export const participantDetailsSchema = z.object({
  user_id: z.string().uuid(),
  short_description: z
    .string()
    .min(1, "Short description is required")
    .max(200, "Short description must be less than 200 characters"),
  description: z
    .string()
    .max(5000, "Description must be less than 5000 characters")
    .nullable(),
  slug: z.string().min(1, "Slug is required"),
  special_program: z.boolean(),
  status: z.enum(["pending", "accepted", "declined"]).default("pending"),
  is_active: z.boolean().default(true),
  reactivation_requested: z.boolean().default(false),
  reactivation_notes: reactivationNotesSchema.optional().nullable(),
  reactivation_status: z
    .enum(["pending", "approved", "declined"])
    .optional()
    .nullable(),
});
