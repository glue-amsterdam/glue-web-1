import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isModeratorCategorySwitchChecked,
  resolveModeratorCategorySwitchChange,
} from "./participant-categories";

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
