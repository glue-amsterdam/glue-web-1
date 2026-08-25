import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { MapLocation } from "./types";
import {
  filterMapLocationsForList,
  filterMapLocationsForMap,
  flattenHubMembersForAllList,
  flattenHubMembersForCategoryList,
  getSingleCategoryMatchMemberUserId,
  locationMatchesCategory,
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

const hubWithStickyMember: MapLocation = {
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
      userId: "sticky-user",
      name: "Sticky Member",
      slug: "sticky-member",
      locationId: "hub-map-info",
      type: "sticky-participant",
      displayNumber: "11",
    },
  ],
};

const stickyHostHub: MapLocation = {
  ...hubWithStickyMember,
  type: "sticky-participant",
  members: [
    {
      userId: "host-user",
      name: "Sticky Host",
      slug: "sticky-host",
      locationId: "hub-map-info",
      type: "sticky-participant",
      displayNumber: "10",
    },
    {
      userId: "standard-user",
      name: "Standard Member",
      slug: "standard-member",
      locationId: "hub-map-info",
      type: "standard",
      displayNumber: "11",
    },
  ],
};

const soloSticky: MapLocation = {
  id: "solo-sticky",
  latitude: 48.24,
  longitude: 16.41,
  type: "sticky-participant",
  name: "Solo Sticky",
  displayNumber: "40",
  addressLine: "Sticky Street 1, Vienna",
  memberCount: 1,
};

describe("locationMatchesCategory", () => {
  it("matches hub when a member has the category type", () => {
    assert.equal(
      locationMatchesCategory(hubWithStickyMember, "sticky-participant"),
      true
    );
    assert.equal(
      locationMatchesCategory(hubWithStickyMember, "gallery"),
      false
    );
  });
});

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

  it("includes hub when a member matches category and overrides marker type", () => {
    const result = filterMapLocationsForMap([hubWithStickyMember, standardLocation], {
      type: "sticky-participant",
      q: "",
    });

    assert.equal(result.length, 1);
    assert.equal(result[0]?.id, "hub-map-info");
    assert.equal(result[0]?.type, "sticky-participant");
  });

  it("keeps hub type when hub location already matches category", () => {
    const result = filterMapLocationsForMap([stickyHostHub], {
      type: "sticky-participant",
      q: "",
    });

    assert.equal(result.length, 1);
    assert.equal(result[0]?.type, "sticky-participant");
  });

  it("includes solo sticky locations unchanged", () => {
    const result = filterMapLocationsForMap([soloSticky, standardLocation], {
      type: "sticky-participant",
      q: "",
    });

    assert.equal(result.length, 1);
    assert.equal(result[0]?.id, "solo-sticky");
    assert.equal(result[0]?.type, "sticky-participant");
  });
});

describe("flattenHubMembersForCategoryList", () => {
  it("creates flat member rows when only members match category", () => {
    const filtered = [hubWithStickyMember];
    const result = flattenHubMembersForCategoryList(
      filtered,
      "sticky-participant"
    );

    assert.equal(result.length, 1);
    assert.equal(result[0]?.id, "list:hub-member:hub-1:sticky-user");
    assert.equal(result[0]?.mapSelectionId, "hub-map-info");
    assert.equal(result[0]?.hubMemberUserId, "sticky-user");
    assert.equal(result[0]?.type, "sticky-participant");
  });

  it("keeps hub row when hub type matches category", () => {
    const result = flattenHubMembersForCategoryList(
      [stickyHostHub],
      "sticky-participant"
    );

    assert.equal(result.length, 1);
    assert.equal(result[0]?.id, "hub-map-info");
  });
});

describe("filterMapLocationsForList", () => {
  it("flattens matching hub members in category view", () => {
    const result = filterMapLocationsForList(
      [hubWithStickyMember, standardLocation],
      {
        view: "category",
        type: "sticky-participant",
        q: "",
      }
    );

    assert.equal(result.length, 1);
    assert.equal(result[0]?.hubMemberUserId, "sticky-user");
  });
});

describe("getSingleCategoryMatchMemberUserId", () => {
  it("returns member id when exactly one member matches", () => {
    assert.equal(
      getSingleCategoryMatchMemberUserId(
        hubWithStickyMember,
        "sticky-participant"
      ),
      "sticky-user"
    );
  });

  it("returns undefined when multiple members match", () => {
    const hubWithTwoSticky: MapLocation = {
      ...hubWithStickyMember,
      members: [
        {
          userId: "sticky-1",
          name: "Sticky One",
          locationId: "hub-map-info",
          type: "sticky-participant",
        },
        {
          userId: "sticky-2",
          name: "Sticky Two",
          locationId: "hub-map-info",
          type: "sticky-participant",
        },
      ],
    };

    assert.equal(
      getSingleCategoryMatchMemberUserId(hubWithTwoSticky, "sticky-participant"),
      undefined
    );
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

  it("inherits the Hub number on flat member rows without an own number", () => {
    const hubWithUnnumberedMember: MapLocation = {
      ...hubLocation,
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
          userId: "plain-member",
          name: "Plain Member",
          slug: "plain-member",
          locationId: "hub-map-info",
          type: "standard",
          displayNumber: null,
          showHubNumber: true,
          inheritedHubs: [{ displayNumber: "10", type: "standard" }],
        },
      ],
    };

    const result = flattenHubMembersForAllList([hubWithUnnumberedMember]);
    const memberRow = result.find(
      (location) => location.id === "list:hub-member:hub-1:plain-member"
    );

    assert.equal(memberRow?.displayNumber, "10");
    assert.equal(memberRow?.numberBadges?.length, 1);
    assert.equal(memberRow?.numberBadges?.[0]?.source, "hub");
  });

  it("keeps two badges when own number differs from the Hub number", () => {
    const hubWithNumberedMember: MapLocation = {
      ...hubLocation,
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
          userId: "dual-number-member",
          name: "Dual Number",
          slug: "dual-number-member",
          locationId: "hub-map-info",
          type: "sticky-participant",
          displayNumber: "33",
          showHubNumber: true,
          inheritedHubs: [{ displayNumber: "10", type: "standard" }],
        },
      ],
    };

    const result = flattenHubMembersForAllList([hubWithNumberedMember]);
    const memberRow = result.find(
      (location) => location.id === "list:hub-member:hub-1:dual-number-member"
    );

    assert.equal(memberRow?.displayNumber, "10");
    assert.equal(memberRow?.numberBadges?.length, 2);
    assert.equal(memberRow?.numberBadges?.[0]?.value, "10");
    assert.equal(memberRow?.numberBadges?.[0]?.type, "sticky-participant");
    assert.equal(memberRow?.numberBadges?.[1]?.value, "33");
    assert.equal(memberRow?.numberBadges?.[1]?.type, "sticky-participant");
  });

  it("shows both Hub numbers when the member belongs to two Hubs", () => {
    const hubWithMultiHubMember: MapLocation = {
      ...hubLocation,
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
          userId: "two-hub-member",
          name: "Two Hubs",
          slug: "two-hub-member",
          locationId: "hub-map-info",
          type: "standard",
          displayNumber: null,
          showHubNumber: true,
          inheritedHubs: [
            { displayNumber: "10", type: "standard" },
            { displayNumber: "6", type: "hub" },
          ],
        },
      ],
    };

    const result = flattenHubMembersForAllList([hubWithMultiHubMember]);
    const memberRow = result.find(
      (location) => location.id === "list:hub-member:hub-1:two-hub-member"
    );

    assert.deepEqual(
      memberRow?.numberBadges?.map((badge) => badge.value),
      ["6", "10"]
    );
  });
});
