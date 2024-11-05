import { EVENT_TYPES } from "@/constants";
import { ImageData } from "@/schemas/baseSchema";
import { EventDay } from "@/utils/menu-types";
import { ParticipantUser } from "@/utils/user-types";

export type EventType = (typeof EVENT_TYPES)[number];

export interface BaseEvent {
  organizer: Pick<ParticipantUser, "userId">;
  eventId: string;
  name: string;
  thumbnail: ImageData;
  coOrganizers: Pick<ParticipantUser, "userId">[];
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
  userId: string;
  userName?: string;
  slug?: string;
}

export interface EnhancedOrganizer extends EnhancedUser {
  mapId?: string;
  mapPlaceName?: string;
}

export interface IndividualEventResponse
  extends Omit<BaseEvent, "organizer" | "coOrganizers"> {
  organizer: EnhancedOrganizer;
  coOrganizers: EnhancedUser[];
}
