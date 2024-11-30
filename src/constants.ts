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
} from "lucide-react";

export const USER_DASHBOARD_SECTIONS = [
  {
    href: `user-data`,
    label: "User Data",
    icon: UserRoundPen,
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
  id: "",
  image_name: "",
  image_url: "",
  alt: "",
};

export const DEFAULT_EMPTY_EVENT: Omit<Event, "date"> = {
  eventId: "",
  name: "",
  thumbnail: {
    id: "",
    image_name: "",
    image_url: "",
    alt: "",
  },
  organizer: {
    userId: "",
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
  userId: "50654654",
  slug: "vanmokum",
  userName: "VANMOKUM",
  shortDescription: "High-end lighting and furniture brands",
  type: "participant",
  isCurated: true,
  year: 1998,
  isMod: true,
  status: "accepted",
  planId: "planId-3",
  description:
    "At VANMOKUM we take care of the development, manufacturing and distribution of high-end lighting and furniture brands:\n\nGRAYPANTS\nFRAMA\nPIET HEIN EEK LIGHTING\nAY ILLUMINATE\nSELETTI\nJAPTH\n\nAt GLUE'24, our PANDVANMOKUM will also be the place to discover work from external brands and designers:\n\nNLXLxSTUDIO JOB\nARTLINEZ\nJAN WILLEM KALDENBACH\nSUPA DUPA STUDIO\nSTUDIO RENS\nVANJOOSTxKEGEL\nDIRK DUIF\nTEUN ZWETS",
  invoiceData: {
    ...generateTimestamps(),
    invoiceId: "invoice-user50654654",
    userId: "50654654",
    invoiceData: {
      invoiceCompanyName: "VANMOKUM",
      invoiceZipCode: "1071 XX",
      invoiceAddress: "Museumstraat 1",
      invoiceCountry: "Netherlands",
      invoiceCity: "Amsterdam",
      invoiceExtra: "Extra data",
    },
  },
  mapId: { id: "place.1234" },
  visitingHours: visitingHours,
  phoneNumber: ["+31 (0)20 21 03 101"],
  visibleEmail: ["press@vanmokum.com"],
  visibleWebsite: ["/members/vanmokum"],
  socialMedia: {
    instagramLink: "https://www.instagram.com/vanmokum/",
    facebookLink: "https://www.facebook.com/VANMOKUM/",
    linkedinLink: "https://www.linkedin.com/company/vanmokum",
  },
  images: [
    {
      image_name: "vanmokum-carousel-image-1",
      id: "vanmokum-carousel-image-1",
      image_url: `/placeholders/user-placeholder-1.jpg`,
      alt: "vanmokum profile image 1",
      ...generateTimestamps(),
    },
    {
      image_name: "vanmokum-carousel-image-2",
      id: "vanmokum-carousel-image-2",
      image_url: `/placeholders/user-placeholder-2.jpg`,
      alt: "vanmokum profile image 2",
      ...generateTimestamps(),
    },
    {
      image_name: "vanmokum-carousel-image-3",
      id: "vanmokum-carousel-image-3",
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
