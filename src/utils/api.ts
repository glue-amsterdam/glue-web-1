import { cache } from "react";
import { LocationGroup } from "@/utils/map-types";
import { MainSection } from "@/utils/menu-types";

import { Sponsor } from "@/utils/sponsors-types";
import {
  ApiParticipantBaseType,
  CuratedParticipantWhitYear,
  ParticipantUser,
  User,
  UserWithPlanDetails,
} from "@/schemas/usersSchemas";
import { PlansResponse } from "@/utils/sign-in.types";
import { EnhancedUser, IndividualEventResponse } from "@/schemas/eventSchemas";
import { DatabaseAboutContent } from "@/schemas/baseSchema";

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
export const fetchAbout = cache(async (): Promise<DatabaseAboutContent> => {
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
export const fetchFiveEvents = cache(
  async (): Promise<IndividualEventResponse[]> => {
    const res = await fetch(`${BASE_URL}/events?limit=5`, {
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
export const fetchParticipantbyId = cache(
  async (userId: string): Promise<ParticipantUser> => {
    const res = await fetch(`${BASE_URL}/participants/userId/${userId}`, {
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error("Failed to fetch participant by ID");
    return res.json();
  }
);

export const fetchParticipantBaseById = cache(
  async (userId: string): Promise<ApiParticipantBaseType> => {
    const res = await fetch(`${BASE_URL}/participants/userId/${userId}/basic`, {
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error("Failed to fetch base participant by ID");
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

export async function fetchParticipantsIdandName(
  searchTerm: string
): Promise<EnhancedUser[]> {
  const response = await fetch(
    `/api/participants/search?term=${encodeURIComponent(searchTerm)}`
  );
  if (!response.ok) {
    throw new Error("Failed to search participants");
  }
  return response.json();
}

/* USERS */
export const fetchUser = cache(
  async (id: string): Promise<UserWithPlanDetails> => {
    const res = await fetch(`${BASE_URL}/users/${id}`, {
      next: { revalidate: 0 },
    });
    if (!res.ok) {
      console.error("Failed to fetch user:", await res.text());
      throw new Error("Failed to fetch user by ID");
    }
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

/* SIGNUP - GETPLANS */
export const fetchPlans = cache(async (): Promise<PlansResponse> => {
  const res = await fetch(`${BASE_URL}/plans`, {
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error("Failed to fetch plans");
  return res.json();
});

/* SLUG-CHECK */
export const fetchSlugCheck = async (
  slug: string
): Promise<{ isUnique: boolean }> => {
  const res = await fetch(
    `${BASE_URL}/checkslug?slug=${encodeURIComponent(slug)}`
  );
  if (!res.ok) throw new Error("Failed to fetch slug check");
  return res.json();
};
