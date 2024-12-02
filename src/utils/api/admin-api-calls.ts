import { BASE_URL } from "@/constants";
import { CarouselSection } from "@/schemas/carouselSchema";
import { CitizensSection } from "@/schemas/citizenSchema";
import { CuratedMemberSectionHeader } from "@/schemas/curatedSchema";
import { EventDaysResponse } from "@/schemas/eventSchemas";
import { InfoSection } from "@/schemas/infoSchema";
import { MainColors, MainLinks, MainMenuData } from "@/schemas/mainSchema";
import { ParticipantsSectionHeader } from "@/schemas/participantsAdminSchema";
import { cache } from "react";
import { Citizen } from "@/schemas/citizenSchema";

export const fetchEventDays = cache(async (): Promise<EventDaysResponse> => {
  try {
    const res = await fetch(`${BASE_URL}/admin/main/days`, {
      next: { tags: ["event-days"] },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch event days: ${res.statusText}`);
    }

    const data = await res.json();

    if ("error" in data) {
      throw new Error(data.error);
    }

    return data;
  } catch (error) {
    console.error("Error fetching event days:", error);
    throw error;
  }
});

export const fetchColors = cache(async (): Promise<MainColors> => {
  const res = await fetch(`${BASE_URL}/admin/main/colors`, {
    next: { revalidate: 0 },
  });
  if (!res.ok) {
    console.error("Failed to fetch Admin main colors");
  }
  return res.json();
});

export const fetchMenuLinksSection = cache(async (): Promise<MainMenuData> => {
  const res = await fetch(`${BASE_URL}/admin/main/menu`, {
    next: { revalidate: 0 },
  });
  if (!res.ok) {
    console.error("Failed to fetch admin main menu links section");
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

export const fetchAboutCarousel = cache(async (): Promise<CarouselSection> => {
  const res = await fetch(`${BASE_URL}/admin/about/carousel`, {
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    console.error("Failed to fetch about carousel in admin-api-calls:");
    throw new Error(`Failed to fetch about carousel in admin-api-calls:");`);
  }

  return res.json();
});

export const fetchAboutParticipants = cache(
  async (): Promise<ParticipantsSectionHeader> => {
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

export const fetchAboutCurated = cache(
  async (): Promise<CuratedMemberSectionHeader> => {
    const res = await fetch(`${BASE_URL}/admin/about/curated`, {
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      console.error("Failed to fetch about curated");
      throw new Error(`Failed to fetch about curated`);
    }

    return res.json();
  }
);
export const fetchAboutInfo = cache(async (): Promise<InfoSection> => {
  const res = await fetch(`${BASE_URL}/admin/about/info`, {
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    console.error("Failed to fetch info in admin-api-calls");
    throw new Error(`Failed to fetch info in admin-api-calls`);
  }

  return res.json();
});
export const fetchAboutCitizens = cache(async (): Promise<CitizensSection> => {
  const res = await fetch(`${BASE_URL}/admin/about/citizens`, {
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    console.error("Failed to fetch citizens in admin-api-calls");
    throw new Error(`Failed to fetch citizens in admin-api-calls`);
  }

  return res.json();
});

const caches = new Map<string, Promise<Citizen[]>>();

export function fetchCitizensByYear(year: string): Promise<Citizen[]> {
  const cacheKey = `year_${year}`;
  if (!caches.get(cacheKey)) {
    const promise = fetch(`${BASE_URL}/admin/about/citizens/${year}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch citizens for year ${year}`);
        }
        return response.json();
      })
      .then((data) => data.citizens);

    caches.set(year, promise);
  }

  return caches.get(year)!;
}

export async function fetchYears(): Promise<string[]> {
  const response = await fetch(`${BASE_URL}/admin/about/citizens/years`);
  if (!response.ok) {
    throw new Error(`Failed to fetch citizens for years`);
  }
  return response.json();
}
