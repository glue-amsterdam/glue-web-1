import { ImageData } from "@/schemas/baseSchema";
import { VisitingHoursType } from "@/schemas/usersSchemas";
import { Event } from "@/utils/event-types";
import { MapBoxPlace } from "@/utils/map-types";
import { InvoiceDataCall, PlanType } from "@/utils/sign-in.types";

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
  password: string /* PASSWORD UUIID OR BYCRIPT */;
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
  password: string /* PASSWORD UUIID OR BYCRIPT */;
  userName: string;
  isMod: boolean;
  planId: "planId-1"; // El plan es "member"
  type: "member";
  invoiceData: InvoiceDataCall;
  status: StatusType;
  createdAt: Date;
  updatedAt: Date;
};

export type ParticipantUser = {
  userId: string /* FOREIGN KEY UUIID*/;
  slug: string /* UNIQUE */;
  email: string /* UNIQUE */;
  password: string /* PASSWORD OR BYCRIPT */;
  userName: string;
  isMod: boolean;
  planId: "planId-2" | "planId-3" | "planId-4" | "planId-5";
  type: "participant";
  invoiceData: InvoiceDataCall;
  shortDescription: string;
  images?: ImageData[];
  events?: Event[];
  description?: string;
  mapInfo: MapBoxPlace;
  visitingHours?: VisitingHoursType;
  phoneNumber?: string[];
  visibleEmail?: string[];
  visibleWebsite?: string[];
  socialMedia?: SocialMediaLinks;
  status: StatusType;
  createdAt: Date;
  updatedAt: Date;
} & (CuratedParticipantUser | NonCuratedParticipantUser);

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
