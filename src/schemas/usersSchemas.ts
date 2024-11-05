import { EnhancedOrganizer, EnhancedUser } from "@/utils/event-types";
import * as z from "zod";

/* PARTICIPANTS */
export const enhancedUserSchema: z.ZodType<EnhancedUser> = z.object({
  userId: z.string(),
  userName: z.string().optional(),
  slug: z.string().optional(),
});
export const enhancedOrganizerSchema: z.ZodType<EnhancedOrganizer> =
  enhancedUserSchema.and(
    z.object({
      mapId: z.string().optional(),
      mapPlaceName: z.string().optional(),
    })
  );
