import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getDailyShuffleSeed,
  shuffleExhibitors,
} from "./shuffle-exhibitors";

describe("shuffleExhibitors", () => {
  it("returns the same permutation for the same seed", () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8];
    const first = shuffleExhibitors(items, "2026-09-16");
    const second = shuffleExhibitors(items, "2026-09-16");

    assert.deepEqual(first, second);
    assert.deepEqual([...first].sort((a, b) => a - b), items);
  });

  it("returns a different permutation for a different seed", () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8];
    const first = shuffleExhibitors(items, "2026-09-16");
    const second = shuffleExhibitors(items, "2026-09-17");

    assert.notDeepEqual(first, second);
  });

  it("does not mutate the input array", () => {
    const items = [1, 2, 3, 4];
    const copy = [...items];
    shuffleExhibitors(items, "seed");
    assert.deepEqual(items, copy);
  });
});

describe("getDailyShuffleSeed", () => {
  it("returns UTC YYYY-MM-DD", () => {
    assert.equal(
      getDailyShuffleSeed(new Date("2026-09-16T15:30:00.000Z")),
      "2026-09-16"
    );
  });
});
