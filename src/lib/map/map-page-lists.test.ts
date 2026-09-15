import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DEFAULT_MAP_FILTERS } from "./map-filters";
import { buildEarlyHydratorPageListsPatch } from "./map-page-lists";
import type { MapLocation, MapPageData, MapRoute } from "./types";

const location: MapLocation = {
  id: "loc-1",
  latitude: 48.2,
  longitude: 16.37,
  type: "standard",
  name: "Studio One",
  displayNumber: "1",
  addressLine: "Street 1",
  memberCount: 1,
};

const route: MapRoute = {
  id: "route-1",
  name: "Route One",
  description: null,
  zone: "center",
  dots: [],
};

const initialData: MapPageData = {
  locations: [location],
  routes: [route],
  tourMode: false,
};

describe("buildEarlyHydratorPageListsPatch", () => {
  it("shouldIncludeFilteredListsWithoutSelectionFields", () => {
    const patch = buildEarlyHydratorPageListsPatch(
      initialData,
      DEFAULT_MAP_FILTERS
    );

    assert.equal(patch.routes.length, 1);
    assert.equal(patch.filteredLocationsForList.length, 1);
    assert.equal(patch.searchFilteredLocations.length, 1);
    assert.equal(patch.filteredRoutesForList.length, 1);

    assert.equal(
      Object.prototype.hasOwnProperty.call(patch, "selectedLocation"),
      false
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(patch, "selectedRoute"),
      false
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(patch, "onLocationSelect"),
      false
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(patch, "onRouteSelect"),
      false
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(patch, "onDownloadSelectedRoute"),
      false
    );
  });
});
