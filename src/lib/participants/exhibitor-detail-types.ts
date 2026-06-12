import type { ExhibitorCarouselSlide } from "./exhibitor-carousel-slides";
import type { OpenCloseTime } from "@/types/api-visible-user";
import type { ExhibitorType } from "./exhibitor-types";

export type ExhibitorMapInfo = {
  formatted_address: string;
  id: string;
  no_address: boolean;
};

export type ExhibitorSocialMedia = {
  facebookLink?: string;
  linkedinLink?: string;
  instagramLink?: string;
};

export type ExhibitorEventSummary = {
  id: string;
  image_url: string;
  title: string;
};

export type ExhibitorContactInfo = {
  mapInfo: ExhibitorMapInfo[];
  /** Hub host street address when the participant belongs to a hub. */
  hubHostAddress?: string | null;
  phoneNumbers: string[] | null;
  visibleEmails: string[] | null;
  visibleWebsites: string[] | null;
  socialMedia: ExhibitorSocialMedia | null;
  visitingHours: Record<string, OpenCloseTime[]> | null;
  events: ExhibitorEventSummary[];
};

export type ExhibitorParticipantDetail = {
  type: ExhibitorType;
  slug: string;
  userId: string;
  name: string;
  /** First slide image; used for Open Graph and list cards. */
  imageUrl: string;
  carouselSlides: ExhibitorCarouselSlide[];
  displayNumber: string | null;
  description: string | null;
  status: string;
  is_sticky: boolean;
  contactInfo: ExhibitorContactInfo;
};

export type ExhibitorHubMember = {
  userId: string;
  slug: string;
  name: string;
  imageUrl: string;
  displayNumber: string | null;
  type: ExhibitorType;
};

export type ExhibitorHubDetail = {
  type: ExhibitorType;
  hubId: string;
  name: string;
  hubDisplayNumber: string | null;
  description: string | null;
  mapInfoId: string | null;
  formattedAddress: string | null;
  members: ExhibitorHubMember[];
};

export class ExhibitorNotFoundError extends Error {
  constructor(message = "Exhibitor not found") {
    super(message);
    this.name = "ExhibitorNotFoundError";
  }
}
