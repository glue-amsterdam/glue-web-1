import { Event, EventType } from "@/schemas/eventSchemas";
import { EventDay } from "@/utils/menu-types";

const eventsDays: EventDay[] = [
  {
    dayId: "day-1",
    date: "2025-01-16T00:00:00Z",
    label: "Thursday",
  },
  {
    dayId: "day-2",
    date: "2025-01-17T00:00:00Z",
    label: "Friday",
  },
  {
    dayId: "day-3",
    date: "2025-01-18T00:00:00Z",
    label: "Saturday",
  },
  {
    dayId: "day-4",
    date: "2025-01-19T00:00:00Z",
    label: "Sunday",
  },
];

const getRandomDay = () =>
  eventsDays[Math.floor(Math.random() * eventsDays.length)];

const generateTimestamps = () => {
  const createdAt = new Date(
    Date.now() - Math.floor(Math.random() * 10000000000)
  );
  const updatedAt = new Date(
    createdAt.getTime() + Math.floor(Math.random() * 1000000000)
  );
  return { createdAt, updatedAt };
};

const userIds = [
  "50654654",
  "50654654654",
  "50654655",
  "5065465985",
  "50654656",
  "50654657",
  "50654658",
];

const getRandomUserId = () =>
  userIds[Math.floor(Math.random() * userIds.length)];

export const mockEvents: Event[] = [
  {
    eventId: "A1234567890",
    name: "Modern Art Exhibition",
    thumbnail: {
      id: "modern-art-exhibition-thumbnail",
      image_url: `/placeholders/placeholder-1.jpg`,
      alt: "GLUE modern-art-exhibition-thumbnail",
      image_name: "modern-art-exhibition-thumbnail",
      ...generateTimestamps(),
    },
    organizer: {
      userId: getRandomUserId(),
    },
    rsvp: true,
    rsvpMessage: "Please RSVP for the Modern Art Exhibition",
    rsvpLink: "https://rsvp.modernartexhibition.com",
    coOrganizers: [
      {
        userId: getRandomUserId(),
      },
      {
        userId: getRandomUserId(),
      },
    ],
    date: getRandomDay(),
    startTime: "10:00",
    endTime: "18:00",
    type: "Other" as EventType,
    description: "A showcase of contemporary works from international artists.",
    ...generateTimestamps(),
  },
  {
    eventId: "B9876543210",
    name: "Urban Design Workshop",
    thumbnail: {
      id: "urban-design-workshop-thumbnail",
      image_url: `/placeholders/placeholder-2.jpg`,
      alt: "GLUE urban-design-workshop-thumbnail",
      image_name: "urban-design-workshop-thumbnail",
      ...generateTimestamps(),
    },
    organizer: {
      userId: getRandomUserId(),
    },
    coOrganizers: [
      {
        userId: getRandomUserId(),
      },
    ],
    date: getRandomDay(),
    startTime: "09:00",
    endTime: "17:00",
    type: "Workshop" as EventType,
    description:
      "Interactive workshop on sustainable urban planning and design.",
    ...generateTimestamps(),
  },
  {
    eventId: "C1357924680",
    name: "Architectural Tour: Historic Buildings",
    thumbnail: {
      id: "architectural-tour-thumbnail",
      image_url: `/placeholders/placeholder-3.jpg`,
      alt: "GLUE architectural-tour-thumbnail",
      image_name: "architectural-tour-thumbnail",
      ...generateTimestamps(),
    },
    organizer: {
      userId: getRandomUserId(),
    },
    coOrganizers: [],
    date: getRandomDay(),
    startTime: "14:00",
    endTime: "17:00",
    type: "Guided Tour" as EventType,
    description:
      "A guided tour exploring historic architectural landmarks in the city.",
    ...generateTimestamps(),
  },
  {
    eventId: "D2468013579",
    name: "Design Principles Lecture",
    thumbnail: {
      id: "design-principles-lecture-thumbnail",
      image_url: `/placeholders/placeholder-1.jpg`,
      alt: "GLUE design-principles-lecture-thumbnail",
      image_name: "design-principles-lecture-thumbnail",
      ...generateTimestamps(),
    },
    organizer: {
      userId: getRandomUserId(),
    },
    rsvp: true,
    rsvpMessage: "RSVP required for the Design Principles Lecture",
    rsvpLink: "https://rsvp.designprinciples.com",
    coOrganizers: [
      {
        userId: getRandomUserId(),
      },
    ],
    date: getRandomDay(),
    startTime: "11:00",
    endTime: "13:00",
    type: "Lecture" as EventType,
    description:
      "A lecture on the core principles of design and their real-world applications.",
    ...generateTimestamps(),
  },
  {
    eventId: "E3692581470",
    name: "Sculpture Workshop: Materials & Techniques",
    thumbnail: {
      id: "sculpture-workshop-thumbnail",
      image_url: `/placeholders/placeholder-2.jpg`,
      alt: "GLUE sculpture-workshop-thumbnail",
      image_name: "sculpture-workshop-thumbnail",
      ...generateTimestamps(),
    },
    organizer: {
      userId: getRandomUserId(),
    },
    coOrganizers: [],
    date: getRandomDay(),
    startTime: "09:00",
    endTime: "16:00",
    type: "Workshop" as EventType,
    description:
      "Learn hands-on sculpting techniques using different materials.",
    ...generateTimestamps(),
  },
  {
    eventId: "F1597534862",
    name: "Art & Wine Social",
    thumbnail: {
      id: "art-wine-social-thumbnail",
      image_url: `/placeholders/placeholder-3.jpg`,
      alt: "GLUE art-wine-social-thumbnail",
      image_name: "art-wine-social-thumbnail",
      ...generateTimestamps(),
    },
    organizer: {
      userId: getRandomUserId(),
    },
    rsvp: true,
    rsvpMessage: "Please RSVP for the Art & Wine Social",
    rsvpLink: "https://rsvp.artandwine.com",
    coOrganizers: [
      {
        userId: getRandomUserId(),
      },
    ],
    date: getRandomDay(),
    startTime: "19:00",
    endTime: "22:00",
    type: "Drink" as EventType,
    description:
      "An evening of art appreciation with wine and creative discussions.",
    ...generateTimestamps(),
  },
  {
    eventId: "G7531594862",
    name: "Interior Design Trends Lecture",
    thumbnail: {
      id: "interior-design-trends-thumbnail",
      image_url: `/placeholders/placeholder-1.jpg`,
      alt: "GLUE interior-design-trends-thumbnail",
      image_name: "interior-design-trends-thumbnail",
      ...generateTimestamps(),
    },
    organizer: {
      userId: getRandomUserId(),
    },
    coOrganizers: [],
    date: getRandomDay(),
    startTime: "10:00",
    endTime: "12:00",
    type: "Lecture" as EventType,
    description: "A deep dive into the latest interior design trends for 2025.",
    ...generateTimestamps(),
  },
  {
    eventId: "H9513578642",
    name: "Sustainable Architecture Workshop",
    thumbnail: {
      id: "sustainable-architecture-thumbnail",
      image_url: `/placeholders/placeholder-2.jpg`,
      alt: "GLUE sustainable-architecture-thumbnail",
      image_name: "sustainable-architecture-thumbnail",
      ...generateTimestamps(),
    },
    organizer: {
      userId: getRandomUserId(),
    },
    rsvp: true,
    rsvpMessage: "RSVP for the Sustainable Architecture Workshop",
    rsvpLink: "https://rsvp.sustainablearchitecture.com",
    coOrganizers: [
      {
        userId: getRandomUserId(),
      },
    ],
    date: getRandomDay(),
    startTime: "09:00",
    endTime: "17:00",
    type: "Workshop" as EventType,
    description:
      "Exploring sustainable building practices and eco-friendly materials.",
    ...generateTimestamps(),
  },
  {
    eventId: "I2469135780",
    name: "Photography Exhibition: Urban Landscapes",
    thumbnail: {
      id: "photography-exhibition-thumbnail",
      image_url: `/placeholders/placeholder-3.jpg`,
      alt: "GLUE photography-exhibition-thumbnail",
      image_name: "photography-exhibition-thumbnail",
      ...generateTimestamps(),
    },
    organizer: {
      userId: getRandomUserId(),
    },
    coOrganizers: [],
    date: getRandomDay(),
    startTime: "10:00",
    endTime: "18:00",
    type: "Exhibition" as EventType,
    description:
      "Showcasing urban landscape photography from local and international photographers.",
    ...generateTimestamps(),
  },
  {
    eventId: "J3571594680",
    name: "Art History Guided Tour",
    thumbnail: {
      id: "art-history-tour-thumbnail",
      image_url: `/placeholders/placeholder-1.jpg`,
      alt: "GLUE art-history-tour-thumbnail",
      image_name: "art-history-tour-thumbnail",
      ...generateTimestamps(),
    },
    organizer: {
      userId: getRandomUserId(),
    },
    coOrganizers: [
      {
        userId: getRandomUserId(),
      },
    ],
    date: getRandomDay(),
    startTime: "13:00",
    endTime: "15:00",
    type: "Guided Tour" as EventType,
    description:
      "Explore the history of art through a guided tour of significant artworks.",
    ...generateTimestamps(),
  },
];
