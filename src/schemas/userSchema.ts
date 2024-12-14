import { z } from "zod";
import { imageDataSchema } from "./baseSchema";
import { PlanSchema } from "@/schemas/plansSchema";
import { invoiceDataCallSchema } from "@/schemas/invoiceSchemas";
import { visitingHoursSchema } from "@/schemas/visitingHoursSchema";

// SocialMediaLinks schema
const socialMediaLinksSchema = z.object({
  instagramLink: z.string().url().optional(),
  facebookLink: z.string().url().optional(),
  linkedinLink: z.string().url().optional(),
});

// StatusType schema
const statusTypeSchema = z.enum(["pending", "accepted", "declined"]);

// FreeplanUser schema
const freeplanUserSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  plan_id: z.literal("planId-0"),
  plan_type: z.literal("free"),
  is_mod: z.boolean(),
  user_id: z.string().uuid(),
  user_name: z.string().optional(),
});

// MemberUser schema
const memberUserSchema = z.object({
  email: z.string().email(),
  invoice_data: invoiceDataCallSchema,
  password: z.string(),
  plan_id: z.literal("planId-1"),
  user_id: z.string().uuid(),
  plan_type: z.literal("member"),
  is_mod: z.boolean(),
  user_name: z.string().optional(),
});

// ParticipantUserBase schema
const participantUserBaseSchema = z.object({
  user_id: z.string().uuid(),
  email: z.string().email(),
  password: z.string(),
  user_name: z.string(),
  slug: z.string(),
  is_mod: z.boolean(),
  plan_id: z.enum(["planId-2", "planId-3", "planId-4", "planId-5"]),
  plan_type: z.literal("participant"),
  invoice_data: invoiceDataCallSchema,
  short_description: z.string(),
  phone_number: z.array(z.string()).optional(),
  social_media: socialMediaLinksSchema.optional(),
  visible_email: z.array(z.string().email()).optional(),
  visible_website: z.array(z.string().url()).optional(),
  images: z.array(imageDataSchema).optional(),
  events: z.array(z.object({ eventId: z.string() })).optional(),
  description: z.string().optional(),
  visiting_hours: visitingHoursSchema.optional(),
  status: statusTypeSchema,
});

// ParticipantUserWithMap schema
const participantUserWithMapSchema = participantUserBaseSchema.extend({
  map_id: z.object({ id: z.string() }),
});

// ParticipantUserWithoutMap schema
const participantUserWithoutMapSchema = participantUserBaseSchema.extend({
  no_address: z.literal(true),
});

// CuratedStickyParticipantUser schema
const curatedStickyParticipantUserSchema = z.object({
  is_sticky: z.literal(true),
  year: z.number(),
});

// NonCuratedStickyParticipantUser schema
const nonCuratedStickyParticipantUserSchema = z.object({
  is_sticky: z.literal(false),
  year: z.number().optional(),
});

// ParticipantUser schema
const participantUserSchema = z
  .union([participantUserWithMapSchema, participantUserWithoutMapSchema])
  .and(
    z.union([
      curatedStickyParticipantUserSchema,
      nonCuratedStickyParticipantUserSchema,
    ])
  );

// User schema
const userSchema = z.union([
  freeplanUserSchema,
  memberUserSchema,
  participantUserSchema,
]);
export type User = z.infer<typeof userSchema>;

// PlanResponseById schema
const planResponseByIdSchema = PlanSchema.pick({
  plan_label: true,
  plan_price: true,
  plan_currency: true,
  currency_logo: true,
});

// UserWithPlanDetails schema
const userWithPlanDetailsSchema = z.intersection(
  userSchema,
  z.object({
    planDetails: planResponseByIdSchema,
  })
);

// UsersResponse schema
const usersResponseSchema = z.object({
  users: z.array(userSchema),
});

// CuratedStickyParticipant schema
const curatedStickyParticipantSchema = z.object({
  slug: z.string(),
  user_name: z.string(),
  year: z.number(),
});

export {
  socialMediaLinksSchema,
  statusTypeSchema,
  freeplanUserSchema,
  memberUserSchema,
  participantUserBaseSchema,
  participantUserWithMapSchema,
  participantUserWithoutMapSchema,
  participantUserSchema,
  userSchema,
  planResponseByIdSchema,
  userWithPlanDetailsSchema,
  usersResponseSchema,
  curatedStickyParticipantSchema,
};
