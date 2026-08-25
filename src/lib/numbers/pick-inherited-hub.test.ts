import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { pickInheritedHub } from "./pick-inherited-hub";

const hubs = [
  {
    hubId: "hub-a",
    name: "Hub A",
    displayNumber: "1",
    type: "standard",
    isHost: false,
  },
  {
    hubId: "hub-b",
    name: "Hub B",
    displayNumber: "2",
    type: "hub",
    isHost: true,
  },
];

describe("pickInheritedHub", () => {
  it("uses preferred Hub when it is still a membership", () => {
    const picked = pickInheritedHub(hubs, "hub-a");
    assert.equal(picked?.hubId, "hub-a");
  });

  it("falls back to the host Hub", () => {
    const picked = pickInheritedHub(hubs, "missing");
    assert.equal(picked?.hubId, "hub-b");
  });

  it("returns null when there are no memberships", () => {
    assert.equal(pickInheritedHub([], "hub-a"), null);
  });
});
