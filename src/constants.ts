import { generateTimestamps, visitingHours } from "@/mockConstants";
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
export const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

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
  alt: "",
};

export const DEFAULT_EMPTY_EVENT: Omit<Event, "date"> = {
  eventId: "",
  name: "",
  thumbnail: {
    image_name: "",
    image_url: "",
    alt: "",
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

export const MOCKUSER_ADMIN_PARTICIPANT: User = {
  user_id: "50654654",
  slug: "vanmokum",
  user_name: "VANMOKUM",
  short_description: "High-end lighting and furniture brands",
  type: "participant",
  is_sticky: true,
  year: 1998,
  is_mod: true,
  status: "accepted",
  plan_id: "planId-3",
  description:
    "At VANMOKUM we take care of the development, manufacturing and distribution of high-end lighting and furniture brands:\n\nGRAYPANTS\nFRAMA\nPIET HEIN EEK LIGHTING\nAY ILLUMINATE\nSELETTI\nJAPTH\n\nAt GLUE'24, our PANDVANMOKUM will also be the place to discover work from external brands and designers:\n\nNLXLxSTUDIO JOB\nARTLINEZ\nJAN WILLEM KALDENBACH\nSUPA DUPA STUDIO\nSTUDIO RENS\nVANJOOSTxKEGEL\nDIRK DUIF\nTEUN ZWETS",
  invoice_data: {
    ...generateTimestamps(),
    invoice_id: "invoice-user50654654",
    user_id: "50654654",
    invoice_data: {
      invoice_company_name: "VANMOKUM",
      invoice_zip_code: "1071 XX",
      invoice_address: "Museumstraat 1",
      invoice_country: "Netherlands",
      invoice_city: "Amsterdam",
      invoice_extra: "Extra data",
    },
  },
  map_id: { id: "place.1234" },
  visiting_hours: visitingHours,
  phone_number: ["+31 (0)20 21 03 101"],
  visible_email: ["press@vanmokum.com"],
  visible_website: ["/members/vanmokum"],
  social_media: {
    instagramLink: "https://www.instagram.com/vanmokum/",
    facebookLink: "https://www.facebook.com/VANMOKUM/",
    linkedinLink: "https://www.linkedin.com/company/vanmokum",
  },
  images: [
    {
      image_name: "vanmokum-carousel-image-1",
      image_url: `/placeholders/user-placeholder-1.jpg`,
      alt: "vanmokum profile image 1",
      ...generateTimestamps(),
    },
    {
      image_name: "vanmokum-carousel-image-2",
      image_url: `/placeholders/user-placeholder-2.jpg`,
      alt: "vanmokum profile image 2",
      ...generateTimestamps(),
    },
    {
      image_name: "vanmokum-carousel-image-3",
      image_url: `/placeholders/user-placeholder-3.jpg`,
      alt: "vanmokum profile image 3",
      ...generateTimestamps(),
    },
  ],
  email: "press@vanmokum.com",
  password: "password",
  ...generateTimestamps(),
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
