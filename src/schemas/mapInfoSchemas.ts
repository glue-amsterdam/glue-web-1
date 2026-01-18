import { z } from "zod";

export const mapInfoSchema = z.object({
  user_id: z.string().uuid().optional(),
  formatted_address: z.string().nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  no_address: z.boolean().nullable().default(false),
  exhibition_space_preference: z.string().nullable().optional(),
});

export type MapInfo = z.infer<typeof mapInfoSchema>;
