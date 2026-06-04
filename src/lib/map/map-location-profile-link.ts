import { getExhibitorLink } from "@/lib/participants/exhibitors-filters";
import type { MapLocation } from "./types";

/** Profile URL aligned with /exhibitors (hub page for multi-member hubs). */
export const getMapLocationProfileLink = (
  location: Pick<MapLocation, "slug" | "hubId" | "memberCount">
): string | null => {
  if (location.hubId && location.memberCount > 1) {
    return `/exhibitors/hub/${location.hubId}`;
  }

  return getExhibitorLink({
    slug: location.slug,
    hubId: location.hubId,
  });
};
