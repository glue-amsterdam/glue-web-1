import { cache } from "react";
import { LocationGroup } from "@/utils/map-types";
import { Sponsor } from "@/utils/sponsors-types";
import {
  ApiParticipantBaseType,
  ParticipantUser,
  User,
  UserWithPlanDetails,
} from "@/schemas/usersSchemas";
import { EnhancedUser, IndividualEventResponse } from "@/schemas/eventSchemas";
import { BASE_URL } from "@/constants";
import { RouteValues } from "@/schemas/mapSchema";
import { ParticipantClientResponse } from "@/types/api-visible-user";

/* EVENTS */
export const fetchEvents = cache(
  async (searchParams: URLSearchParams): Promise<IndividualEventResponse[]> => {
    try {
      const res = await fetch(
        `${BASE_URL}/events?${searchParams.toString()}`,
        {}
      );

      if (!res.ok) {
        throw new Error(
          `Failed to fetch events: ${res.status} ${res.statusText}`
        );
      }

      const data = await res.json();

      if (!Array.isArray(data)) {
        console.error("API returned non-array data:", data);
        return [];
      }

      return data as IndividualEventResponse[];
    } catch (error) {
      console.error("Error fetching events:", error);
      return [];
    }
  }
);

const eventCache = new Map<string, IndividualEventResponse>();

export const fetchEventById = cache(
  async (eventId: string): Promise<IndividualEventResponse> => {
    if (eventCache.has(eventId)) {
      return eventCache.get(eventId)!;
    }

    const res = await fetch(`${BASE_URL}/events?=${eventId}`, {
      next: { revalidate: 60 }, // Cache for 1 minute
    });
    if (!res.ok) throw new Error("Failed to fetch event by ID");
    const data = await res.json();
    eventCache.set(eventId, data);
    return data;
  }
);

/* MAP =>*/
export const fetchLocationGroups = cache(async (): Promise<LocationGroup[]> => {
  const res = await fetch(`${BASE_URL}/locations`, {
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error("Failed to fetch Locations");
  return res.json();
});

export const fetchAllRoutes = cache(async (): Promise<RouteValues[]> => {
  const res = await fetch(`${BASE_URL}/routes`, {
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error("Failed to fetch Routes");
  return res.json();
});
/* <= MAP */

/* PARTICIPANTS */
export const fetchParticipant = cache(
  async (slug: string): Promise<ParticipantClientResponse> => {
    const res = await fetch(`${BASE_URL}/client-user/${slug}`, {
      next: { revalidate: 3600 },
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

/* HUB => */
export async function fetchAllHubParticipants(): Promise<EnhancedUser[]> {
  const res = await fetch(`${BASE_URL}/hub-participants`, {
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error("Failed to fetch all hub participants");
  return res.json();
}

/* <= HUB */
