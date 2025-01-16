import { DAYS_IDS, EVENT_TYPES } from "@/constants";
import { z } from "zod";

export const eventSchema = z
  .object({
    id: z.string().uuid().optional(),
    title: z
      .string()
      .min(2, "Title is required")
      .max(50, "Title must be less than 50 characters"),
    organizer_id: z.string().uuid(),
    image_url: z.union([
      z.instanceof(File),
      z.string().url({ message: "Invalid image URL" }),
      z.string().length(0),
    ]),
    start_time: z.string().min(1, "Start time is required"),
    end_time: z.string().min(1, "End time is required"),
    type: z.enum(EVENT_TYPES),
    description: z
      .string()
      .max(250, "Description must be less than 250 characters")
      .nullable(),

    rsvp: z.boolean().default(false),
    rsvp_message: z.string().optional(),
    rsvp_link: z.string().optional(),
    location_id: z.string().min(1, "Location is needed"),
    co_organizers: z.array(z.string().uuid()).nullable(),
    dayId: z.enum(DAYS_IDS),
    file: z.any().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.rsvp) {
      if (!data.rsvp_message) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "RSVP message is required when RSVP is enabled",
          path: ["rsvp_message"],
        });
      }
      if (!data.rsvp_link) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "RSVP link is required when RSVP is enabled",
          path: ["rsvp_link"],
        });
      }
    }
  });

export type EventType = z.infer<typeof eventSchema>;
