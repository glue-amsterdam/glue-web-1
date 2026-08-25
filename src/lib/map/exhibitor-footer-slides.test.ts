import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { MapLocation } from "./types";
import {
  STICKY_PARTICIPANT_SLUG,
  buildExhibitorFooterSlides,
  getExhibitorPopupDotType,
} from "./exhibitor-footer-slides";

const hubLocation: MapLocation = {
  id: "hub-map-info",
  latitude: 48.2,
  longitude: 16.37,
  type: "standard",
  name: "Hub Studio",
  displayNumber: "6",
  addressLine: "Hub Street 1, Vienna",
  hubId: "hub-1",
  hubHostUserId: "host-user",
  memberCount: 2,
  members: [
    {
      userId: "host-user",
      name: "Host Member",
      slug: "host-member",
      locationId: "hub-map-info",
      type: "standard",
      displayNumber: "6",
    },
    {
      userId: "sticky-user",
      name: "Sticky Member",
      slug: "sticky-member",
      locationId: "hub-map-info",
      type: STICKY_PARTICIPANT_SLUG,
      displayNumber: "12",
    },
  ],
};

describe("getExhibitorPopupDotType", () => {
  it("uses sticky type when the current slide is a sticky participant", () => {
    assert.equal(
      getExhibitorPopupDotType("standard", STICKY_PARTICIPANT_SLUG),
      STICKY_PARTICIPANT_SLUG
    );
  });

  it("keeps the hub location type for regular members", () => {
    assert.equal(getExhibitorPopupDotType("standard", "standard"), "standard");
    assert.equal(getExhibitorPopupDotType("hub", "hub"), "hub");
  });

  it("keeps the hub location type when slide type is missing", () => {
    assert.equal(getExhibitorPopupDotType("standard"), "standard");
    assert.equal(getExhibitorPopupDotType("hub", undefined), "hub");
  });

  it("does not override for other assignable categories", () => {
    assert.equal(
      getExhibitorPopupDotType("standard", "special-program"),
      "standard"
    );
  });

  it("uses the plural sticky slug when that is the current slide", () => {
    assert.equal(
      getExhibitorPopupDotType("hub", "sticky-participants"),
      "sticky-participants"
    );
  });
});

describe("buildExhibitorFooterSlides", () => {
  it("passes hub member types onto slides", () => {
    const slides = buildExhibitorFooterSlides(hubLocation, null);

    assert.equal(slides.length, 2);
    assert.equal(slides[0]?.type, "standard");
    assert.equal(slides[1]?.type, STICKY_PARTICIPANT_SLUG);
  });
});
