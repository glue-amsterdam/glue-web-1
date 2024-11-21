import * as z from "zod";

export const hubSchema = z.object({
  name: z.string().min(1, "Hub name is required"),
  description: z.string().min(1, "Description is required"),
  hubMembers: z
    .array(
      z.object({
        userId: z.string(),
        userName: z.string(),
      })
    )
    .min(1, "At least one member is required"),
  hubPlace: z.object({
    mapbox_id: z.string(),
    place_name: z.string(),
  }),
});

export type HubValues = z.infer<typeof hubSchema>;
