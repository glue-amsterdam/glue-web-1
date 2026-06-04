import type { MapLocation } from "@/lib/map/types";
import type { ExhibitorType } from "@/lib/participants/exhibitor-types";

export type ProgramOrganizerBadge = {
  type: ExhibitorType;
  displayNumber: string;
};

export const organizerBadgeFromParticipant = (
  specialProgram: boolean,
  displayNumber: string | null
): ProgramOrganizerBadge => ({
  type: specialProgram ? "special-program" : "up-to-three-participants",
  displayNumber: displayNumber ?? " ",
});

export const buildLocationBadgeIndex = (
  locations: MapLocation[]
): Map<string, ProgramOrganizerBadge> => {
  const index = new Map<string, ProgramOrganizerBadge>();

  for (const location of locations) {
    index.set(location.id, {
      type: location.type,
      displayNumber: location.displayNumber ?? " ",
    });
  }

  return index;
};

export const resolveOrganizerBadge = (
  locationId: string | null | undefined,
  locationIndex: Map<string, ProgramOrganizerBadge>,
  organizerFallback: ProgramOrganizerBadge
): ProgramOrganizerBadge => {
  if (!locationId) {
    return organizerFallback;
  }

  return locationIndex.get(locationId) ?? organizerFallback;
};
