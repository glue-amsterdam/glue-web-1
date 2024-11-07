import { imageDataSchema } from "@/schemas/baseSchema";
import { EnhancedOrganizer, EnhancedUser } from "@/utils/event-types";
import * as z from "zod";

export interface LoggedInUserType {
  userId: string;
  userName: string;
  isMod: boolean;
  userType: string;
}

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

const timeRangeSchema = z.object({
  open: z.string().regex(/^\d{2}:\d{2}$/, "Open time must be in HH:MM format"),
  close: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Close time must be in HH:MM format"),
});

const daySchema = z.object({
  dayId: z.string(),
  label: z.string(),
  date: z.date(),
  ranges: z.array(timeRangeSchema).optional(),
});

export const visitingHoursSchema = z.array(daySchema);

export type VisitingHoursType = z.infer<typeof visitingHoursSchema>;

export const apiParticipantSchema = z.object({
  userId: z.string(),
  planId: z.string(),
  updatedAd: z.string().datetime(),
  createdAt: z.string().datetime(),
  mapId: z.string(),
  images: z.array(imageDataSchema).max(3, "You can add up to 3 images"),
  slug: z
    .string()
    .regex(
      /^[a-zA-Z0-9-]+$/,
      "Slug can only contain letters, numbers, and hyphens"
    ),
  userName: z.string().min(2, "Name must be at least 2 characters"),
  shortDescription: z
    .string()
    .max(200, "Short description must be less than 200 characters"),
  description: z.string(),
  mapPlaceName: z.string(),
  visitingHours: visitingHoursSchema,
  phoneNumber: z.array(z.string().min(1, "Phone number cannot be empty")),
  visibleEmail: z
    .array(z.string().email().or(z.string().length(0)))
    .max(3, "You can add up to 3 email addresses"),
  visibleWebsite: z
    .array(z.string().url().or(z.string().length(0)))
    .max(3, "You can add up to 3 websites"),
  socialMedia: z.object({
    instagramLink: z.string().url().optional(),
    facebookLink: z.string().url().optional(),
    linkedinLink: z.string().url().optional(),
  }),
});

export const formParticipantSchema = apiParticipantSchema
  .omit({
    createdAt: true,
  })
  .extend({
    userId: z.string(),
  });

export type ApiParticipantBaseType = z.infer<typeof apiParticipantSchema>;
export type FormParticipantBaseType = z.infer<typeof formParticipantSchema>;
