import type { MapLocation, MapLocationDetailMember } from "./types";
import { sortMapLocationsForDisplayList } from "./map-filters";
import { normalizeMapAddressLine } from "./utils";

const hasSameCoordinates = (
  left: MapLocation,
  right: MapLocation
): boolean =>
  left.latitude === right.latitude && left.longitude === right.longitude;

const isSoloExhibitorLocation = (location: MapLocation): boolean =>
  !location.hubId && location.memberCount === 1;

const isHostHubForMember = (
  hubLocation: MapLocation,
  member: MapLocationDetailMember
): boolean =>
  Boolean(
    member.userId &&
      hubLocation.hubHostUserId &&
      hubLocation.hubHostUserId === member.userId
  );

const setFallbackEntry = (
  fallback: Map<string, string>,
  soloMapInfoId: string,
  hubLocation: MapLocation,
  member: MapLocationDetailMember
): void => {
  if (!soloMapInfoId || soloMapInfoId === hubLocation.id) return;

  const existingHubId = fallback.get(soloMapInfoId);
  if (!existingHubId) {
    fallback.set(soloMapInfoId, hubLocation.id);
    return;
  }

  if (isHostHubForMember(hubLocation, member)) {
    fallback.set(soloMapInfoId, hubLocation.id);
  }
};

const getSortedHubLocations = (locations: MapLocation[]): MapLocation[] =>
  sortMapLocationsForDisplayList(locations.filter((location) => location.hubId));

/** Hub map_info id for a member userId; prefers the hub where they are host. */
export const resolveHubForMemberUserId = (
  locations: MapLocation[],
  userId: string
): string | null => {
  let fallbackHubId: string | null = null;

  for (const hubLocation of getSortedHubLocations(locations)) {
    const isMember = (hubLocation.members ?? []).some(
      (member) => member.userId === userId
    );
    if (!isMember) continue;

    if (hubLocation.hubHostUserId === userId) {
      return hubLocation.id;
    }

    if (!fallbackHubId) {
      fallbackHubId = hubLocation.id;
    }
  }

  return fallbackHubId;
};

/** map_info ids that should resolve to a hub pin instead of a solo dot. */
export const buildHubMapSelectionFallbackIndex = (
  locations: MapLocation[]
): Map<string, string> => {
  const fallback = new Map<string, string>();

  for (const hubLocation of getSortedHubLocations(locations)) {
    for (const member of hubLocation.members ?? []) {
      if (member.ownMapInfoId) {
        setFallbackEntry(fallback, member.ownMapInfoId, hubLocation, member);
      }

      const memberLocationId = member.locationId ?? hubLocation.id;
      if (memberLocationId !== hubLocation.id) {
        setFallbackEntry(fallback, memberLocationId, hubLocation, member);
      }
    }
  }

  const soloLocations = locations.filter(isSoloExhibitorLocation);

  for (const soloLocation of soloLocations) {
    if (fallback.has(soloLocation.id)) continue;
    if (!soloLocation.slug) continue;

    const soloSlug = soloLocation.slug.trim();
    if (!soloSlug) continue;

    const soloAddress = normalizeMapAddressLine(soloLocation.addressLine);

    for (const hubLocation of getSortedHubLocations(locations)) {
      const matchingMember = (hubLocation.members ?? []).find(
        (member) => member.slug?.trim() === soloSlug
      );
      if (!matchingMember) continue;

      const hubAddress = normalizeMapAddressLine(hubLocation.addressLine);
      const sameAddress =
        Boolean(soloAddress) &&
        Boolean(hubAddress) &&
        soloAddress === hubAddress;
      const sameCoordinates = hasSameCoordinates(soloLocation, hubLocation);

      if (sameAddress || sameCoordinates) {
        setFallbackEntry(
          fallback,
          soloLocation.id,
          hubLocation,
          matchingMember
        );
        break;
      }
    }
  }

  return fallback;
};

export const resolveMapLocationSelectionId = (
  locations: MapLocation[],
  locationId: string
): string => {
  if (!locationId) return locationId;

  const fallback = buildHubMapSelectionFallbackIndex(locations);
  return fallback.get(locationId) ?? locationId;
};

export const excludeHubFallbackMarkerLocations = (
  locations: MapLocation[],
  fallbackIndex: Map<string, string>
): MapLocation[] => {
  if (fallbackIndex.size === 0) return locations;
  return locations.filter((location) => !fallbackIndex.has(location.id));
};
