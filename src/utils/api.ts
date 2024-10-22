import { cache } from "react";
import { DatabaseContent } from "@/utils/about-types";
import { EventsResponse } from "@/utils/event-types";
import { LocationGroup } from "@/utils/map-types";
import { Member, MembersResponse } from "@/utils/member-types";
import { MainSection } from "@/utils/menu-types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

/* MAIN */
export const fetchMain = cache(async (): Promise<MainSection> => {
  const res = await fetch(`${BASE_URL}/main`, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) throw new Error("Failed to fetch Main");
  return res.json();
});

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
export const fetchFiveEvents = cache(async (): Promise<EventsResponse> => {
  const res = await fetch(`${BASE_URL}/events?limit=5`, {
    next: { revalidate: 0 },
  });

  if (!res.ok) throw new Error("Failed to fetch events");
  return res.json();
});

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
  const res = await fetch(`${BASE_URL}/members/${slug}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error("Failed to fetch Members");
  return res.json();
});
export const fetchAllMembers = cache(async (): Promise<MembersResponse> => {
  const res = await fetch(`${BASE_URL}/members`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error("Failed to fetch All Members");
  return res.json();
});
