import { cache } from "react";
import { User, UserWithPlanDetails } from "@/schemas/usersSchemas";
import { IndividualEventResponse } from "@/schemas/eventSchemas";
import { BASE_URL } from "@/constants";
import { RouteValues } from "@/schemas/mapSchema";
import { ParticipantClientResponse } from "@/types/api-visible-user";

/* EVENTS WITH SEARCH PARAMS */
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

/* EVENTS BY ID */
export const fetchEventById = cache(
  async (eventId: string): Promise<IndividualEventResponse> => {
    if (eventCache.has(eventId)) {
      return eventCache.get(eventId)!;
    }

    const res = await fetch(`${BASE_URL}/events?=${eventId}`);
    if (!res.ok) throw new Error("Failed to fetch event by ID");
    const data = await res.json();
    eventCache.set(eventId, data);
    return data;
  }
);

/* FETCH ALL ROUTES */
export const fetchAllRoutes = cache(async (): Promise<RouteValues[]> => {
  const res = await fetch(`${BASE_URL}/routes`);
  if (!res.ok) throw new Error("Failed to fetch Routes");
  return res.json();
});

/* INDIVIDUAL PARTICIPANT USER FOR THE CLIENT */
export const fetchParticipant = cache(
  async (slug: string): Promise<ParticipantClientResponse> => {
    const res = await fetch(`${BASE_URL}/client-user/${slug}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) throw new Error("Failed to fetch participant");
    return res.json();
  }
);

/* USERS */
export const fetchUser = cache(
  async (id: string): Promise<UserWithPlanDetails> => {
    const res = await fetch(`${BASE_URL}/users/${id}`);
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
