import { cache } from "react";
import { DatabaseContent } from "@/utils/about-types";
import { MainColors, MainMenu } from "@/utils/menu-types";
import { EventsResponse } from "@/utils/event-types";
import { LocationGroup } from "@/utils/map-types";
import { Member } from "@/utils/member-types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

/* MAIN */
export const fetchMainMenu = cache(async (): Promise<MainMenu[]> => {
  const res = await fetch(`${BASE_URL}/main/main-menu`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error("Failed to fetch mainMenu");
  return res.json();
});

export const fetchMainColors = cache(async (): Promise<MainColors> => {
  const res = await fetch(`${BASE_URL}/main/main-colors`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error("Failed to fetch colors");
  return res.json();
});

/*  */

/* ABOUT */
export const fetchAbout = cache(async (): Promise<DatabaseContent> => {
  const res = await fetch(`${BASE_URL}/about`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error("Failed to fetch About section");
  return res.json();
});

/* EVENTS */
export const fetchEvents = cache(
  async (searchParams: URLSearchParams): Promise<EventsResponse> => {
    const res = await fetch(`${BASE_URL}/events?${searchParams.toString()}`, {
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error("Failed to fetch events");
    return res.json();
  }
);

/* MAP */
export const fetchLocationGroups = cache(async (): Promise<LocationGroup[]> => {
  const res = await fetch(`${BASE_URL}/locations`, {
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error("Failed to fetch Locations");
  return res.json();
});

/* MEMBERS */
export const fetchMember = cache(async (slug: string): Promise<Member> => {
  console.log(slug);

  const res = await fetch(`${BASE_URL}/members/${slug}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error("Failed to fetch Members");
  return res.json();
});
