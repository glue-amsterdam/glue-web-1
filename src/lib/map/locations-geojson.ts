import {
  exhibitorTypeBackgroundHex,
  exhibitorTypeForegroundHex,
  MAP_ROUTE_STOP_BACKGROUND_HEX,
} from "@/lib/participants/exhibitor-type-styles";
import type { ExhibitorType } from "@/lib/participants/exhibitor-types";
import {
  getMarkerSortKey,
  sortMapLocationsForMarkers,
} from "@/lib/map/map-filters";
import type { MapLocation, MapRoute } from "@/lib/map/types";

export type MapPointFeatureProperties = {
  id: string;
  locationId: string;
  type: ExhibitorType | "route";
  name: string;
  memberCount: number;
  label: string;
  sortKey: number;
  circleColor: string;
  textColor: string;
};

export type MapPointFeature = {
  type: "Feature";
  id: string;
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: MapPointFeatureProperties;
};

export type MapPointFeatureCollection = {
  type: "FeatureCollection";
  features: MapPointFeature[];
};

export type MapThemeColors = {
  hub: string;
  upToThreeParticipants: string;
  specialProgram: string;
  route: string;
  primaryColor: string;
};

export const DEFAULT_MAP_THEME_COLORS: MapThemeColors = {
  hub: exhibitorTypeBackgroundHex.hub,
  upToThreeParticipants: exhibitorTypeBackgroundHex["up-to-three-participants"],
  specialProgram: exhibitorTypeBackgroundHex["special-program"],
  route: MAP_ROUTE_STOP_BACKGROUND_HEX,
  primaryColor: "#10069F",
};

export const getMapThemeColorsFromDocument = (): MapThemeColors => {
  if (typeof document === "undefined") {
    return DEFAULT_MAP_THEME_COLORS;
  }

  const style = getComputedStyle(document.documentElement);
  const read = (varName: string, fallback: string) =>
    style.getPropertyValue(varName).trim() || fallback;

  return {
    hub: read("--hub-color", DEFAULT_MAP_THEME_COLORS.hub),
    upToThreeParticipants: read(
      "--up-to-three-participants-color",
      DEFAULT_MAP_THEME_COLORS.upToThreeParticipants
    ),
    specialProgram: read(
      "--special-program-color",
      DEFAULT_MAP_THEME_COLORS.specialProgram
    ),
    route: MAP_ROUTE_STOP_BACKGROUND_HEX,
    primaryColor: read(
      "--primary-color",
      DEFAULT_MAP_THEME_COLORS.primaryColor
    ),
  };
};

const backgroundForType = (
  type: ExhibitorType,
  colors: MapThemeColors
): string => {
  switch (type) {
    case "hub":
      return colors.hub;
    case "up-to-three-participants":
      return colors.upToThreeParticipants;
    case "special-program":
      return colors.specialProgram;
  }
};

const toPointFeature = (
  id: string,
  locationId: string,
  longitude: number,
  latitude: number,
  type: ExhibitorType | "route",
  name: string,
  memberCount: number,
  label: string,
  sortKey: number,
  colors: MapThemeColors
): MapPointFeature => {
  const exhibitorType = type === "route" ? "hub" : type;
  const circleColor =
    type === "route" ? colors.route : backgroundForType(type, colors);
  const textColor =
    type === "route" ? "#ffffff" : exhibitorTypeForegroundHex[exhibitorType];

  return {
    type: "Feature",
    id,
    geometry: {
      type: "Point",
      coordinates: [longitude, latitude],
    },
    properties: {
      id,
      locationId,
      type,
      name,
      memberCount,
      label,
      sortKey,
      circleColor,
      textColor,
    },
  };
};

export const buildLocationsGeoJSON = (
  locations: MapLocation[],
  colors: MapThemeColors = DEFAULT_MAP_THEME_COLORS
): MapPointFeatureCollection => {
  const sorted = sortMapLocationsForMarkers(locations);

  return {
    type: "FeatureCollection",
    features: sorted.map((location, index) =>
      toPointFeature(
        location.id,
        location.id,
        location.longitude,
        location.latitude,
        location.type,
        location.name,
        location.memberCount,
        location.displayNumber ?? "",
        getMarkerSortKey(location.type, index),
        colors
      )
    ),
  };
};

export const buildRouteStopsGeoJSON = (
  route: MapRoute,
  locations: MapLocation[],
  colors: MapThemeColors = DEFAULT_MAP_THEME_COLORS
): MapPointFeatureCollection => {
  const locationById = new Map(locations.map((loc) => [loc.id, loc]));

  const features = [...route.dots]
    .sort((a, b) => a.routeStep - b.routeStep)
    .map((dot) => {
      const location = locationById.get(dot.mapInfoId);
      const routeStep = dot.routeStep;

      if (location) {
        return toPointFeature(
          dot.id,
          location.id,
          dot.longitude,
          dot.latitude,
          location.type,
          dot.name,
          location.memberCount,
          String(routeStep),
          getMarkerSortKey(location.type, routeStep),
          colors
        );
      }

      return toPointFeature(
        dot.id,
        dot.mapInfoId,
        dot.longitude,
        dot.latitude,
        "route",
        dot.name,
        1,
        String(routeStep),
        getMarkerSortKey("route", routeStep),
        colors
      );
    });

  return {
    type: "FeatureCollection",
    features,
  };
};
