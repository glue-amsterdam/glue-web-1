import { z } from "zod";

export const userInfoSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  user_name: z.string().nullable(),
  is_mod: z.boolean().nullable().default(false),
  plan_id: z.string(),
  plan_type: z.string(),
  phone_numbers: z.array(z.string()).max(3, "Only 3 items max").nullable(),
  social_media: z.record(z.string(), z.any()).nullable(),
  visible_emails: z.array(z.string()).max(3, "Only 3 items max").nullable(),
  visible_websites: z.array(z.string()).max(3, "Only 3 items max").nullable(),
});

export type UserInfo = z.infer<typeof userInfoSchema>;
