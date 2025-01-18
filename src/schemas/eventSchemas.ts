import { EVENT_TYPES } from "@/constants";
import { ImageData, imageDataSchema } from "@/schemas/baseSchema";
import {
  enhancedOrganizerSchema,
  enhancedUserSchema,
  ParticipantUser,
} from "@/schemas/usersSchemas";
import * as z from "zod";

export const eventDaySchema = z.object({
  dayId: z.string(),
  date: z.string().nullable(),
  label: z.string().min(1, "Label is required"),
});

export type EventDay = z.infer<typeof eventDaySchema>;

export const eventDaysSchema = z.object({
  eventDays: z.array(eventDaySchema).refine(
    (days) => {
      const validDates = days
        .filter((day) => day.date !== null)
        .map((day) => new Date(day.date!).getTime());
      return new Set(validDates).size === validDates.length;
    },
    {
      message: "Event dates must be unique",
    }
  ),
});
export const eventDaysResponseSchema = z.object({
  eventDays: z.array(eventDaySchema),
});

export type EventDaysResponse = z.infer<typeof eventDaysResponseSchema>;

export const baseEventSchema = z.object({
  eventId: z.string(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  thumbnail: imageDataSchema,
  organizer: enhancedOrganizerSchema,
  coOrganizers: z.array(enhancedUserSchema),
  date: eventDaySchema,
  location_id: z.string(),
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Please enter a valid time in HH:MM format"),
  endTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Please enter a valid time in HH:MM format"),
  type: z.enum(EVENT_TYPES),
  description: z.string().min(10, "Description must be at least 10 characters"),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export const rsvpRequiredEventSchema = baseEventSchema.extend({
  rsvp: z.literal(true),
  rsvpMessage: z.string(),
  rsvpLink: z.string().url(),
});

export const rsvpOptionalEventSchema = baseEventSchema.extend({
  rsvp: z.literal(false).optional(),
  rsvpMessage: z.string().optional(),
  rsvpLink: z.string().url().optional(),
});

export const eventSchema: z.ZodType<Event> = z.discriminatedUnion("rsvp", [
  rsvpRequiredEventSchema,
  rsvpOptionalEventSchema,
]);

/* EVENT TYPES => */
export type EventType = (typeof EVENT_TYPES)[number];

export interface BaseEvent {
  organizer: Pick<ParticipantUser, "user_id">;
  eventId: string;
  name: string;
  thumbnail: ImageData;
  coOrganizers?: Pick<ParticipantUser, "user_id">[];
  date: EventDay;
  startTime: string;
  endTime: string;
  type: EventType;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RSVPRequiredEvent extends BaseEvent {
  rsvp: true;
  rsvpMessage: string;
  rsvpLink: string;
}

export interface RSVPOptionalEvent extends BaseEvent {
  rsvp?: false | undefined;
  rsvpMessage?: string;
  rsvpLink?: string;
}

export type Event = RSVPRequiredEvent | RSVPOptionalEvent;

export interface EnhancedUser {
  map_id?: string;
  user_id: string;
  user_name: string;
  slug?: string;
}

export interface EnhancedOrganizer extends EnhancedUser {
  map_id: string;
}

export interface IndividualEventResponse
  extends Omit<BaseEvent, "organizer" | "coOrganizers"> {
  rsvp: boolean;
  organizer: EnhancedOrganizer;
  coOrganizers: EnhancedUser[] | null;
}
/* <= EVENT TYPES */

export type MapBasicInfo = {
  id: string;
  formatted_address: string;
  // Add any other fields that are returned by the API
};

// Extended type for individual event with map info
export type IndividualEventWithMapResponse = IndividualEventResponse & {
  location: MapBasicInfo;
};
