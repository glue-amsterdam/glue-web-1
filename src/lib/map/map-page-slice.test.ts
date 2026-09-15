import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  EMPTY_MAP_PAGE_SLICE,
  mergeMapPageSlice,
} from "./map-page-slice";
import type { MapLocation } from "./types";

const location: MapLocation = {
  id: "loc-1",
  latitude: 48.2,
  longitude: 16.37,
  type: "standard",
  name: "Studio",
  displayNumber: "1",
  addressLine: "Street",
  memberCount: 1,
};

describe("mergeMapPageSlice", () => {
  it("shouldPreserveSelectionWhenPatchingOnlyLists", () => {
    const current = mergeMapPageSlice(null, {
      selectedLocation: "loc-1",
      selectedRoute: null,
      filteredLocationsForList: [location],
    });

    const next = mergeMapPageSlice(current, {
      filteredLocationsForList: [],
      searchFilteredLocations: [],
    });

    assert.equal(next.selectedLocation, "loc-1");
    assert.equal(next.filteredLocationsForList.length, 0);
    assert.equal(next.onLocationSelect, current.onLocationSelect);
  });

  it("shouldStartFromEmptyDefaults", () => {
    const next = mergeMapPageSlice(null, { selectedRoute: "route-1" });
    assert.equal(next.selectedRoute, "route-1");
    assert.equal(next.selectedLocation, EMPTY_MAP_PAGE_SLICE.selectedLocation);
  });
});
