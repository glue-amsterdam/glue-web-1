import { Event } from "@/utils/event-types";

export const mockEvents: Event[] = [
  {
    id: "1",
    name: "Modern Art Exhibition",
    thumbnail: "/placeholders/placeholder-1.jpg",
    creator: {
      id: "1",
      name: "Gallery X",
      avatar: "/placeholders/user-placeholder-1.jpg",
    },
    contributors: [
      {
        id: "2",
        name: "Anna Clark",
        avatar: "/placeholders/user-placeholder-2.jpg",
      },
      {
        id: "3",
        name: "Marco Lopez",
        avatar: "/placeholders/user-placeholder-3.jpg",
      },
    ],
    date: "2024-06-15",
    startTime: "10:00",
    endTime: "18:00",
    type: "Exhibition",
    description: "A showcase of contemporary works from international artists.",
  },
  {
    id: "2",
    name: "Urban Design Workshop",
    thumbnail: "/placeholders/placeholder-2.jpg",
    creator: {
      id: "2",
      name: "City Design Lab",
      avatar: "/placeholders/user-placeholder-2.jpg",
    },
    contributors: [
      {
        id: "4",
        name: "Ethan Harper",
        avatar: "/placeholders/user-placeholder-1.jpg",
      },
      {
        id: "5",
        name: "Sophia Turner",
        avatar: "/placeholders/user-placeholder-4.jpg",
      },
    ],
    date: "2024-07-10",
    startTime: "09:00",
    endTime: "17:00",
    type: "Workshop",
    description:
      "Interactive workshop on sustainable urban planning and design.",
  },
  {
    id: "3",
    name: "Architectural Tour: Historic Buildings",
    thumbnail: "/placeholders/placeholder-3.jpg",
    creator: {
      id: "3",
      name: "Heritage Tours",
      avatar: "/placeholders/user-placeholder-3.jpg",
    },
    contributors: [
      {
        id: "6",
        name: "Lucas Shaw",
        avatar: "/placeholders/user-placeholder-4.jpg",
      },
      {
        id: "7",
        name: "Mia Williams",
        avatar: "/placeholders/user-placeholder-1.jpg",
      },
    ],
    date: "2024-08-05",
    startTime: "14:00",
    endTime: "17:00",
    type: "Guided Tour",
    description:
      "A guided tour exploring historic architectural landmarks in the city.",
  },
  {
    id: "4",
    name: "Design Principles Lecture",
    thumbnail: "/placeholders/placeholder-1.jpg",
    creator: {
      id: "4",
      name: "Design Academy",
      avatar: "/placeholders/user-placeholder-4.jpg",
    },
    contributors: [
      {
        id: "8",
        name: "Olivia Brown",
        avatar: "/placeholders/user-placeholder-2.jpg",
      },
      {
        id: "9",
        name: "James Carter",
        avatar: "/placeholders/user-placeholder-3.jpg",
      },
    ],
    date: "2024-09-15",
    startTime: "11:00",
    endTime: "13:00",
    type: "Lecture",
    description:
      "A lecture on the core principles of design and their real-world applications.",
  },
  {
    id: "5",
    name: "Sculpture Workshop: Materials & Techniques",
    thumbnail: "/placeholders/placeholder-2.jpg",
    creator: {
      id: "5",
      name: "Artisans Collective",
      avatar: "/placeholders/user-placeholder-3.jpg",
    },
    contributors: [
      {
        id: "10",
        name: "Emily Jones",
        avatar: "/placeholders/user-placeholder-1.jpg",
      },
      {
        id: "11",
        name: "Daniel Evans",
        avatar: "/placeholders/user-placeholder-2.jpg",
      },
    ],
    date: "2024-10-20",
    startTime: "09:00",
    endTime: "16:00",
    type: "Workshop",
    description:
      "Learn hands-on sculpting techniques using different materials.",
  },
  {
    id: "6",
    name: "Art & Wine Social",
    thumbnail: "/placeholders/placeholder-3.jpg",
    creator: {
      id: "6",
      name: "Creative Space",
      avatar: "/placeholders/user-placeholder-2.jpg",
    },
    contributors: [
      {
        id: "12",
        name: "Sarah Martin",
        avatar: "/placeholders/user-placeholder-3.jpg",
      },
      {
        id: "13",
        name: "Robert King",
        avatar: "/placeholders/user-placeholder-4.jpg",
      },
    ],
    date: "2024-11-10",
    startTime: "19:00",
    endTime: "22:00",
    type: "Drink",
    description:
      "An evening of art appreciation with wine and creative discussions.",
  },
  {
    id: "7",
    name: "Interior Design Trends Lecture",
    thumbnail: "/placeholders/placeholder-1.jpg",
    creator: {
      id: "7",
      name: "Design Insights",
      avatar: "/placeholders/user-placeholder-4.jpg",
    },
    contributors: [
      {
        id: "14",
        name: "Isabella Reed",
        avatar: "/placeholders/user-placeholder-1.jpg",
      },
      {
        id: "15",
        name: "Tom Wilson",
        avatar: "/placeholders/user-placeholder-2.jpg",
      },
    ],
    date: "2024-12-01",
    startTime: "10:00",
    endTime: "12:00",
    type: "Lecture",
    description: "A deep dive into the latest interior design trends for 2025.",
  },
  {
    id: "8",
    name: "Sustainable Architecture Workshop",
    thumbnail: "/placeholders/placeholder-2.jpg",
    creator: {
      id: "8",
      name: "Eco Architects",
      avatar: "/placeholders/user-placeholder-3.jpg",
    },
    contributors: [
      {
        id: "16",
        name: "Zoe White",
        avatar: "/placeholders/user-placeholder-4.jpg",
      },
      {
        id: "17",
        name: "Michael Bailey",
        avatar: "/placeholders/user-placeholder-1.jpg",
      },
    ],
    date: "2024-12-15",
    startTime: "09:00",
    endTime: "17:00",
    type: "Workshop",
    description:
      "Exploring sustainable building practices and eco-friendly materials.",
  },
  {
    id: "9",
    name: "Photography Exhibition: Urban Landscapes",
    thumbnail: "/placeholders/placeholder-3.jpg",
    creator: {
      id: "9",
      name: "Photo World",
      avatar: "/placeholders/user-placeholder-1.jpg",
    },
    contributors: [
      {
        id: "18",
        name: "Jessica Brown",
        avatar: "/placeholders/user-placeholder-2.jpg",
      },
      {
        id: "19",
        name: "William Garcia",
        avatar: "/placeholders/user-placeholder-3.jpg",
      },
    ],
    date: "2025-01-05",
    startTime: "10:00",
    endTime: "18:00",
    type: "Exhibition",
    description:
      "A photography exhibition showcasing urban landscapes from around the world.",
  },
  {
    id: "10",
    name: "Art History Guided Tour",
    thumbnail: "/placeholders/placeholder-1.jpg",
    creator: {
      id: "10",
      name: "Museum of Art",
      avatar: "/placeholders/user-placeholder-4.jpg",
    },
    contributors: [
      {
        id: "20",
        name: "Nina Lee",
        avatar: "/placeholders/user-placeholder-1.jpg",
      },
      {
        id: "21",
        name: "Harry Miller",
        avatar: "/placeholders/user-placeholder-3.jpg",
      },
    ],
    date: "2025-02-20",
    startTime: "13:00",
    endTime: "16:00",
    type: "Guided Tour",
    description:
      "A guided tour through centuries of art history and iconic masterpieces.",
  },
  {
    id: "11",
    name: "Contemporary Sculpture Exhibition",
    thumbnail: "/placeholders/placeholder-2.jpg",
    creator: {
      id: "11",
      name: "Sculpture Now",
      avatar: "/placeholders/user-placeholder-3.jpg",
    },
    contributors: [
      {
        id: "22",
        name: "Chloe Bennett",
        avatar: "/placeholders/user-placeholder-2.jpg",
      },
      {
        id: "23",
        name: "Ryan Scott",
        avatar: "/placeholders/user-placeholder-4.jpg",
      },
    ],
    date: "2025-03-10",
    startTime: "11:00",
    endTime: "17:00",
    type: "Exhibition",
    description:
      "An exhibition of cutting-edge contemporary sculpture from emerging artists.",
  },
  {
    id: "12",
    name: "Digital Art Workshop: New Techniques",
    thumbnail: "/placeholders/placeholder-3.jpg",
    creator: {
      id: "12",
      name: "Digital Creatives",
      avatar: "/placeholders/user-placeholder-1.jpg",
    },
    contributors: [
      {
        id: "24",
        name: "Ella Gray",
        avatar: "/placeholders/user-placeholder-4.jpg",
      },
      {
        id: "25",
        name: "Leo Parker",
        avatar: "/placeholders/user-placeholder-2.jpg",
      },
    ],
    date: "2025-04-01",
    startTime: "09:00",
    endTime: "15:00",
    type: "Workshop",
    description:
      "A hands-on workshop exploring new techniques in digital art creation.",
  },
  {
    id: "13",
    name: "Fashion Design Trends Lecture",
    thumbnail: "/placeholders/placeholder-1.jpg",
    creator: {
      id: "13",
      name: "Fashion Forward",
      avatar: "/placeholders/user-placeholder-4.jpg",
    },
    contributors: [
      {
        id: "26",
        name: "Lily Adams",
        avatar: "/placeholders/user-placeholder-3.jpg",
      },
      {
        id: "27",
        name: "Jack Cooper",
        avatar: "/placeholders/user-placeholder-4.jpg",
      },
    ],
    date: "2025-04-20",
    startTime: "11:00",
    endTime: "13:00",
    type: "Lecture",
    description:
      "Exploring the latest trends in fashion design for the upcoming season.",
  },
  {
    id: "14",
    name: "Abstract Painting Workshop",
    thumbnail: "/placeholders/placeholder-2.jpg",
    creator: {
      id: "14",
      name: "Art Studio",
      avatar: "/placeholders/user-placeholder-3.jpg",
    },
    contributors: [
      {
        id: "28",
        name: "Sophie Brooks",
        avatar: "/placeholders/user-placeholder-1.jpg",
      },
      {
        id: "29",
        name: "Chris Lee",
        avatar: "/placeholders/user-placeholder-2.jpg",
      },
    ],
    date: "2025-05-05",
    startTime: "10:00",
    endTime: "16:00",
    type: "Workshop",
    description: "Learn techniques for creating stunning abstract paintings.",
  },
  {
    id: "15",
    name: "Designers’ Social Evening",
    thumbnail: "/placeholders/placeholder-3.jpg",
    creator: {
      id: "15",
      name: "Design Circle",
      avatar: "/placeholders/user-placeholder-4.jpg",
    },
    contributors: [
      {
        id: "30",
        name: "Max Roberts",
        avatar: "/placeholders/user-placeholder-3.jpg",
      },
      {
        id: "31",
        name: "Grace Foster",
        avatar: "/placeholders/user-placeholder-1.jpg",
      },
    ],
    date: "2025-05-20",
    startTime: "18:00",
    endTime: "21:00",
    type: "Drink",
    description:
      "A casual social event for designers to network and share ideas.",
  },
];
