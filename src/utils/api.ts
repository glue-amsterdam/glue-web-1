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
import { MapLocationEnhaced, RouteValuesEnhanced } from "@/schemas/mapSchema";
import { OptimizedParticipant } from "@/app/api/participants/optimized/route";
import { BASE_URL } from "@/constants";

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

const eventCache = new Map<string, IndividualEventResponse>();
const mapCache = new Map<string, MapLocationEnhaced>();

export const fetchEventById = cache(
  async (eventId: string): Promise<IndividualEventResponse> => {
    if (eventCache.has(eventId)) {
      return eventCache.get(eventId)!;
    }

    const res = await fetch(`${BASE_URL}/events/${eventId}`, {
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

export const fetchAllRoutes = cache(
  async (): Promise<RouteValuesEnhanced[]> => {
    const res = await fetch(`${BASE_URL}/routes`, {
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error("Failed to fetch Routes");
    return res.json();
  }
);

export const fetchMapById = cache(
  async (id: string): Promise<MapLocationEnhaced> => {
    if (mapCache.has(id)) {
      return mapCache.get(id)!;
    }

    const res = await fetch(`${BASE_URL}/mapbox-locations/${id}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error("Map not found");
      }
      throw new Error("Failed to fetch Mapbox Location");
    }
    const data = await res.json();
    mapCache.set(id, data);
    return data;
  }
);

export const fetchMapsIdandName = cache(
  async (): Promise<MapLocationEnhaced[]> => {
    const res = await fetch(`${BASE_URL}/mapbox-locations`, {
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error("Failed to fetch Mapbox Locations");
    return res.json();
  }
);

/* <= MAP */

/* PARTICIPANTS */
export const fetchParticipant = cache(
  async (slug: string): Promise<ParticipantUser> => {
    const res = await fetch(`${BASE_URL}/participants/${slug}`, {
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

export async function getOptimizedParticipants(): Promise<
  OptimizedParticipant[]
> {
  const res = await fetch(`${BASE_URL}/participants/optimized`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch participants");
  }
  return res.json();
}

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
