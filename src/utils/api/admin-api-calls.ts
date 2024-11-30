import { BASE_URL } from "@/constants";
import {
  CarouselSectionContent,
  MainLinks,
  ParticipantsSectionContent,
} from "@/schemas/baseSchema";
import { EventDay } from "@/schemas/eventSchemas";
import { MainColors, MainMenuItem } from "@/utils/menu-types";
import { cache } from "react";

export const fetchColors = cache(async (): Promise<MainColors> => {
  const res = await fetch(`${BASE_URL}/admin/main/colors`, {
    next: { revalidate: 0 },
  });
  if (!res.ok) {
    console.error("Failed to fetch Admin main colors");
  }
  return res.json();
});

export const fetchMainSection = cache(async (): Promise<MainMenuItem[]> => {
  const res = await fetch(`${BASE_URL}/admin/main/menu`, {
    next: { revalidate: 0 },
  });
  if (!res.ok) {
    console.error("Failed to fetch Admin main section");
  }
  return res.json();
});
export const fetchMainLinks = cache(async (): Promise<MainLinks> => {
  const res = await fetch(`${BASE_URL}/admin/main/links`, {
    next: { revalidate: 0 },
  });
  if (!res.ok) {
    console.error("Failed to fetch Admin link section");
  }
  return res.json();
});

interface EventDaysResponse {
  eventDays: EventDay[];
}

export const fetchEventDays = cache(async (): Promise<EventDaysResponse> => {
  const res = await fetch(`${BASE_URL}/admin/main/days`, {
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    console.error("Failed to fetch event days");
    throw new Error("Failed to fetch event days");
  }

  return res.json();
});

export const fetchAboutCarousel = cache(
  async (): Promise<CarouselSectionContent> => {
    const res = await fetch(`${BASE_URL}/admin/about/carousel`, {
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      console.error("Failed to fetch about carousel:");
      throw new Error(`Failed to fetch about carousel`);
    }

    return res.json();
  }
);

export const fetchAboutParticipants = cache(
  async (): Promise<ParticipantsSectionContent> => {
    const res = await fetch(`${BASE_URL}/admin/about/participants`, {
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      console.error("Failed to fetch about participants");
      throw new Error(`Failed to fetch about participants`);
    }

    return res.json();
  }
);
