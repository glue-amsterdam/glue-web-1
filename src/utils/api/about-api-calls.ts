import { AN_HOUR_IN_S, BASE_URL } from "@/constants";
import {
  AboutCuratedClientType,
  CarouselClientType,
} from "@/schemas/baseSchema";
import {
  ClientCitizensSection,
  clientCitizensSectionSchema,
} from "@/schemas/citizenSchema";
import { InfoSection } from "@/schemas/infoSchema";
import {
  ParticipantsResponse,
  participantsResponseSchema,
} from "@/schemas/participantsSchema";
import { cache } from "react";

export async function fetchUserCarousel(): Promise<CarouselClientType> {
  const res = await fetch(`${BASE_URL}/about/carousel`, {
    next: {
      revalidate: 3600,
      tags: ["about-carousel"],
    },
  });

  if (!res.ok) {
    if (process.env.NEXT_PHASE === "build") {
      return {
        title: "About Us",
        description: "Loading...",
        slides: [
          {
            image_url: "/placeholder.svg?height=400&width=600",
            alt: "Loading carousel image",
          },
        ],
      };
    }
    throw new Error(`Failed to fetch carousel data: ${res.statusText}`);
  }

  return res.json();
}

export async function fetchAboutParticipants(): Promise<ParticipantsResponse> {
  try {
    const res = await fetch(`${BASE_URL}/api/about/participants`, {
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

export const fetchUserInfo = cache(async (): Promise<InfoSection> => {
  const res = await fetch(`${BASE_URL}/about/info`, {
    next: { revalidate: AN_HOUR_IN_S },
  });

  if (!res.ok) {
    console.error("Failed to fetch about info in client api call");
    throw new Error(`Failed to fetch about info in client api call`);
  }

  return res.json();
});

export const fetchUserCurated = cache(
  async (): Promise<AboutCuratedClientType> => {
    const res = await fetch(`${BASE_URL}/about/curated`, {
      next: { revalidate: AN_HOUR_IN_S },
    });

    if (!res.ok) {
      console.error("Failed to fetch about curated in client api call");
      throw new Error(`Failed to fetch about curated in client api call`);
    }

    return res.json();
  }
);

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
