import type { MapLocation } from "./types";

export const isMapHubEntity = (
  location: Pick<MapLocation, "hubId">
): boolean => Boolean(location.hubId);

/** Higher tier = drawn on top when markers overlap (within the same layer). */
export const getMapLocationMarkerStackTier = (location: MapLocation): number => {
  if (location.type === "hub") return 2;
  if (location.hubId) return 1;
  return 0;
};
