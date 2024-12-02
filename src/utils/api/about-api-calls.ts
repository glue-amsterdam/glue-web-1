import { AN_HOUR_IN_S, BASE_URL } from "@/constants";
import {
  AboutCuratedClientType,
  AboutParticipantsClientType,
  CarouselClientType,
} from "@/schemas/baseSchema";
import { CitizensSection } from "@/schemas/citizenSchema";
import { InfoSection } from "@/schemas/infoSchema";
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

export const fetchUserAboutParticipants = cache(
  async (): Promise<AboutParticipantsClientType> => {
    const res = await fetch(`${BASE_URL}/about/participants`, {
      next: { revalidate: AN_HOUR_IN_S },
    });

    if (!res.ok) {
      console.error("Failed to fetch about participants in client api call");
      throw new Error(`Failed to fetch about participants in client api call`);
    }

    return res.json();
  }
);

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

export async function fetchCitizensOfHonor(): Promise<CitizensSection> {
  const response = await fetch(`${BASE_URL}/about/citizens`);
  if (!response.ok) {
    throw new Error("Failed to fetch citizens of honor data");
  }
  return response.json();
}
