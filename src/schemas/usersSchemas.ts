import { imageDataSchema } from "@/schemas/baseSchema";
import * as z from "zod";

export interface LoggedInUserType {
  user_id: string;
  user_name: string;
  is_mod: boolean;
  userType: string;
}

export type CuratedParticipantWithYear = {
  slug: string;
  userName: string;
  year: number;
};

/* PARTICIPANTS */
export const enhancedUserSchema: z.ZodType<EnhancedUser> = z.object({
  user_id: z.string(),
  user_name: z.string(),
  slug: z.string().optional(),
});
export const enhancedOrganizerSchema: z.ZodType<EnhancedOrganizer> =
  enhancedUserSchema.and(
    z.object({
      map_id: z.string(),
    })
  );

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

/* USER TYPES => */
import { ImageData } from "@/schemas/baseSchema";
import { InvoiceDataCall } from "@/schemas/invoiceSchemas";
import { EnhancedOrganizer, EnhancedUser, Event } from "@/schemas/eventSchemas";

import { PlanType } from "@/schemas/plansSchema";
import {
  VisitingHours,
  visitingHoursSchema,
} from "@/schemas/visitingHoursSchema";
import { MapInfoAPICall } from "@/schemas/mapSchema";

export interface SocialMediaLinks {
  instagramLink?: string;
  facebookLink?: string;
  linkedinLink?: string;
}

export type FreeplanUser = {
  user_id: string /* FOREIGN KEY UUIID*/;
  email: string /* UNIQUE */;
  password: string /* PASSWORD BYCRIPT */;
  user_name: string;
  is_mod: boolean;
  plan_id: "planId-0"; // El plan es "free"
  type: "visitor";
};

export type StatusType = "pending" | "accepted" | "declined";

export type MemberUser = {
  user_id: string /* FOREIGN KEY UUIID*/;
  email: string /* UNIQUE */;
  password: string /* PASSWORD BYCRIPT */;
  user_name: string;
  is_mod: boolean;
  plan_id: "planId-1"; // El plan es "member"
  type: "member";
  invoice_data: InvoiceDataCall;
  status: StatusType;
};

export type ParticipantUserBase = {
  user_id: string /* FOREIGN KEY UUIID*/;
  slug: string /* UNIQUE */;
  email: string /* UNIQUE */;
  password: string /* BYCRIPT */;
  user_name: string;
  is_mod: boolean;
  plan_id: "planId-2" | "planId-3" | "planId-4" | "planId-5";
  type: "participant";
  invoice_data: InvoiceDataCall;
  short_description: string;
  images?: ImageData[];
  events?: Pick<Event, "eventId">[];
  description?: string;
  visiting_hours?: VisitingHours;
  phone_number?: string[];
  visible_email?: string[];
  visible_website?: string[];
  social_media?: SocialMediaLinks;
  status: StatusType;
};

export type ParticipantUserWithMap = ParticipantUserBase & {
  map_id: Pick<MapInfoAPICall, "id">;
  no_address?: never;
};

export type ParticipantUserWithoutMap = ParticipantUserBase & {
  no_address: true;
  map_id?: never;
};

export type ParticipantUser = (
  | ParticipantUserWithMap
  | ParticipantUserWithoutMap
) &
  (CuratedStickyParticipantUser | NonCuratedStickyParticipantUser);

export type User = FreeplanUser | MemberUser | ParticipantUser;

export type PlanResponseById = Pick<
  PlanType,
  "plan_label" | "plan_price" | "plan_currency" | "currency_logo"
>;

export type UserWithPlanDetails = User & {
  planDetails: PlanResponseById;
};

export interface UsersResponse {
  users: User[];
}

export type CuratedStickyParticipant = {
  slug: string;
  user_name: string;
  year: number;
};

type CuratedStickyParticipantUser = {
  is_sticky: true;
  year: number;
};

type NonCuratedStickyParticipantUser = {
  is_sticky: false;
  year?: number;
};
