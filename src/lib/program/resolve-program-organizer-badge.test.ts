import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DEFAULT_PARTICIPANT_CATEGORIES } from "@/lib/participants/participant-categories";
import {
  organizerBadgeFromParticipant,
  resolveOrganizerBadge,
  type ProgramOrganizerBadge,
} from "./resolve-program-organizer-badge";

const categories = DEFAULT_PARTICIPANT_CATEGORIES;

describe("resolveOrganizerBadge", () => {
  it("falls back to organizer when location badge number is blank", () => {
    const locationIndex = new Map<string, ProgramOrganizerBadge>([
      ["loc-own", { type: "standard", displayNumber: " " }],
    ]);
    const organizerFallback: ProgramOrganizerBadge = {
      type: "standard",
      displayNumber: "16",
    };

    const badge = resolveOrganizerBadge(
      "loc-own",
      locationIndex,
      organizerFallback
    );

    assert.equal(badge.displayNumber, "16");
    assert.equal(badge.type, "standard");
  });

  it("keeps a non-blank location number over the organizer fallback", () => {
    const locationIndex = new Map<string, ProgramOrganizerBadge>([
      ["loc-hub", { type: "hub", displayNumber: "19" }],
    ]);
    const organizerFallback: ProgramOrganizerBadge = {
      type: "standard",
      displayNumber: "5",
    };

    const badge = resolveOrganizerBadge(
      "loc-hub",
      locationIndex,
      organizerFallback
    );

    assert.deepEqual(badge, { type: "hub", displayNumber: "19" });
  });

  it("uses organizer fallback when location is missing from the index", () => {
    const badge = resolveOrganizerBadge("missing", new Map(), {
      type: "standard",
      displayNumber: "16",
    });

    assert.deepEqual(badge, { type: "standard", displayNumber: "16" });
  });
});

describe("organizerBadgeFromParticipant", () => {
  it("inherits the hub number when the member has no own number", () => {
    const badge = organizerBadgeFromParticipant("standard", null, categories, {
      hubs: [{ number: "16", type: "hub" }],
    });

    assert.equal(badge.displayNumber, "16");
  });

  it("prefers the own number when present", () => {
    const badge = organizerBadgeFromParticipant("standard", "7", categories, {
      hubs: [{ number: "16", type: "hub" }],
    });

    assert.equal(badge.displayNumber, "7");
  });
});

describe("Se7en / Devoonsounds program badge path", () => {
  it("resolves hub member events at own map_info to the inherited hub number", () => {
    // Location owner is the hub member (not host) with null own display_number.
    // Location index may store a blank badge; organizer fallback carries hub #16 / #19.
    const cases = [
      { locationId: "se7en-own-map", hubNumber: "16" },
      { locationId: "devoonsounds-own-map", hubNumber: "19" },
    ] as const;

    for (const { locationId, hubNumber } of cases) {
      const locationIndex = new Map<string, ProgramOrganizerBadge>([
        [locationId, { type: "standard", displayNumber: " " }],
      ]);
      const organizerFallback = organizerBadgeFromParticipant(
        "standard",
        null,
        categories,
        { hubs: [{ number: hubNumber, type: "hub" }] }
      );

      const badge = resolveOrganizerBadge(
        locationId,
        locationIndex,
        organizerFallback
      );

      assert.equal(badge.displayNumber, hubNumber);
    }
  });

  it("keeps hub-host location number when the event is at the hub pin", () => {
    const locationIndex = new Map<string, ProgramOrganizerBadge>([
      ["madart-hub-map", { type: "hub", displayNumber: "19" }],
    ]);
    const organizerFallback = organizerBadgeFromParticipant(
      "standard",
      null,
      categories,
      { hubs: [{ number: "19", type: "hub" }] }
    );

    const badge = resolveOrganizerBadge(
      "madart-hub-map",
      locationIndex,
      organizerFallback
    );

    assert.deepEqual(badge, { type: "hub", displayNumber: "19" });
  });
});
