import type {
  MapPointFeatureCollection,
} from "@/lib/map/locations-geojson";

export const EMPTY_ROUTE_LINE_FEATURE_COLLECTION = {
  type: "FeatureCollection",
  features: [],
} as const;

export type SelectMapMarkersDataInput = {
  selectedRoute: string | null;
  locationsGeoJSON: MapPointFeatureCollection;
  routeStopsGeoJSON: MapPointFeatureCollection | null;
};

export const selectMapMarkersData = ({
  selectedRoute,
  locationsGeoJSON,
  routeStopsGeoJSON,
}: SelectMapMarkersDataInput): MapPointFeatureCollection => {
  if (selectedRoute && routeStopsGeoJSON) {
    return routeStopsGeoJSON;
  }
  return locationsGeoJSON;
};

export type SelectRouteLineDataInput = {
  selectedRoute: string | null;
  routeGeoJSON: GeoJSON.FeatureCollection | null;
};

export const selectRouteLineData = ({
  selectedRoute,
  routeGeoJSON,
}: SelectRouteLineDataInput): GeoJSON.FeatureCollection => {
  if (selectedRoute && routeGeoJSON) {
    return routeGeoJSON;
  }
  return EMPTY_ROUTE_LINE_FEATURE_COLLECTION as unknown as GeoJSON.FeatureCollection;
};

export const selectMapMarkersSelectedId = ({
  selectedRoute,
  selectedLocation,
  activeRouteStopId,
}: {
  selectedRoute: string | null;
  selectedLocation: string | null;
  activeRouteStopId: string | null;
}): string | null =>
  selectedRoute ? activeRouteStopId : selectedLocation;
