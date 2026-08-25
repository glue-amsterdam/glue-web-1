import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveDisplayNumberBadges } from "./resolve-display-number-badges";

describe("resolveDisplayNumberBadges", () => {
  it("uses the Hub number when the member has no own number", () => {
    const badges = resolveDisplayNumberBadges({
      ownNumber: null,
      ownType: "sticky-participant",
      showHubNumber: true,
      hubs: [{ number: "6", type: "standard" }],
    });

    assert.deepEqual(badges, [
      { value: "6", type: "sticky-participant", source: "hub" },
    ]);
  });

  it("keeps the plural sticky type on inherited Hub badges", () => {
    const badges = resolveDisplayNumberBadges({
      ownNumber: null,
      ownType: "sticky-participants",
      showHubNumber: true,
      hubs: [{ number: "11", type: "standard" }],
    });

    assert.deepEqual(badges, [
      { value: "11", type: "sticky-participants", source: "hub" },
    ]);
  });

  it("keeps special-program color on inherited Hub badges", () => {
    const badges = resolveDisplayNumberBadges({
      ownNumber: null,
      ownType: "special-program",
      showHubNumber: true,
      hubs: [{ number: "6", type: "hub" }],
    });

    assert.deepEqual(badges, [
      { value: "6", type: "special-program", source: "hub" },
    ]);
  });

  it("sorts badges from smallest to largest", () => {
    const badges = resolveDisplayNumberBadges({
      ownNumber: "12",
      ownType: "sticky-participant",
      showHubNumber: true,
      hubs: [{ number: "6", type: "standard" }],
    });

    assert.equal(badges.length, 2);
    assert.equal(badges[0]?.value, "6");
    assert.equal(badges[0]?.source, "hub");
    assert.equal(badges[0]?.type, "sticky-participant");
    assert.equal(badges[1]?.value, "12");
    assert.equal(badges[1]?.source, "own");
    assert.equal(badges[1]?.type, "sticky-participant");
  });

  it("sorts Hub numbers even when membership order is reversed", () => {
    const badges = resolveDisplayNumberBadges({
      ownNumber: null,
      ownType: "standard",
      showHubNumber: true,
      hubs: [
        { number: "10", type: "hub" },
        { number: "6", type: "hub" },
      ],
    });

    assert.deepEqual(
      badges.map((badge) => badge.value),
      ["6", "10"]
    );
  });

  it("shows a circle per Hub when the member belongs to two Hubs", () => {
    const badges = resolveDisplayNumberBadges({
      ownNumber: null,
      ownType: "standard",
      showHubNumber: true,
      hubs: [
        { number: "6", type: "hub" },
        { number: "10", type: "hub" },
      ],
    });

    assert.deepEqual(badges, [
      { value: "6", type: "hub", source: "hub" },
      { value: "10", type: "hub", source: "hub" },
    ]);
  });

  it("dedupes when own number equals a Hub number", () => {
    const badges = resolveDisplayNumberBadges({
      ownNumber: "6",
      ownType: "standard",
      showHubNumber: true,
      hubs: [{ number: "6", type: "standard" }],
    });

    assert.deepEqual(badges, [{ value: "6", type: "standard", source: "own" }]);
  });

  it("hides Hub numbers when the toggle is off", () => {
    const badges = resolveDisplayNumberBadges({
      ownNumber: "12",
      ownType: "standard",
      showHubNumber: false,
      hubs: [
        { number: "6", type: "hub" },
        { number: "10", type: "hub" },
      ],
    });

    assert.deepEqual(badges, [{ value: "12", type: "standard", source: "own" }]);
  });

  it("returns no badges when both numbers are empty", () => {
    const badges = resolveDisplayNumberBadges({
      ownNumber: " ",
      ownType: "standard",
      showHubNumber: true,
      hubs: [{ number: null, type: "hub" }],
    });

    assert.deepEqual(badges, []);
  });
});
