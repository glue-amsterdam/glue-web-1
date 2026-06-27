import { EVENT_TYPES } from "@/constants";
import { toMediaKey } from "@/lib/media/media-url";
import { z } from "zod";

const eventFieldsSchema = z.object({
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
  location_id: z.string().uuid("Please select a valid location"),
  co_organizers: z.array(z.string().uuid()).nullable(),
  dayId: z.string(),
  file: z.any().optional(),
});

const addRsvpValidation = (
  data: z.infer<typeof eventFieldsSchema>,
  ctx: z.RefinementCtx
) => {
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
};

const addClientImageValidation = (
  data: z.infer<typeof eventFieldsSchema>,
  ctx: z.RefinementCtx
) => {
  const hasImage =
    data.file instanceof File ||
    (typeof data.image_url === "string" &&
      data.image_url.length > 0 &&
      (data.image_url.startsWith("http") || data.image_url.startsWith("blob:")));

  if (!hasImage) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Event image is required",
      path: ["image_url"],
    });
  }
};

export const eventSchema = eventFieldsSchema.superRefine((data, ctx) => {
  addRsvpValidation(data, ctx);
  addClientImageValidation(data, ctx);
});

export const eventPersistSchema = eventFieldsSchema
  .omit({ file: true })
  .extend({
    image_url: z
      .string()
      .url("Event image is required")
      .refine(
        (value) => value.startsWith("http"),
        "Event image must be a valid uploaded URL"
      ),
  })
  .superRefine((data, ctx) => {
    addRsvpValidation(data, ctx);
  });

export type EventFormInput = z.input<typeof eventSchema>;
export type EventType = z.output<typeof eventSchema>;
export type EventPersistInput = z.output<typeof eventPersistSchema>;

export type EventDbPayload = {
  title: string;
  organizer_id: string;
  image_url: string;
  start_time: string;
  end_time: string;
  type: EventType["type"];
  description: string | null;
  rsvp: boolean;
  rsvp_message: string | null;
  rsvp_link: string | null;
  location_id: string;
  co_organizers: string[] | null;
  dayId: string;
};

export const toEventDbPayload = (data: EventPersistInput): EventDbPayload => ({
  title: data.title,
  organizer_id: data.organizer_id,
  image_url: toMediaKey(data.image_url) ?? "",
  start_time: data.start_time,
  end_time: data.end_time,
  type: data.type,
  description: data.description,
  rsvp: data.rsvp,
  rsvp_message: data.rsvp ? (data.rsvp_message ?? null) : null,
  rsvp_link: data.rsvp ? (data.rsvp_link ?? null) : null,
  location_id: data.location_id,
  co_organizers: data.co_organizers,
  dayId: data.dayId,
});
