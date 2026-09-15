import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { MapPointFeatureCollection } from "./locations-geojson";
import {
  EMPTY_ROUTE_LINE_FEATURE_COLLECTION,
  selectMapMarkersData,
  selectMapMarkersSelectedId,
  selectRouteLineData,
} from "./map-markers-data";

const locationsGeoJSON: MapPointFeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      id: "loc-1",
      geometry: { type: "Point", coordinates: [16.37, 48.2] },
      properties: {
        id: "loc-1",
        locationId: "loc-1",
        type: "standard",
        name: "A",
        memberCount: 1,
        label: "1",
        sortKey: 0,
        circleColor: "#000",
        textColor: "#fff",
        markerImageId: "marker",
      },
    },
  ],
};

const routeStopsGeoJSON: MapPointFeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      id: "stop-1",
      geometry: { type: "Point", coordinates: [16.38, 48.21] },
      properties: {
        id: "stop-1",
        locationId: "loc-1",
        type: "route",
        name: "Stop",
        memberCount: 1,
        label: "1",
        sortKey: 0,
        circleColor: "#000",
        textColor: "#fff",
        markerImageId: "marker",
      },
    },
  ],
};

const routeGeoJSON: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: [
          [16.37, 48.2],
          [16.38, 48.21],
        ],
      },
    },
  ],
};

describe("selectMapMarkersData", () => {
  it("shouldUseLocationsWhenNoRoute", () => {
    assert.equal(
      selectMapMarkersData({
        selectedRoute: null,
        locationsGeoJSON,
        routeStopsGeoJSON,
      }),
      locationsGeoJSON
    );
  });

  it("shouldUseRouteStopsWhenRouteSelected", () => {
    assert.equal(
      selectMapMarkersData({
        selectedRoute: "route-1",
        locationsGeoJSON,
        routeStopsGeoJSON,
      }),
      routeStopsGeoJSON
    );
  });
});

describe("selectRouteLineData", () => {
  it("shouldReturnEmptyCollectionReferenceWhenNoRoute", () => {
    const result = selectRouteLineData({
      selectedRoute: null,
      routeGeoJSON,
    });
    assert.equal(result, EMPTY_ROUTE_LINE_FEATURE_COLLECTION);
  });

  it("shouldReturnRouteGeoJSONWhenRouteSelected", () => {
    assert.equal(
      selectRouteLineData({
        selectedRoute: "route-1",
        routeGeoJSON,
      }),
      routeGeoJSON
    );
  });
});

describe("selectMapMarkersSelectedId", () => {
  it("shouldPreferActiveStopWhenRouteSelected", () => {
    assert.equal(
      selectMapMarkersSelectedId({
        selectedRoute: "route-1",
        selectedLocation: "loc-1",
        activeRouteStopId: "stop-1",
      }),
      "stop-1"
    );
  });

  it("shouldUseLocationWhenNoRoute", () => {
    assert.equal(
      selectMapMarkersSelectedId({
        selectedRoute: null,
        selectedLocation: "loc-1",
        activeRouteStopId: "stop-1",
      }),
      "loc-1"
    );
  });
});
