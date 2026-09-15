import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildLocationsGeoJSON,
  DEFAULT_MAP_THEME_COLORS,
} from "./locations-geojson";
import type { MapLocation } from "./types";

const locations: MapLocation[] = [
  {
    id: "loc-1",
    latitude: 48.2,
    longitude: 16.37,
    type: "standard",
    name: "Studio One",
    displayNumber: "1",
    addressLine: "Street 1",
    memberCount: 1,
  },
  {
    id: "loc-2",
    latitude: 48.21,
    longitude: 16.38,
    type: "gallery",
    name: "Gallery Two",
    displayNumber: "2",
    addressLine: "Street 2",
    memberCount: 1,
  },
];

describe("buildLocationsGeoJSON", () => {
  it("shouldKeepStableFeatureIdsAcrossBuilds", () => {
    const first = buildLocationsGeoJSON(locations, DEFAULT_MAP_THEME_COLORS);
    const second = buildLocationsGeoJSON(locations, DEFAULT_MAP_THEME_COLORS);

    assert.deepEqual(
      first.features.map((feature) => feature.id),
      second.features.map((feature) => feature.id)
    );
    assert.deepEqual(
      first.features.map((feature) => feature.geometry.coordinates),
      second.features.map((feature) => feature.geometry.coordinates)
    );
  });

  it("shouldUseLocationIdAsFeatureId", () => {
    const geojson = buildLocationsGeoJSON(locations, DEFAULT_MAP_THEME_COLORS);
    const ids = new Set(geojson.features.map((feature) => feature.id));
    assert.equal(ids.has("loc-1"), true);
    assert.equal(ids.has("loc-2"), true);
  });
});
