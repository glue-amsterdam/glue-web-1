import { imageDataSchema } from "@/schemas/baseSchema";
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
  userName: z.string(),
  slug: z.string().optional(),
});
export const enhancedOrganizerSchema: z.ZodType<EnhancedOrganizer> =
  enhancedUserSchema.and(
    z.object({
      mapId: z.string(),
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
  date: z.union([z.string(), z.null()]),
  ranges: z.array(timeRangeSchema).optional(),
});

export const visitingHoursSchema = z.array(daySchema);

export type DayType = z.infer<typeof daySchema>;
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

/* USER TYPES => */
import { ImageData } from "@/schemas/baseSchema";
import { InvoiceDataCall, PlanType } from "@/schemas/invoiceSchemas";
import { EnhancedOrganizer, EnhancedUser, Event } from "@/schemas/eventSchemas";
import { MapBoxPlace } from "@/schemas/mapSchema";

export interface SocialMediaLinks {
  instagramLink?: string;
  facebookLink?: string;
  linkedinLink?: string;
}

type CuratedParticipantUser = {
  isCurated: true;
  year: number;
};

type NonCuratedParticipantUser = {
  isCurated: false;
  year?: number;
};

export type FreeplanUser = {
  userId: string /* FOREIGN KEY UUIID*/;
  email: string /* UNIQUE */;
  password: string /* PASSWORD BYCRIPT */;
  userName: string;
  isMod: boolean;
  planId: "planId-0"; // El plan es "free"
  type: "visitor";
  createdAt: Date;
  updatedAt: Date;
};

export type StatusType = "pending" | "accepted" | "declined";

export type MemberUser = {
  userId: string /* FOREIGN KEY UUIID*/;
  email: string /* UNIQUE */;
  password: string /* PASSWORD BYCRIPT */;
  userName: string;
  isMod: boolean;
  planId: "planId-1"; // El plan es "member"
  type: "member";
  invoiceData: InvoiceDataCall;
  status: StatusType;
  createdAt: Date;
  updatedAt: Date;
};

export type ParticipantUserBase = {
  userId: string /* FOREIGN KEY UUIID*/;
  slug: string /* UNIQUE */;
  email: string /* UNIQUE */;
  password: string /* BYCRIPT */;
  userName: string;
  isMod: boolean;
  planId: "planId-2" | "planId-3" | "planId-4" | "planId-5";
  type: "participant";
  invoiceData: InvoiceDataCall;
  shortDescription: string;
  images?: ImageData[];
  events?: Pick<Event, "eventId">[];
  description?: string;
  visitingHours?: VisitingHoursType;
  phoneNumber?: string[];
  visibleEmail?: string[];
  visibleWebsite?: string[];
  socialMedia?: SocialMediaLinks;
  status: StatusType;
  createdAt: Date;
  updatedAt: Date;
};
export type ParticipantUserWithMap = ParticipantUserBase & {
  mapId: Pick<MapBoxPlace, "id">;
  noAddress?: never;
};

export type ParticipantUserWithoutMap = ParticipantUserBase & {
  noAddress: true;
  mapInfo?: never;
};

export type ParticipantUser = (
  | ParticipantUserWithMap
  | ParticipantUserWithoutMap
) &
  (CuratedParticipantUser | NonCuratedParticipantUser);

export type User = FreeplanUser | MemberUser | ParticipantUser;

export type PlanResponseById = Pick<
  PlanType,
  "planLabel" | "planPrice" | "planCurrency" | "currencyLogo"
>;

export type UserWithPlanDetails = User & {
  planDetails: PlanResponseById;
};

export interface UsersResponse {
  users: User[];
}

export type CuratedParticipantWhitYear = {
  slug: string;
  userName: string;
  year: number;
};

/* <= USER TYPES */
