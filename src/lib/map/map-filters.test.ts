import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { MapLocation } from "./types";
import {
  filterMapLocationsForMap,
  flattenHubMembersForAllList,
} from "./map-filters";

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
  members: [
    {
      userId: "host-user",
      name: "Host",
      slug: "host",
      locationId: "hub-map-info",
      type: "standard",
      displayNumber: "10",
    },
    {
      userId: "member-user",
      name: "Dual Member",
      slug: "dual-member",
      locationId: "member-own-map-info",
      type: "standard",
      displayNumber: "11",
    },
  ],
};

const soloAtOwnAddress: MapLocation = {
  id: "member-own-map-info",
  latitude: 48.21,
  longitude: 16.38,
  type: "standard",
  name: "Dual Member",
  displayNumber: "11",
  addressLine: "Own Street 5, Vienna",
  slug: "dual-member",
  memberCount: 1,
};

const soloSameAddressAsHub: MapLocation = {
  id: "member-solo-same",
  latitude: 48.2,
  longitude: 16.37,
  type: "standard",
  name: "Same Address Member",
  displayNumber: "12",
  addressLine: "Hub Street 1, Vienna",
  slug: "same-address-member",
  memberCount: 1,
};

const standardLocation: MapLocation = {
  id: "standard-1",
  latitude: 48.22,
  longitude: 16.39,
  type: "standard",
  name: "Standard Studio",
  displayNumber: "20",
  addressLine: "Standard Street 1, Vienna",
  memberCount: 1,
};

const galleryLocation: MapLocation = {
  id: "gallery-1",
  latitude: 48.23,
  longitude: 16.4,
  type: "gallery",
  name: "Gallery Space",
  displayNumber: "30",
  addressLine: "Gallery Street 1, Vienna",
  memberCount: 1,
};

describe("filterMapLocationsForMap", () => {
  it("filters markers by category type", () => {
    const locations = [standardLocation, galleryLocation];
    const result = filterMapLocationsForMap(locations, {
      type: "gallery",
      q: "",
    });

    assert.equal(result.length, 1);
    assert.equal(result[0]?.id, "gallery-1");
  });

  it("filters markers by search query", () => {
    const locations = [standardLocation, galleryLocation];
    const result = filterMapLocationsForMap(locations, {
      type: "all",
      q: "Gallery",
    });

    assert.equal(result.length, 1);
    assert.equal(result[0]?.id, "gallery-1");
  });
});

describe("flattenHubMembersForAllList", () => {
  it("keeps solo row for dual-location hub member and skips flat hub row for them", () => {
    const result = flattenHubMembersForAllList([
      hubLocation,
      soloAtOwnAddress,
    ]);

    assert.equal(
      result.some((location) => location.id === "member-own-map-info"),
      true
    );
    assert.equal(
      result.some(
        (location) =>
          location.id === "list:hub-member:hub-1:member-user"
      ),
      false
    );
    assert.equal(
      result.some((location) => location.id === "list:hub-member:hub-1:host-user"),
      true
    );
    assert.equal(result.some((location) => location.id === "hub-map-info"), true);
  });

  it("hides redundant solo row when member is consolidated at hub address", () => {
    const hubWithSameAddressMember: MapLocation = {
      ...hubLocation,
      members: [
        {
          userId: "same-user",
          name: "Same Address Member",
          slug: "same-address-member",
          locationId: "hub-map-info",
          type: "standard",
          displayNumber: "12",
        },
      ],
    };

    const result = flattenHubMembersForAllList([
      hubWithSameAddressMember,
      soloSameAddressAsHub,
    ]);

    assert.equal(
      result.some((location) => location.id === "member-solo-same"),
      false
    );
    assert.equal(
      result.some(
        (location) => location.id === "list:hub-member:hub-1:same-user"
      ),
      true
    );
  });
});
