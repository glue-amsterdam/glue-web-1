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
});

export type HubValues = z.infer<typeof hubSchema>;

export type HubUser = z.infer<typeof hubUserSchema>;

export const hubSchemaApiCall = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  participants: z.array(hubUserSchema),
  hub_host: hubUserSchema,
});

export type HubApiCall = z.infer<typeof hubSchemaApiCall>;
