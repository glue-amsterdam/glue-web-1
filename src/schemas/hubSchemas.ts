import { z } from "zod";

export const hubUserSchema = z.union([
  z.string().uuid(),
  z.object({
    user_id: z.string().uuid(),
  }),
]);

export const hubSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  participants: z.array(hubUserSchema),
  hub_host: hubUserSchema,
  display_number: z
    .string()
    .max(10, "Display number must be less than 10 characters")
    .optional()
    .nullable(),
});

export type HubValues = z.infer<typeof hubSchema>;

export type HubUser = z.infer<typeof hubUserSchema>;

export const hubSchemaApiCall = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  hub_host: z.object({
    user_id: z.string(),
    user_name: z.string().optional(),
    visible_emails: z.array(z.string()).optional().nullable(),
  }),
  participants: z.array(z.object({ user_id: z.string() })),
  display_number: z
    .string()
    .max(10, "Display number must be less than 10 characters")
    .optional()
    .nullable(),
});

export type HubApiCall = z.infer<typeof hubSchemaApiCall>;
