import { EVENT_TYPES } from "@/constants";
import { ImageData } from "@/utils/global-types";

export type EventType = (typeof EVENT_TYPES)[number];

export interface Organizer {
  id: string;
  name: string;
  slug: string;
}

interface BaseEvent {
  eventId: string;
  name: string;
  thumbnail: ImageData;
  organizer: Organizer;
  coOrganizers: Organizer[];
  date: string;
  startTime: string;
  endTime: string;
  type: EventType;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

interface RSVPRequiredEvent extends BaseEvent {
  rsvp: true;
  rsvpMessage: string;
  rsvpLink: string;
}

interface RSVPOptionalEvent extends BaseEvent {
  rsvp?: false | undefined;
  rsvpMessage?: string;
  rsvpLink?: string;
}

export type Event = RSVPRequiredEvent | RSVPOptionalEvent;
