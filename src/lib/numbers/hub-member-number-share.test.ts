import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  filterHubMemberShareOccupants,
  hasDisplayNumberConflict,
} from "./hub-member-number-share";

const memberships = [
  { userId: "member-a", hubId: "hub-x" },
  { userId: "member-b", hubId: "hub-x" },
  { userId: "solo", hubId: "hub-y" },
];

describe("filterHubMemberShareOccupants", () => {
  it("lets a Hub member save the Hub number", () => {
    const remaining = filterHubMemberShareOccupants(
      [
        { entityType: "hub", entityId: "hub-x" },
        { entityType: "participant", entityId: "stranger" },
      ],
      {
        entityType: "participant",
        entityId: "member-a",
        memberships,
      }
    );

    assert.deepEqual(remaining, [
      { entityType: "participant", entityId: "stranger" },
    ]);
  });

  it("lets a Hub save a number already stored by its members", () => {
    const remaining = filterHubMemberShareOccupants(
      [
        { entityType: "participant", entityId: "member-a" },
        { entityType: "participant", entityId: "solo" },
      ],
      {
        entityType: "hub",
        entityId: "hub-x",
        memberships,
      }
    );

    assert.deepEqual(remaining, [
      { entityType: "participant", entityId: "solo" },
    ]);
  });
});

describe("hasDisplayNumberConflict", () => {
  it("does not treat Hub + member sharing as a conflict", () => {
    assert.equal(
      hasDisplayNumberConflict(
        [
          { entityType: "hub", entityId: "hub-x" },
          { entityType: "participant", entityId: "member-a" },
        ],
        memberships
      ),
      false
    );
  });

  it("flags a Hub sharing a number with a stranger", () => {
    assert.equal(
      hasDisplayNumberConflict(
        [
          { entityType: "hub", entityId: "hub-x" },
          { entityType: "participant", entityId: "solo" },
        ],
        memberships
      ),
      true
    );
  });

  it("flags two unrelated participants", () => {
    assert.equal(
      hasDisplayNumberConflict(
        [
          { entityType: "participant", entityId: "member-a" },
          { entityType: "participant", entityId: "solo" },
        ],
        memberships
      ),
      true
    );
  });
});
