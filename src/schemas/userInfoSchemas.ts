import { z } from "zod";

export const userInfoSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  user_name: z.string().nullable(),
  is_mod: z.boolean().nullable().default(false),
  plan_id: z.string(),
  plan_type: z.string(),
  phone_numbers: z
    .array(z.string())
    .max(3, "Only 3 items max")
    .nullable()
    .optional(),
  social_media: z.record(z.string(), z.any()).nullable().optional(),
  visible_emails: z.array(z.string()).max(3, "Only 3 items max").nullable(),
  glue_communication_email: z.string().email().nullable().optional(),
  visible_websites: z
    .array(z.string())
    .max(3, "Only 3 items max")
    .nullable()
    .optional(),
  upgrade_requested: z.boolean().optional(),
  upgrade_requested_plan_id: z.string().uuid().nullable().optional(),
  upgrade_requested_plan_type: z.string().nullable().optional(),
  upgrade_request_notes: z.string().nullable().optional(),
  upgrade_requested_at: z.string().nullable().optional(),
});

export type UserInfo = z.infer<typeof userInfoSchema>;
