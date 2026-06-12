import type { ExhibitorType } from "@/lib/participants/exhibitor-types";
import type { EventType } from "@/schemas/eventSchemas";

export type ProgramOrganizerRef = {
  userId: string;
  userName: string;
  slug?: string;
};

export type ProgramOrganizer = ProgramOrganizerRef & {
  /** Venue-resolved exhibitor badge type (map location or organizer fallback). */
  type: ExhibitorType;
  displayNumber: string;
};

export type ProgramDate = {
  dayId: string;
  label: string;
  date: string | null;
};

export type ProgramListItem = {
  eventId: string;
  name: string;
  eventImg: string;
  date: ProgramDate;
  startTime: string;
  endTime: string;
  type: EventType;
  organizer: ProgramOrganizer;
  coOrganizers: ProgramOrganizerRef[];
  locationAddress?: string;
};

export type ProgramLocation = {
  id: string;
  formattedAddress: string;
};

export type ProgramDetail = ProgramListItem & {
  description: string;
  rsvp: boolean;
  rsvpLink?: string;
  location?: ProgramLocation;
};

export type ProgramPageResponse = {
  items: ProgramListItem[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
};

export type ProgramQueryParams = {
  limit?: number;
  offset?: number;
  type?: EventType;
  day?: string;
  q?: string;
};

export type ParsedProgramQuery = {
  limit: number;
  offset: number;
  type?: EventType;
  day?: string;
  q?: string;
};

export class ProgramNotFoundError extends Error {
  constructor(message = "Program event not found") {
    super(message);
    this.name = "ProgramNotFoundError";
  }
}
