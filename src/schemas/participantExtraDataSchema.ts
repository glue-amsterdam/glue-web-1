import { z } from "zod";

export const participantExtraDataSchema = z.object({
  short_description: z
    .string()
    .min(1, "Short description is required")
    .max(500, "Short description must be 500 characters or less"),
  phone_numbers: z
    .array(z.string())
    .max(3, "Only 3 items max")
    .nullable()
    .optional(),
  social_media: z.record(z.string(), z.any()).nullable().optional(),
  visible_emails: z.array(z.string()).max(3, "Only 3 items max").nullable(),
  glue_communication_email: z
    .string()
    .min(1, "Email for practical GLUE communication is required")
    .email("Please enter a valid email address"),
  visible_websites: z
    .array(z.string())
    .max(3, "Only 3 items max")
    .nullable()
    .optional(),
});

export type ParticipantExtraDataFormData = z.infer<
  typeof participantExtraDataSchema
>;
