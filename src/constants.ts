import { config } from "@/env";
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
  CalendarArrowUp,
  UserRoundPen,
  Route,
  PencilOff,
  ChevronsLeftRightEllipsis,
  LucidePencilRuler,
  Beer,
  Compass,
  BookOpenText,
  BicepsFlexed,
  CircleEllipsis,
  ClipboardPen,
  PanelTopDashed,
  Map,
  Clock8,
} from "lucide-react";

export const USER_DASHBOARD_SECTIONS = [
  {
    href: `user-data`,
    label: "User Data",
    icon: UserRoundPen,
  },
  {
    href: `participant-details`,
    label: "Participant Details",
    icon: ClipboardPen,
  },
  {
    href: `profile-image`,
    label: "Profile Image/s",
    icon: ClipboardPen,
  },
  {
    href: `visiting-hours`,
    label: "Visiting Hours",
    icon: Clock8,
  },
  {
    href: `map-info`,
    label: "Map Information",
    icon: Map,
  },
  {
    href: `invoice-data`,
    label: "Invoice Data",
    icon: PanelTopDashed,
  },
  {
    href: `create-events`,
    label: "Create Events",
    icon: CalendarArrowUp,
  },
  {
    href: `your-events`,
    label: "Your Events",
    icon: Calendar,
  },
];

export const ADMIN_DASHBOARD_SECTIONS = [
  {
    href: `users-admin`,
    label: "Users Admin",
    icon: UserCircle,
  },
  {
    href: `create-route`,
    label: "Create Route",
    icon: Route,
  },
  {
    href: `edit-routes`,
    label: "Edit Routes",
    icon: PencilOff,
  },
  {
    href: `hub-create`,
    label: "HUB Create",
    icon: ChevronsLeftRightEllipsis,
  },
  {
    href: `hub-edit`,
    label: "HUB Edit",
    icon: LucidePencilRuler,
  },
];

export const NAVBAR_HEIGHT: number = 5;
export const BASE_URL = config.baseApiUrl || "http://localhost:3000/api";

export const DAYS_IDS = ["day-1", "day-2", "day-3", "day-4"] as const;

export const DAYS = [
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
  "Other",
] as const;

export const EVENT_TYPES = [
  "Lecture",
  "Workshop",
  "Drink",
  "Guided Tour",
  "Other",
] as const;

export const getEventIcon = (type: EventType) => {
  switch (type) {
    case "Lecture":
      return BookOpenText;
    case "Workshop":
      return BicepsFlexed;
    case "Drink":
      return Beer;
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
