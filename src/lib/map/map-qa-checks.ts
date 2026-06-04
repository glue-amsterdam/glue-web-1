import { classifyLocationType } from "./classify-location-type";
import { filterMapLocationsForMap } from "./map-filters";
import { getMapLocationProfileLink } from "./map-location-profile-link";
import {
  enrichLegacyLocationsWithHubIds,
  normalizeSnapshotLocations,
} from "./normalize-legacy-snapshot";
import type { MapLocation } from "./types";

export type MapQaCheckResult = {
  name: string;
  passed: boolean;
  detail?: string;
};

const assert = (
  name: string,
  condition: boolean,
  detail?: string
): MapQaCheckResult => ({
  name,
  passed: condition,
  detail: condition ? undefined : detail,
});

export const runMapLogicQaChecks = (): MapQaCheckResult[] => {
  const results: MapQaCheckResult[] = [];

  results.push(
    assert(
      "hub type at 4 members",
      classifyLocationType(4, false) === "hub"
    ),
    assert(
      "up-to-three at 3 members",
      classifyLocationType(3, false) === "up-to-three-participants"
    ),
    assert(
      "special-program when host flag and not hub-sized",
      classifyLocationType(1, true) === "special-program" &&
        classifyLocationType(2, true) === "special-program" &&
        classifyLocationType(3, true) === "special-program" &&
        classifyLocationType(4, true) === "hub"
    ),
    assert(
      "map markers ignore category filter",
      (() => {
        const sample: MapLocation[] = [
          {
            id: "1",
            latitude: 0,
            longitude: 0,
            type: "hub",
            name: "Hub A",
            displayNumber: "1",
            addressLine: "",
            memberCount: 4,
          },
          {
            id: "2",
            latitude: 0,
            longitude: 0,
            type: "special-program",
            name: "Special B",
            displayNumber: "2",
            addressLine: "",
            memberCount: 1,
          },
        ];
        const filtered = filterMapLocationsForMap(sample, {
          type: "hub",
          q: "",
        });
        return filtered.length === sample.length;
      })()
    )
  );

  const v2Snapshot = {
    version: 2 as const,
    capturedAt: "2025-01-01T00:00:00.000Z",
    locations: [
      {
        id: "loc-1",
        latitude: 52.3,
        longitude: 4.9,
        type: "hub" as const,
        name: "Hub A",
        displayNumber: "10",
        addressLine: "Amsterdam",
        hubId: "hub-1",
        memberCount: 5,
      },
    ],
  };

  const v2Locations = normalizeSnapshotLocations(v2Snapshot);
  results.push(
    assert(
      "snapshot v2 round-trip",
      v2Locations?.length === 1 && v2Locations[0]?.id === "loc-1"
    )
  );

  const legacySnapshot = [
    {
      id: "legacy-1",
      formatted_address: "Street 1, Amsterdam",
      latitude: 52.3,
      longitude: 4.9,
      participants: [
        {
          user_id: "host-1",
          user_name: "Host Name",
          is_host: true,
          slug: "host-slug",
          display_number: "5",
        },
        {
          user_id: "member-2",
          user_name: "Member",
          is_host: false,
        },
      ],
      is_hub: false,
      hub_name: "Small Hub",
      is_collective: false,
      is_special_program: false,
      hub_display_number: "99",
    },
  ];

  const legacyLocations = normalizeSnapshotLocations(legacySnapshot);
  results.push(
    assert(
      "legacy snapshot uses hub_name",
      legacyLocations?.[0]?.name === "Small Hub"
    ),
    assert(
      "legacy snapshot hub display number",
      legacyLocations?.[0]?.displayNumber === "99"
    ),
    assert(
      "legacy snapshot type for 2 members",
      legacyLocations?.[0]?.type === "up-to-three-participants"
    ),
    assert(
      "legacy snapshot hub marker at 4+ members",
      normalizeSnapshotLocations([
        {
          ...legacySnapshot[0],
          participants: [
            legacySnapshot[0].participants[0],
            { user_id: "m2", user_name: "M2", is_host: false },
            { user_id: "m3", user_name: "M3", is_host: false },
            { user_id: "m4", user_name: "M4", is_host: false },
          ],
        },
      ])?.[0]?.type === "hub"
    )
  );

  results.push(
    assert(
      "profile link prefers hub for multi-member",
      getMapLocationProfileLink({
        slug: "host-slug",
        hubId: "hub-abc",
        memberCount: 2,
      }) === "/exhibitors/hub/hub-abc"
    ),
    assert(
      "profile link uses slug for solo participant",
      getMapLocationProfileLink({
        slug: "solo-slug",
        memberCount: 1,
      }) === "/exhibitors/solo-slug"
    )
  );

  return results;
};

export const compareMapLocationSets = (
  baseline: MapLocation[],
  candidate: MapLocation[]
): { match: boolean; differences: string[] } => {
  const differences: string[] = [];
  const baselineById = new Map(baseline.map((location) => [location.id, location]));
  const candidateById = new Map(
    candidate.map((location) => [location.id, location])
  );

  for (const id of baselineById.keys()) {
    if (!candidateById.has(id)) {
      differences.push(`Missing in candidate: ${id}`);
    }
  }

  for (const id of candidateById.keys()) {
    if (!baselineById.has(id)) {
      differences.push(`Extra in candidate: ${id}`);
    }
  }

  for (const [id, base] of baselineById) {
    const cand = candidateById.get(id);
    if (!cand) continue;

    const fields: (keyof MapLocation)[] = [
      "type",
      "name",
      "displayNumber",
      "latitude",
      "longitude",
      "memberCount",
      "hubId",
      "slug",
    ];

    for (const field of fields) {
      if (base[field] !== cand[field]) {
        differences.push(
          `${id}.${field}: baseline=${String(base[field])} candidate=${String(cand[field])}`
        );
      }
    }
  }

  return { match: differences.length === 0, differences };
};

export const runEnrichLegacyHubIdsCheck = async (
  enrich: typeof enrichLegacyLocationsWithHubIds
): Promise<MapQaCheckResult> => {
  const raw = [
    {
      id: "legacy-1",
      formatted_address: "Street 1",
      latitude: 52,
      longitude: 4,
      participants: [
        {
          user_id: "host-uuid",
          user_name: "Host",
          is_host: true,
          slug: "host",
        },
        {
          user_id: "member",
          user_name: "Member",
          is_host: false,
        },
      ],
      is_hub: false,
      hub_name: "Hub Name",
      is_collective: false,
      is_special_program: false,
    },
  ];

  const locations =
    normalizeSnapshotLocations(raw)?.map((location) => ({
      ...location,
      hubId: undefined,
    })) ?? [];

  const mockSupabase = {
    from: () => ({
      select: () => ({
        in: async () => ({
          data: [{ id: "resolved-hub-id", hub_host_id: "host-uuid" }],
          error: null,
        }),
      }),
    }),
  };

  const enriched = await enrich(
    mockSupabase as never,
    raw,
    locations
  );

  return assert(
    "legacy hubId enrichment",
    enriched[0]?.hubId === "resolved-hub-id"
  );
};
