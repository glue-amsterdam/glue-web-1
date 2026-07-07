import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  classifyHubMemberCategory,
  DEFAULT_PARTICIPANT_CATEGORIES,
  isModeratorCategorySwitchChecked,
  resolveModeratorCategorySwitchChange,
} from "./participant-categories";

const testCategories = [
  ...DEFAULT_PARTICIPANT_CATEGORIES,
  {
    id: "default-sticky",
    slug: "sticky-participant",
    label: "Sticky Participant",
    bgColor: "#000000",
    fontColor: "#FFFFFF",
    sortOrder: 3,
    isDefault: false,
    isStructural: false,
    assignable: true,
    showInFilters: true,
    isProtected: false,
  },
];

describe("classifyHubMemberCategory", () => {
  it("returns standard for small hub members with standard category", () => {
    assert.equal(
      classifyHubMemberCategory(2, "standard", testCategories),
      "standard"
    );
  });

  it("returns hub for large hub members with standard category", () => {
    assert.equal(
      classifyHubMemberCategory(4, "standard", testCategories),
      "hub"
    );
  });

  it("returns sticky-participant for assignable sticky members in large hubs", () => {
    assert.equal(
      classifyHubMemberCategory(4, "sticky-participant", testCategories),
      "sticky-participant"
    );
  });

  it("returns special-program for assignable single-date members in small hubs", () => {
    assert.equal(
      classifyHubMemberCategory(2, "special-program", testCategories),
      "special-program"
    );
  });

  it("normalizes legacy standard slug to standard for small hubs", () => {
    assert.equal(
      classifyHubMemberCategory(2, "up-to-three-participants", testCategories),
      "standard"
    );
  });
});

describe("moderator category switches", () => {
  it("returns standard when turning off the active assignable switch", () => {
    assert.equal(
      resolveModeratorCategorySwitchChange(
        "special-program",
        "special-program",
        false,
        "standard"
      ),
      "standard"
    );
  });

  it("selects assignable slug when turning a switch on", () => {
    assert.equal(
      resolveModeratorCategorySwitchChange(
        "standard",
        "special-program",
        true,
        "standard"
      ),
      "special-program"
    );
  });

  it("switches from one assignable category to another", () => {
    assert.equal(
      resolveModeratorCategorySwitchChange(
        "special-program",
        "other-program",
        true,
        "standard"
      ),
      "other-program"
    );
  });

  it("marks only the active assignable switch as checked", () => {
    assert.equal(
      isModeratorCategorySwitchChecked(
        "standard",
        "special-program",
        "standard"
      ),
      false
    );
    assert.equal(
      isModeratorCategorySwitchChecked(
        "special-program",
        "special-program",
        "standard"
      ),
      true
    );
    assert.equal(
      isModeratorCategorySwitchChecked(
        "special-program",
        "other-program",
        "standard"
      ),
      false
    );
  });
});
