import { BASE_URL } from "@/constants";
import { CarouselClientType } from "@/schemas/baseSchema";
import {
  ClientCitizensSection,
  clientCitizensSectionSchema,
} from "@/schemas/citizenSchema";
import {
  CuratedResponse,
  curatedResponseSchema,
} from "@/schemas/curatedSchema";
import {
  InfoSectionClient,
  infoSectionClientSchema,
} from "@/schemas/infoSchema";
import {
  ParticipantsResponse,
  participantsResponseSchema,
} from "@/schemas/participantsSchema";

export async function fetchUserCarousel(): Promise<CarouselClientType> {
  try {
    const res = await fetch(`${BASE_URL}/about/carousel`, {
      next: {
        revalidate: 3600,
        tags: ["about-carousel"],
      },
    });

    if (!res.ok) {
      if (res.status === 404 || process.env.NEXT_PHASE === "build") {
        console.warn("Using fallback data for carousel during build or 404");
        return CAROUSEL_FALLBACK_DATA;
      }
      throw new Error(`Failed to fetch carousel data: ${res.statusText}`);
    }

    const data = await res.json();

    if ("error" in data) {
      console.warn("API returned error, using fallback data");
      return CAROUSEL_FALLBACK_DATA;
    }

    return data;
  } catch (error) {
    console.error("Error fetching carousel data:", error);
    if (process.env.NEXT_PHASE === "build") {
      return CAROUSEL_FALLBACK_DATA;
    }
    throw error;
  }
}

export async function fetchAboutParticipants(): Promise<ParticipantsResponse> {
  try {
    const res = await fetch(`${BASE_URL}/about/participants`, {
      next: {
        revalidate: 3600,
        tags: ["participants"],
      },
    });

    if (!res.ok) {
      if (process.env.NEXT_PHASE === "build") {
        return PARTICIPANT_FALLBACK_DATA;
      }
      throw new Error(`Failed to fetch participants: ${res.statusText}`);
    }

    const data = await res.json();
    return participantsResponseSchema.parse(data);
  } catch (error) {
    if (process.env.NEXT_PHASE === "build") {
      return PARTICIPANT_FALLBACK_DATA;
    }
    throw error;
  }
}

export async function fetchInfoSection(): Promise<InfoSectionClient> {
  try {
    const res = await fetch(`${BASE_URL}/about/info`, {
      next: {
        revalidate: 3600, // 1 hour
        tags: ["info"],
      },
    });

    if (!res.ok) {
      if (res.status === 404 || process.env.NEXT_PHASE === "build") {
        console.warn("Using fallback data for info section");
        return INFO_FALLBACK_DATA;
      }
      throw new Error(`Failed to fetch info section data: ${res.statusText}`);
    }

    const data = await res.json();
    return infoSectionClientSchema.parse(data);
  } catch (error) {
    console.error("Error fetching info section data:", error);
    if (process.env.NEXT_PHASE === "build") {
      console.warn("Using fallback data for info section due to error");
      return INFO_FALLBACK_DATA;
    }
    throw error;
  }
}
export async function fetchUserCurated(): Promise<CuratedResponse> {
  try {
    const res = await fetch(`${BASE_URL}/about/curated`, {
      next: {
        revalidate: 3600,
        tags: ["about-curated"],
      },
    });

    if (!res.ok) {
      if (res.status === 404 || process.env.NEXT_PHASE === "build") {
        console.warn("Using fallback data for curated section");
        return CURATED_FALLBACK_DATA;
      }
      throw new Error(`Failed to fetch about curated data: ${res.statusText}`);
    }

    const data = await res.json();

    if ("error" in data) {
      if (process.env.NEXT_PHASE === "build") {
        return CURATED_FALLBACK_DATA;
      }
      throw new Error(data.error);
    }

    return curatedResponseSchema.parse(data);
  } catch (error) {
    console.error("Error fetching curated data:", error);
    if (process.env.NEXT_PHASE === "build") {
      return CURATED_FALLBACK_DATA;
    }
    throw error;
  }
}

export async function fetchCitizensOfHonor(): Promise<ClientCitizensSection> {
  try {
    const response = await fetch(`${BASE_URL}/about/citizens`, {
      next: {
        revalidate: 3600, // 1 hour
        tags: ["citizens"],
      },
    });

    if (!response.ok) {
      if (process.env.NEXT_PHASE === "build") {
        return FALLBACK_DATA;
      }
      throw new Error(`Failed to fetch citizens data: ${response.statusText}`);
    }

    const data = await response.json();
    return clientCitizensSectionSchema.parse(data);
  } catch (error) {
    if (process.env.NEXT_PHASE === "build") {
      return FALLBACK_DATA;
    }
    throw error;
  }
}

const FALLBACK_DATA: ClientCitizensSection = {
  title: "Citizens of Honor",
  description: "Loading...",
  citizensByYear: {
    "2023": Array(3).fill({
      id: "placeholder",
      name: "Loading...",
      image_url: "/placeholders/placeholder-1.jpg",
      alt: "Loading placeholder",
      description: "Loading...",
      year: "2023",
    }),
  },
};

const PARTICIPANT_FALLBACK_DATA: ParticipantsResponse = {
  headerData: {
    title: "Our Participants",
    description: "Loading participant information...",
  },
  participants: Array(6).fill({
    userId: "placeholder",
    slug: "loading",
    userName: "Loading...",
    image: {
      image_url: "/placeholders/placeholder.jpg",
      alt: "Loading participant",
    },
  }),
};

const INFO_FALLBACK_DATA: InfoSectionClient = {
  title: "Information about GLUE",
  description:
    "Discover the GLUE project, the GLUE Foundation, and the GLUE International initiative.",
  infoItems: [
    {
      id: "mission-statement",
      title: "Mission Statement",
      description:
        "<p>GLUE aspires to diversity and inclusivity, with a focus on sustainability and wellbeing.</p>",
      image: {
        image_url: "/placeholder.svg?height=400&width=600",
        alt: "GLUE Mission Statement",
      },
    },
    {
      id: "meet-the-team",
      title: "Meet the Team",
      description:
        "<p>Our dedicated team works tirelessly to connect and promote the Amsterdam design community.</p>",
      image: {
        image_url: "/placeholder.svg?height=400&width=600",
        alt: "GLUE Team",
      },
    },
    {
      id: "glue-foundation",
      title: "GLUE Foundation",
      description:
        "<p>The GLUE Foundation is responsible for cultural programs and initiatives within the GLUE community.</p>",
      image: {
        image_url: "/placeholder.svg?height=400&width=600",
        alt: "GLUE Foundation",
      },
    },
  ],
};

const CAROUSEL_FALLBACK_DATA: CarouselClientType = {
  title: "Welcome to GLUE",
  description: "Discover Amsterdam's vibrant design community",
  slides: [
    {
      image_url: "/placeholder.jpg",
      alt: "GLUE Amsterdam Design Community",
    },
    {
      image_url: "/placeholder.jpg",
      alt: "GLUE Events and Activities",
    },
    {
      image_url: "/placeholder.jpg",
      alt: "GLUE Community Members",
    },
  ],
};

const CURATED_FALLBACK_DATA: CuratedResponse = {
  headerData: {
    title: "GLUE STICKY MEMBER",
    description:
      "Discover the GLUE STICKY MEMBER, a curated group of designers, architects, and creatives who have made a significant impact on the industry.",
  },
  curatedParticipants: {
    "2024": [
      {
        slug: "placeholder-1",
        userName: "Loading Member 1",
        year: 2024,
      },
      {
        slug: "placeholder-2",
        userName: "Loading Member 2",
        year: 2024,
      },
    ],
  },
};
