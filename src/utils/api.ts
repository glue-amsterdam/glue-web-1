import { cache } from "react";
import { DatabaseContent } from "@/utils/about-types";
import { Event, IndividualEventResponse } from "@/utils/event-types";
import { LocationGroup } from "@/utils/map-types";
import { MainSection } from "@/utils/menu-types";
import {
  CuratedParticipantWhitYear,
  ParticipantUser,
  User,
  UserWithPlanDetails,
} from "@/utils/user-types";
import { Sponsor } from "@/utils/sponsors-types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

/* MAIN */
export const fetchMain = cache(async (): Promise<MainSection> => {
  const res = await fetch(`${BASE_URL}/main`, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    console.error("Failed to fetch Main, using mock data");
    return await import("@/lib/mockMain").then((result) => result.mainSection);
  }

  if (!res.ok) throw new Error("Failed to fetch Main");
  return res.json();
});

/* ABOUT */
export const fetchAbout = cache(async (): Promise<DatabaseContent> => {
  const res = await fetch(`${BASE_URL}/about`, {
    next: { revalidate: 0 },
  });
  if (!res.ok) {
    console.error("Failed to fetch Main, using mock data");
    return await import("@/lib/mockAbout").then((result) => result.mockAbout);
  }

  if (!res.ok) throw new Error("Failed to fetch About section");
  return res.json();
});

export const fetchCurated = cache(
  async (): Promise<Record<number, CuratedParticipantWhitYear[]>> => {
    const res = await fetch(`${BASE_URL}/curated`, {
      next: { revalidate: 0 },
    });

    if (!res.ok) throw new Error("Failed to fetch curated members");
    return res.json();
  }
);

/* EVENTS */
export const fetchEvents = cache(
  async (searchParams: URLSearchParams): Promise<IndividualEventResponse[]> => {
    const res = await fetch(`${BASE_URL}/events?${searchParams.toString()}`, {
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error("Failed to fetch events");
    return res.json();
  }
);
export const fetchFiveEvents = cache(async (): Promise<Event[]> => {
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

/* PARTICIPANTS */
export const fetchParticipant = cache(
  async (slug: string): Promise<ParticipantUser> => {
    const res = await fetch(`${BASE_URL}/participants/${slug}`, {
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error("Failed to fetch participant");
    return res.json();
  }
);
export const fetchAllParticipants = cache(
  async (): Promise<ParticipantUser[]> => {
    const res = await fetch(`${BASE_URL}/participants`, {
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error("Failed to fetch all participants");
    return res.json();
  }
);

/* USERS */
export const fetchUser = cache(
  async (id: string): Promise<UserWithPlanDetails> => {
    const res = await fetch(`${BASE_URL}/users/${id}`, {
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error("Failed to fetch user");
    return res.json();
  }
);
export const fetchAllUsers = cache(async (): Promise<User[]> => {
  const res = await fetch(`${BASE_URL}/users`, {
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error("Failed to fetch all users");
  return res.json();
});

/* SPONSORS */
export const fetchSponsors = cache(async (): Promise<Sponsor[]> => {
  const res = await fetch(`${BASE_URL}/sponsors`, {
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error("Failed to fetch sponsors");
  return res.json();
});
