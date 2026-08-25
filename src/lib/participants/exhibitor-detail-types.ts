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

export type ExhibitorDetailNavigation = {
  showMap: boolean;
  showEvents: boolean;
  mapHrefs: string[];
  eventsHref: string | null;
};

export type ExhibitorContactInfo = {
  mapInfo: ExhibitorMapInfo[];
  /** Eligible hub-host map_info rows for every inherited hub. */
  hubLocations?: ExhibitorMapInfo[];
  /** Hub host street address when the participant belongs to a hub. */
  hubHostAddress?: string | null;
  /** map_info id of the hub host when the participant belongs to an eligible hub. */
  hubHostMapInfoId?: string | null;
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
  showHubNumber?: boolean;
  inheritedHubs?: { displayNumber: string | null; type: ExhibitorType }[];
  description: string | null;
  status: string;
  is_sticky: boolean;
  is_active: boolean;
  was_active_last_year: boolean;
  contactInfo: ExhibitorContactInfo;
  navigation: ExhibitorDetailNavigation;
};

export type ExhibitorHubMember = {
  userId: string;
  slug: string;
  name: string;
  imageUrl: string;
  displayNumber: string | null;
  type: ExhibitorType;
  showHubNumber?: boolean;
  inheritedHubs?: { displayNumber: string | null; type: ExhibitorType }[];
};

export type ExhibitorHubDetail = {
  type: ExhibitorType;
  hubId: string;
  name: string;
  hubDisplayNumber: string | null;
  description: string | null;
  mapInfoId: string | null;
  formattedAddress: string | null;
  events: ExhibitorEventSummary[];
  members: ExhibitorHubMember[];
};

export class ExhibitorNotFoundError extends Error {
  constructor(message = "Exhibitor not found") {
    super(message);
    this.name = "ExhibitorNotFoundError";
  }
}
