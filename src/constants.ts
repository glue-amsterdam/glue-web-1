import { generateTimestamps, visitingHours } from "@/mockConstants";
import { ImageData } from "@/schemas/baseSchema";
import {
  BaseEvent,
  Event,
  EventType,
  RSVPRequiredEvent,
} from "@/utils/event-types";
import {
  MemberUser,
  ParticipantUser,
  PlanResponseById,
  User,
} from "@/utils/user-types";

import {
  UserCircle,
  Calendar,
  CalendarArrowUp,
  UserRoundPen,
  Route,
  PencilOff,
  ChevronsLeftRightEllipsis,
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
    href: `hub-admin`,
    label: "HUB Admin",
    icon: ChevronsLeftRightEllipsis,
  },
];

export const NAVBAR_HEIGHT: number = 5;

export const DAYS_IDS = [
  "day-1",
  "day-2",
  "day-3",
  "day-4",
  "extra-day",
] as const;

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

export const EMPTY_IMAGE: ImageData = {
  id: "",
  imageName: "",
  imageUrl: "",
  alt: "",
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const DEFAULT_EMPTY_EVENT: Omit<Event, "date"> = {
  eventId: "",
  name: "",
  thumbnail: {
    id: "",
    imageName: "",
    imageUrl: "",
    alt: "",
    createdAt: new Date(),
    updatedAt: new Date(),
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

  mapInfo: {
    id: "place.1234",
    text: "Rijksmuseum",
    place_name: "Rijksmuseum, Museumstraat 1, 1071 XX Amsterdam, Netherlands",
    center: [4.8852, 52.3599],
    context: [
      {
        id: "region.678",
        text: "North Holland",
      },
      {
        id: "country.345",
        text: "Netherlands",
        short_code: "NL",
      },
    ],
    ...generateTimestamps(),
  },
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
      imageName: "vanmokum-carousel-image-1",
      id: "vanmokum-carousel-image-1",
      imageUrl: `/placeholders/user-placeholder-1.jpg`,
      alt: "vanmokum profile image 1",
      ...generateTimestamps(),
    },
    {
      imageName: "vanmokum-carousel-image-2",
      id: "vanmokum-carousel-image-2",
      imageUrl: `/placeholders/user-placeholder-2.jpg`,
      alt: "vanmokum profile image 2",
      ...generateTimestamps(),
    },
    {
      imageName: "vanmokum-carousel-image-3",
      id: "vanmokum-carousel-image-3",
      imageUrl: `/placeholders/user-placeholder-3.jpg`,
      alt: "vanmokum profile image 3",
      ...generateTimestamps(),
    },
  ],
  email: "press@vanmokum.com",
  password: "password",
  ...generateTimestamps(),
};

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
  event: BaseEvent
): event is RSVPRequiredEvent {
  return (event as RSVPRequiredEvent).rsvp === true;
}

export const safeParseDate = (date: string | Date): Date => {
  return date instanceof Date ? date : new Date(date);
};
