import type { SupabaseClient } from "@supabase/supabase-js";
import type { ExhibitorType } from "@/lib/participants/exhibitor-types";
import { classifyLocationType } from "./classify-location-type";
import type {
  MapLocation,
  MapLocationDetailMember,
  MapLocationSnapshot,
} from "./types";
import { getAddressLine } from "./utils";

type LegacyParticipant = {
  user_id: string;
  user_name: string;
  is_host: boolean;
  slug?: string | null;
  display_number?: string | null;
};

type LegacyMapInfo = {
  id: string;
  formatted_address: string;
  latitude: number;
  longitude: number;
  participants: LegacyParticipant[];
  is_hub: boolean;
  hub_name?: string;
  hub_description?: string | null;
  is_collective: boolean;
  is_special_program: boolean;
  display_number?: string | null;
  hub_display_number?: string | null;
};

export const isLegacyMapInfoArray = (value: unknown): value is LegacyMapInfo[] =>
  Array.isArray(value) &&
  value.length > 0 &&
  typeof value[0] === "object" &&
  value[0] !== null &&
  "participants" in value[0];

const isMapLocationSnapshot = (value: unknown): value is MapLocationSnapshot =>
  typeof value === "object" &&
  value !== null &&
  "version" in value &&
  (value as MapLocationSnapshot).version === 2 &&
  Array.isArray((value as MapLocationSnapshot).locations);

const legacyType = (
  location: LegacyMapInfo,
  memberCount: number
): ExhibitorType => {
  if (location.is_hub || memberCount > 3) return "hub";
  return classifyLocationType(memberCount, location.is_special_program);
};

const buildLegacyHubMembers = (
  participants: LegacyParticipant[]
): MapLocationDetailMember[] => {
  const host =
    participants.find((participant) => participant.is_host) ?? participants[0];
  const ordered: LegacyParticipant[] = [];

  if (host) {
    ordered.push(host);
  }

  for (const participant of participants) {
    if (participant === host) continue;
    ordered.push(participant);
  }

  return ordered.map((participant) => {
    const slug = participant.slug?.trim();
    return {
      name: participant.user_name,
      ...(slug ? { slug } : {}),
    };
  });
};

const normalizeLegacyLocation = (location: LegacyMapInfo): MapLocation => {
  const participants = location.participants ?? [];
  const memberCount = participants.length;
  const host =
    participants.find((participant) => participant.is_host) ?? participants[0];

  const isMultiMemberHub =
    location.is_hub ||
    Boolean(location.hub_name) ||
    memberCount > 1;

  const type = legacyType(location, memberCount);
  const members =
    type === "hub" && isMultiMemberHub
      ? buildLegacyHubMembers(participants)
      : undefined;

  return {
    id: location.id,
    latitude: location.latitude,
    longitude: location.longitude,
    type,
    name: location.hub_name ?? host?.user_name ?? "Unknown",
    displayNumber:
      location.hub_display_number ?? location.display_number ?? host?.display_number ?? null,
    addressLine: getAddressLine(location.formatted_address),
    slug: isMultiMemberHub ? undefined : host?.slug ?? undefined,
    memberCount: Math.max(memberCount, 1),
    ...(members && members.length > 0 ? { members } : {}),
  };
};

/** Resolve hub ids for v1 snapshots by matching legacy host user ids. */
export const enrichLegacyLocationsWithHubIds = async (
  supabase: SupabaseClient,
  raw: unknown,
  locations: MapLocation[]
): Promise<MapLocation[]> => {
  if (!isLegacyMapInfoArray(raw) || locations.length === 0) {
    return locations;
  }

  const hostUserIdsByLocationId = new Map<string, string>();

  for (const location of raw) {
    const memberCount = location.participants?.length ?? 0;
    const host =
      location.participants.find((participant) => participant.is_host) ??
      location.participants[0];

    if (!host?.user_id) continue;

    const isHubLocation =
      location.is_hub ||
      Boolean(location.hub_name) ||
      memberCount > 1;

    if (isHubLocation) {
      hostUserIdsByLocationId.set(location.id, host.user_id);
    }
  }

  if (hostUserIdsByLocationId.size === 0) {
    return locations;
  }

  const hostUserIds = [...new Set(hostUserIdsByLocationId.values())];
  const { data: hubs, error } = await supabase
    .from("hubs")
    .select("id, hub_host_id")
    .in("hub_host_id", hostUserIds);

  if (error) {
    console.error("Failed to enrich legacy snapshot hub ids:", error);
    return locations;
  }

  const hubIdByHostUserId = new Map(
    (hubs ?? []).map((hub) => [hub.hub_host_id, hub.id])
  );

  return locations.map((location) => {
    if (location.hubId) return location;

    const hostUserId = hostUserIdsByLocationId.get(location.id);
    if (!hostUserId) return location;

    const hubId = hubIdByHostUserId.get(hostUserId);
    if (!hubId) return location;

    return { ...location, hubId };
  });
};

export const normalizeSnapshotLocations = (
  raw: unknown
): MapLocation[] | null => {
  if (!raw) return null;

  if (isMapLocationSnapshot(raw)) {
    return raw.locations;
  }

  if (isLegacyMapInfoArray(raw)) {
    return raw.map(normalizeLegacyLocation);
  }

  return null;
};
