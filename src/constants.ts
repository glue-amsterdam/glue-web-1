import { config } from "@/config";
import { ImageData } from "@/schemas/baseSchema";
import {
  Event,
  EventType,
  IndividualEventResponse,
  RSVPRequiredEvent,
} from "@/schemas/eventSchemas";
import {
  MemberUser,
  ParticipantUser,
  PlanResponseById,
  User,
} from "@/schemas/usersSchemas";

import {
  UserCircle,
  Calendar,
  Route,
  ChevronsLeftRightEllipsis,
  Compass,
  CircleEllipsis,
  ClipboardPen,
  Map,
  NotebookPen,
  Speech,
  Coffee,
  Hash,
} from "lucide-react";

/** Legacy route; redirects to participant-details or visitor-data. */
export const DEPRECATED_DASHBOARD_HREFS = ["user-data"] as const;

export const USER_DASHBOARD_SECTIONS = [
  {
    href: `visitor-data`,
    label: "Visitor Profile",
    icon: UserCircle,
  },
  {
    href: `participant-details`,
    label: "Participant Profile",
    icon: ClipboardPen,
  },
  {
    href: `map-info`,
    label: "Map Information",
    icon: Map,
  },
  {
    href: `events`,
    label: "Events",
    icon: Calendar,
  },
];

/** Shown for authenticated users who are not participants (visitor-only). */
export const VISITOR_ONLY_DASHBOARD_HREFS = ["visitor-data"] as const;

export const ADMIN_DASHBOARD_SECTIONS = [
  {
    href: `users-admin`,
    label: "Users Admin",
    icon: UserCircle,
  },
  {
    href: `routes`,
    label: "Routes",
    icon: Route,
  },
  {
    href: `hubs`,
    label: "Hubs",
    icon: ChevronsLeftRightEllipsis,
  },
  {
    href: `numbers`,
    label: "Numbers",
    icon: Hash,
  },
];

export const NAVBAR_HEIGHT: number = 5;
export const BASE_URL = config.baseApiUrl || "http://localhost:3000/api";

export const EVENT_TYPES = [
  "Lecture",
  "Workshop",
  "Drinks & Bites",
  "Guided Tour",
  "Other",
] as const;

export const getEventIcon = (type: EventType) => {
  switch (type) {
    case "Lecture":
      return Speech;
    case "Workshop":
      return NotebookPen;
    case "Drinks & Bites":
      return Coffee;
    case "Guided Tour":
      return Compass;
    default:
      return CircleEllipsis;
  }
};

export const EMPTY_IMAGE: ImageData = {
  image_name: "",
  image_url: "",
};

export const DEFAULT_EMPTY_EVENT: Omit<Event, "date"> = {
  eventId: "",
  name: "",
  thumbnail: {
    image_name: "",
    image_url: "",
  },
  organizer: {
    user_id: "",
  },
  coOrganizers: [],
  startTime: "",
  endTime: "",
  type: EVENT_TYPES[0] as EventType,
  description: "",
  createdAt: new Date(),
  updatedAt: new Date(),
  rsvp: false,
};

export const AN_HOUR_IN_S: number = 3600;
export const THREE_DAYS_IN_S: number = 259200;

export function isParticipantUser(
  user: User
): user is ParticipantUser & { planDetails: PlanResponseById } {
  return user.type === "participant";
}

export function isPaidUser(
  user: User
): user is (ParticipantUser | MemberUser) & { planDetails: PlanResponseById } {
  return user.type === "participant" || user.type === "member";
}

export function isRSVPRequiredEvent(
  event: IndividualEventResponse
): event is RSVPRequiredEvent & IndividualEventResponse {
  return (
    event.rsvp === true &&
    "rsvpLink" in event &&
    typeof event.rsvpLink === "string" &&
    event.rsvpLink.length > 0 &&
    "rsvpMessage" in event &&
    typeof event.rsvpMessage === "string"
  );
}

export const safeParseDate = (date: string | Date): Date => {
  return date instanceof Date ? date : new Date(date);
};

export function dotToHyphen(id: string): string {
  return id.replace(".", "-");
}

export function hyphenToDot(id: string): string {
  return id.replace("-", ".");
}

export function strToNumber(str: string) {
  return Number(str);
}
