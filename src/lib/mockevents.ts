import { generateTimestamps } from "@/mockConstants";
import { Event } from "@/utils/event-types";

export const mockEvents: Event[] = [
  {
    eventId: "A1234567890",
    name: "Modern Art Exhibition",
    thumbnail: {
      id: "modern-art-exhibition-thumbnail",
      imageUrl: `/placeholders/placeholder-1.jpg`,
      alt: "GLUE modern-art-exhibition-thumbnail",
      imageName: "modern-art-exhibition-thumbnail",
      ...generateTimestamps(),
    },
    organizer: {
      id: "5065465555",
      slug: "ay-illuminate",
      name: "AY ILLUMINATE",
    },
    rsvp: true,
    rsvpMessage: "Please RSVP",
    rsvpLink: "https://rsvplink.com.ar",
    coOrganizers: [
      {
        id: "5065455115",
        name: "SELETTI",
        slug: "seletti",
      },
      {
        id: "50654659",
        slug: "frama",
        name: "FRAMA",
      },
    ],
    date: "2024-06-15",
    startTime: "10:00",
    endTime: "18:00",
    type: "Other",
    description: "A showcase of contemporary works from international artists.",
    ...generateTimestamps(),
  },
  {
    eventId: "B9876543210",
    name: "Urban Design Workshop",
    thumbnail: {
      id: "urban-design-workshop-thumbnail",
      imageUrl: `/placeholders/placeholder-2.jpg`,
      alt: "GLUE urban-design-workshop-thumbnail",
      imageName: "urban-design-workshop-thumbnail",
      ...generateTimestamps(),
    },
    organizer: {
      id: "5065465555",
      slug: "ay-illuminate",
      name: "AY ILLUMINATE",
    },
    coOrganizers: [
      {
        id: "5065455115",
        name: "SELETTI",
        slug: "seletti",
      },
      {
        id: "50654659",
        slug: "frama",
        name: "FRAMA",
      },
    ],
    date: "2024-07-10",
    startTime: "09:00",
    endTime: "17:00",
    type: "Workshop",
    description:
      "Interactive workshop on sustainable urban planning and design.",
    ...generateTimestamps(),
  },
  {
    eventId: "C1357924680",
    name: "Architectural Tour: Historic Buildings",
    thumbnail: {
      id: "architectural-tour-thumbnail",
      imageUrl: `/placeholders/placeholder-3.jpg`,
      alt: "GLUE architectural-tour-thumbnail",
      imageName: "architectural-tour-thumbnail",
      ...generateTimestamps(),
    },
    organizer: {
      id: "5065465555",
      slug: "ay-illuminate",
      name: "AY ILLUMINATE",
    },
    coOrganizers: [
      {
        id: "5065455115",
        name: "SELETTI",
        slug: "seletti",
      },
      {
        id: "50654659",
        slug: "frama",
        name: "FRAMA",
      },
    ],
    date: "2024-08-05",
    startTime: "14:00",
    endTime: "17:00",
    type: "Guided Tour",
    description:
      "A guided tour exploring historic architectural landmarks in the city.",
    ...generateTimestamps(),
  },
  {
    eventId: "D2468013579",
    name: "Design Principles Lecture",
    thumbnail: {
      id: "design-principles-lecture-thumbnail",
      imageUrl: `/placeholders/placeholder-1.jpg`,
      alt: "GLUE design-principles-lecture-thumbnail",
      imageName: "design-principles-lecture-thumbnail",
      ...generateTimestamps(),
    },
    organizer: {
      id: "5065465555",
      slug: "ay-illuminate",
      name: "AY ILLUMINATE",
    },
    coOrganizers: [
      {
        id: "5065455115",
        name: "SELETTI",
        slug: "seletti",
      },
      {
        id: "50654659",
        slug: "frama",
        name: "FRAMA",
      },
    ],
    date: "2024-09-15",
    startTime: "11:00",
    endTime: "13:00",
    type: "Lecture",
    description:
      "A lecture on the core principles of design and their real-world applications.",
    ...generateTimestamps(),
  },
  {
    eventId: "E3692581470",
    name: "Sculpture Workshop: Materials & Techniques",
    thumbnail: {
      id: "sculpture-workshop-thumbnail",
      imageUrl: `/placeholders/placeholder-2.jpg`,
      alt: "GLUE sculpture-workshop-thumbnail",
      imageName: "sculpture-workshop-thumbnail",
      ...generateTimestamps(),
    },
    organizer: {
      id: "5065465555",
      slug: "ay-illuminate",
      name: "AY ILLUMINATE",
    },
    coOrganizers: [
      {
        id: "5065455115",
        name: "SELETTI",
        slug: "seletti",
      },
      {
        id: "50654659",
        slug: "frama",
        name: "FRAMA",
      },
    ],
    date: "2024-10-20",
    startTime: "09:00",
    endTime: "16:00",
    type: "Workshop",
    description:
      "Learn hands-on sculpting techniques using different materials.",
    ...generateTimestamps(),
  },
  {
    eventId: "F1597534862",
    name: "Art & Wine Social",
    thumbnail: {
      id: "art-wine-social-thumbnail",
      imageUrl: `/placeholders/placeholder-3.jpg`,
      alt: "GLUE art-wine-social-thumbnail",
      imageName: "art-wine-social-thumbnail",
      ...generateTimestamps(),
    },
    organizer: {
      id: "5065465555",
      slug: "ay-illuminate",
      name: "AY ILLUMINATE",
    },
    coOrganizers: [
      {
        id: "5065455115",
        name: "SELETTI",
        slug: "seletti",
      },
      {
        id: "50654659",
        slug: "frama",
        name: "FRAMA",
      },
    ],
    date: "2024-11-10",
    startTime: "19:00",
    endTime: "22:00",
    type: "Drink",
    description:
      "An evening of art appreciation with wine and creative discussions.",
    ...generateTimestamps(),
  },
  {
    eventId: "G7531594862",
    name: "Interior Design Trends Lecture",
    thumbnail: {
      id: "interior-design-trends-thumbnail",
      imageUrl: `/placeholders/placeholder-1.jpg`,
      alt: "GLUE interior-design-trends-thumbnail",
      imageName: "interior-design-trends-thumbnail",
      ...generateTimestamps(),
    },
    organizer: {
      id: "5065465555",
      slug: "ay-illuminate",
      name: "AY ILLUMINATE",
    },
    coOrganizers: [
      {
        id: "5065455115",
        name: "SELETTI",
        slug: "seletti",
      },
      {
        id: "50654659",
        slug: "frama",
        name: "FRAMA",
      },
    ],
    date: "2024-12-01",
    startTime: "10:00",
    endTime: "12:00",
    type: "Lecture",
    description: "A deep dive into the latest interior design trends for 2025.",
    ...generateTimestamps(),
  },
  {
    eventId: "H9513578642",
    name: "Sustainable Architecture Workshop",
    thumbnail: {
      id: "sustainable-architecture-thumbnail",
      imageUrl: `/placeholders/placeholder-2.jpg`,
      alt: "GLUE sustainable-architecture-thumbnail",
      imageName: "sustainable-architecture-thumbnail",
      ...generateTimestamps(),
    },
    organizer: {
      id: "5065465555",
      slug: "ay-illuminate",
      name: "AY ILLUMINATE",
    },
    coOrganizers: [
      {
        id: "5065455115",
        name: "SELETTI",
        slug: "seletti",
      },
      {
        id: "50654659",
        slug: "frama",
        name: "FRAMA",
      },
    ],
    date: "2024-12-15",
    startTime: "09:00",
    endTime: "17:00",
    type: "Workshop",
    description:
      "Exploring sustainable building practices and eco-friendly materials.",
    ...generateTimestamps(),
  },
  {
    eventId: "I2469135780",
    name: "Photography Exhibition: Urban Landscapes",
    thumbnail: {
      id: "photography-exhibition-thumbnail",
      imageUrl: `/placeholders/placeholder-3.jpg`,
      alt: "GLUE photography-exhibition-thumbnail",
      imageName: "photography-exhibition-thumbnail",
      ...generateTimestamps(),
    },
    organizer: {
      id: "5065465555",
      slug: "ay-illuminate",
      name: "AY ILLUMINATE",
    },
    coOrganizers: [
      {
        id: "5065455115",
        name: "SELETTI",
        slug: "seletti",
      },
      {
        id: "50654659",
        slug: "frama",
        name: "FRAMA",
      },
    ],
    date: "2025-01-05",
    startTime: "10:00",
    endTime: "18:00",
    type: "Guided Tour",
    description:
      "A photography exhibition showcasing urban landscapes from around the world.",
    ...generateTimestamps(),
  },
  {
    eventId: "J3571594680",
    name: "Art History Guided Tour",
    thumbnail: {
      id: "art-history-guided-tour-thumbnail",
      imageUrl: `/placeholders/placeholder-1.jpg`,
      alt: "GLUE art-history-guided-tour-thumbnail",
      imageName: "art-history-guided-tour-thumbnail",
      ...generateTimestamps(),
    },
    organizer: {
      id: "5065465555",
      slug: "ay-illuminate",
      name: "AY ILLUMINATE",
    },
    coOrganizers: [
      {
        id: "5065455115",
        name: "SELETTI",
        slug: "seletti",
      },
      {
        id: "50654659",
        slug: "frama",
        name: "FRAMA",
      },
    ],
    date: "2025-02-20",
    startTime: "13:00",
    endTime: "16:00",
    type: "Guided Tour",
    description:
      "A guided tour through centuries of art history and iconic masterpieces.",
    ...generateTimestamps(),
  },
  {
    eventId: "K2583691470",
    name: "Contemporary Sculpture Exhibition",
    thumbnail: {
      id: "contemporary-sculpture-thumbnail",
      imageUrl: `/placeholders/placeholder-2.jpg`,
      alt: "GLUE contemporary-sculpture-thumbnail",
      imageName: "contemporary-sculpture-thumbnail",
      ...generateTimestamps(),
    },
    organizer: {
      id: "5065465555",
      slug: "ay-illuminate",
      name: "AY ILLUMINATE",
    },
    coOrganizers: [
      {
        id: "5065455115",
        name: "SELETTI",
        slug: "seletti",
      },
      {
        id: "50654659",
        slug: "frama",
        name: "FRAMA",
      },
    ],
    date: "2025-03-10",
    startTime: "11:00",
    endTime: "17:00",
    type: "Lecture",
    description:
      "An exhibition of cutting-edge contemporary sculpture from emerging artists.",
    ...generateTimestamps(),
  },
  {
    eventId: "L1597534863",
    name: "Digital Art Workshop: New Techniques",
    thumbnail: {
      id: "digital-art-workshop-thumbnail",
      imageUrl: `/placeholders/placeholder-3.jpg`,
      alt: "GLUE digital-art-workshop-thumbnail",
      imageName: "digital-art-workshop-thumbnail",
      ...generateTimestamps(),
    },
    organizer: {
      id: "5065465555",
      slug: "ay-illuminate",
      name: "AY ILLUMINATE",
    },
    coOrganizers: [
      {
        id: "5065455115",
        name: "SELETTI",
        slug: "seletti",
      },
      {
        id: "50654659",
        slug: "frama",
        name: "FRAMA",
      },
    ],
    date: "2025-04-01",
    startTime: "09:00",
    endTime: "15:00",
    type: "Workshop",
    description:
      "A hands-on workshop exploring new techniques in digital art creation.",
    ...generateTimestamps(),
  },
  {
    eventId: "M7531594864",
    name: "Fashion Design Trends Lecture",
    thumbnail: {
      id: "fashion-design-trends-thumbnail",
      imageUrl: `/placeholders/placeholder-1.jpg`,
      alt: "GLUE fashion-design-trends-thumbnail",
      imageName: "fashion-design-trends-thumbnail",
      ...generateTimestamps(),
    },
    organizer: {
      id: "5065465555",
      slug: "ay-illuminate",
      name: "AY ILLUMINATE",
    },
    coOrganizers: [
      {
        id: "5065455115",
        name: "SELETTI",
        slug: "seletti",
      },
      {
        id: "50654659",
        slug: "frama",
        name: "FRAMA",
      },
    ],
    date: "2025-04-20",
    startTime: "11:00",
    endTime: "13:00",
    type: "Lecture",
    description:
      "Exploring the latest trends in fashion design for the upcoming season.",
    ...generateTimestamps(),
  },
  {
    eventId: "N2583691471",
    name: "Abstract Painting Workshop",
    thumbnail: {
      id: "abstract-painting-workshop-thumbnail",
      imageUrl: `/placeholders/placeholder-2.jpg`,
      alt: "GLUE abstract-painting-workshop-thumbnail",
      imageName: "abstract-painting-workshop-thumbnail",
      ...generateTimestamps(),
    },
    organizer: {
      id: "5065465555",
      slug: "ay-illuminate",
      name: "AY ILLUMINATE",
    },
    coOrganizers: [
      {
        id: "5065455115",
        name: "SELETTI",
        slug: "seletti",
      },
      {
        id: "50654659",
        slug: "frama",
        name: "FRAMA",
      },
    ],
    date: "2025-05-05",
    startTime: "10:00",
    endTime: "16:00",
    type: "Workshop",
    description: "Learn techniques for creating stunning abstract paintings.",
    ...generateTimestamps(),
  },
  {
    eventId: "O3692581472",
    name: "Designers’ Social Evening",
    thumbnail: {
      id: "designers-social-evening-thumbnail",
      imageUrl: `/placeholders/placeholder-3.jpg`,
      alt: "GLUE designers-social-evening-thumbnail",
      imageName: "designers-social-evening-thumbnail",
      ...generateTimestamps(),
    },
    organizer: {
      id: "5065465555",
      slug: "ay-illuminate",
      name: "AY ILLUMINATE",
    },
    coOrganizers: [
      {
        id: "5065455115",
        name: "SELETTI",
        slug: "seletti",
      },
      {
        id: "50654659",
        slug: "frama",
        name: "FRAMA",
      },
    ],
    date: "2025-05-20",
    startTime: "18:00",
    endTime: "21:00",
    type: "Drink",
    description:
      "A casual social event for designers to network and share ideas.",
    ...generateTimestamps(),
  },
];
