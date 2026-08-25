import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getExhibitorNumberBadges } from "./exhibitors-filters";

describe("getExhibitorNumberBadges", () => {
  it("inherits Hub number on participant cards", () => {
    const badges = getExhibitorNumberBadges({
      type: "standard",
      displayNumber: null,
      hubDisplayNumber: "6",
      hubType: "standard",
      showHubNumber: true,
    });

    assert.equal(badges.length, 1);
    assert.equal(badges[0]?.value, "6");
    assert.equal(badges[0]?.source, "hub");
  });

  it("shows own then Hub when the numbers differ", () => {
    const badges = getExhibitorNumberBadges({
      type: "sticky-participant",
      displayNumber: "12",
      hubDisplayNumber: "6",
      hubType: "standard",
      showHubNumber: true,
    });

    assert.equal(badges.length, 2);
    assert.equal(badges[0]?.value, "6");
    assert.equal(badges[0]?.type, "sticky-participant");
    assert.equal(badges[1]?.value, "12");
    assert.equal(badges[1]?.type, "sticky-participant");
  });

  it("keeps special-program color when inheriting a Hub number", () => {
    const badges = getExhibitorNumberBadges({
      type: "special-program",
      displayNumber: null,
      hubDisplayNumber: "6",
      hubType: "hub",
      showHubNumber: true,
    });

    assert.equal(badges.length, 1);
    assert.equal(badges[0]?.value, "6");
    assert.equal(badges[0]?.type, "special-program");
    assert.equal(badges[0]?.source, "hub");
  });

  it("shows a circle per Hub when the member belongs to two Hubs", () => {
    const badges = getExhibitorNumberBadges({
      type: "standard",
      displayNumber: null,
      hubDisplayNumber: "6",
      hubType: "hub",
      showHubNumber: true,
      inheritedHubs: [
        { displayNumber: "6", type: "hub" },
        { displayNumber: "10", type: "hub" },
      ],
    });

    assert.equal(badges.length, 2);
    assert.equal(badges[0]?.value, "6");
    assert.equal(badges[1]?.value, "10");
  });
});
