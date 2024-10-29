import { Image } from "@/utils/about-types";
import { MapBoxPlace } from "@/utils/map-types";

interface TimeRange {
  open: string;
  close: string;
}

export type Days = "Thursday" | "Friday" | "Saturday" | "Sunday" | "Other";

interface DayRange {
  label: Days;
  ranges: TimeRange[];
}

interface VisitingHours {
  thursday?: DayRange;
  friday?: DayRange;
  saturday?: DayRange;
  sunday?: DayRange;
  extraday?: DayRange;
}

interface SocialMediaLinks {
  instagram?: string[];
  facebook?: string[];
  linkedin?: string[];
}

interface BaseMember {
  id: string /* FOREING KEY */;
  slug: string /* UNIQUE */;
  name: string;
  shortDescription: string;
  description: string;
  mapInfo?: MapBoxPlace;
  visitingHours: VisitingHours;
  phoneNumber: string[];
  visibleEmail: string[];
  visibleWebsite: string[];
  socialMedia: SocialMediaLinks;
  images: Image[];
}

interface RSVPRequiredMember extends BaseMember {
  rsvp: true;
  rsvpMessage: string;
  rsvpLink: string;
}

interface RSVPOptionalMember extends BaseMember {
  rsvp?: false | undefined;
  rsvpMessage?: string;
  rsvpLink?: string;
}

export type Member = RSVPRequiredMember | RSVPOptionalMember;

export interface MembersResponse {
  members: Member[];
}
