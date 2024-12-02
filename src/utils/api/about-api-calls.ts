import { BASE_URL } from "@/constants";
import {
  AboutCuratedClientType,
  AboutParticipantsClientType,
  CarouselClientType,
} from "@/schemas/baseSchema";
import { CitizensSection } from "@/schemas/citizenSchema";
import { cache } from "react";

export const fetchUserCarousel = cache(
  async (): Promise<CarouselClientType> => {
    const res = await fetch(`${BASE_URL}/about/carousel`, {
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      console.error("Failed to fetch about carousel:");
      throw new Error(`Failed to fetch about carousel`);
    }

    return res.json();
  }
);

export const fetchUserAboutParticipants = cache(
  async (): Promise<AboutParticipantsClientType> => {
    const res = await fetch(`${BASE_URL}/about/participants`, {
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      console.error("Failed to fetch about participants in client api call");
      throw new Error(`Failed to fetch about participants in client api call`);
    }

    return res.json();
  }
);

export const fetchUserCurated = cache(
  async (): Promise<AboutCuratedClientType> => {
    const res = await fetch(`${BASE_URL}/about/curated`, {
      next: { revalidate: 0 },
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
