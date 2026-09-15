import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { MAP_SEARCH_DEBOUNCE_MS } from "./map-search";

describe("MAP_SEARCH_DEBOUNCE_MS", () => {
  it("shouldBeThreeHundredMilliseconds", () => {
    assert.equal(MAP_SEARCH_DEBOUNCE_MS, 300);
  });
});
