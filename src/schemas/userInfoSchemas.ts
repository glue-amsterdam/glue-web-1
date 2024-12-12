import { z } from "zod";

export const userInfoSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  user_name: z.string().nullable(),
  is_mod: z.boolean().nullable().default(false),
  plan_id: z.string(),
  plan_type: z.string(),
  phone_numbers: z.array(z.string()).nullable(),
  social_media: z.record(z.string(), z.any()).nullable(),
  visible_emails: z.array(z.string().email()).nullable(),
  visible_websites: z.array(z.string().url()).nullable(),
  created_at: z
    .string()
    .datetime()
    .nullable()
    .default(() => new Date().toISOString()),
  updated_at: z
    .string()
    .datetime()
    .nullable()
    .default(() => new Date().toISOString()),
});

export type UserInfo = z.infer<typeof userInfoSchema>;
