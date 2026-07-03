import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { MapLocation } from "./types";
import {
  buildHubMapSelectionFallbackIndex,
  excludeHubFallbackMarkerLocations,
  resolveMapLocationSelectionId,
} from "./map-selection";

const hubLocation: MapLocation = {
  id: "hub-map-info",
  latitude: 48.2,
  longitude: 16.37,
  type: "standard",
  name: "Hub Studio",
  displayNumber: "10",
  addressLine: "Hub Street 1, Vienna",
  hubId: "hub-1",
  hubHostUserId: "host-user",
  memberCount: 2,
  members: [],
};

const soloAtOwnAddress: MapLocation = {
  id: "member-own-map-info",
  latitude: 48.21,
  longitude: 16.38,
  type: "standard",
  name: "Member Solo",
  displayNumber: "11",
  addressLine: "Own Street 5, Vienna",
  slug: "member-solo",
  memberCount: 1,
};

describe("buildHubMapSelectionFallbackIndex", () => {
  it("does not fallback when hub member has a different locationId", () => {
    const locations: MapLocation[] = [
      {
        ...hubLocation,
        members: [
          {
            userId: "member-user",
            name: "Member Solo",
            slug: "member-solo",
            locationId: "member-own-map-info",
            type: "standard",
            displayNumber: "11",
          },
        ],
      },
      soloAtOwnAddress,
    ];

    const fallback = buildHubMapSelectionFallbackIndex(locations);

    assert.equal(fallback.has("member-own-map-info"), false);
    assert.equal(
      excludeHubFallbackMarkerLocations(locations, fallback).some(
        (location) => location.id === "member-own-map-info"
      ),
      true
    );
    assert.equal(
      resolveMapLocationSelectionId(locations, "member-own-map-info"),
      "member-own-map-info"
    );
  });

  it("falls back to hub when member shares address via ownMapInfoId", () => {
    const locations: MapLocation[] = [
      {
        ...hubLocation,
        members: [
          {
            userId: "member-user",
            name: "Member Same Address",
            slug: "member-same",
            locationId: "hub-map-info",
            ownMapInfoId: "duplicate-map-info",
            type: "standard",
            displayNumber: "12",
          },
        ],
      },
      {
        ...soloAtOwnAddress,
        id: "duplicate-map-info",
        slug: "member-same",
        addressLine: "Hub Street 1, Vienna",
        latitude: 48.2,
        longitude: 16.37,
      },
    ];

    const fallback = buildHubMapSelectionFallbackIndex(locations);

    assert.equal(fallback.get("duplicate-map-info"), "hub-map-info");
    assert.equal(
      excludeHubFallbackMarkerLocations(locations, fallback).some(
        (location) => location.id === "duplicate-map-info"
      ),
      false
    );
  });

  it("falls back solo pin to hub when slug matches and address is the same", () => {
    const locations: MapLocation[] = [
      {
        ...hubLocation,
        members: [
          {
            userId: "member-user",
            name: "Member Same Address",
            slug: "member-same",
            locationId: "hub-map-info",
            type: "standard",
            displayNumber: "12",
          },
        ],
      },
      {
        ...soloAtOwnAddress,
        id: "solo-same-address",
        slug: "member-same",
        addressLine: "Hub Street 1, Vienna",
        latitude: 48.2,
        longitude: 16.37,
      },
    ];

    const fallback = buildHubMapSelectionFallbackIndex(locations);

    assert.equal(fallback.get("solo-same-address"), "hub-map-info");
  });
});
