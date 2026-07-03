import type { ParticipantCategory } from "@/lib/participants/participant-categories";
import {
  buildDefaultCategoryColorMap,
  MAP_ROUTE_STOP_BACKGROUND_HEX,
} from "@/lib/participants/exhibitor-type-styles";
import type { ExhibitorType } from "@/lib/participants/exhibitor-types";
import {
  getCategoryCssVarNames,
  getExhibitorStackSlugs,
} from "@/lib/participants/participant-categories";
import {
  getMarkerSortKey,
  getRouteMarkerSortKey,
  sortMapLocationsForMarkers,
} from "@/lib/map/map-filters";
import {
  getMapMarkerImageId,
  type MapPointMarkerVariant,
} from "@/lib/map/map-point-marker-spec";
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
  markerImageId: string;
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
  categories: Record<string, { bg: string; font: string }>;
  route: string;
  primaryColor: string;
  categorySlugs: string[];
};

export const buildMapThemeColors = (
  categories: ParticipantCategory[],
  primaryColor = "#10069F"
): MapThemeColors => ({
  categories: buildDefaultCategoryColorMap(categories),
  route: MAP_ROUTE_STOP_BACKGROUND_HEX,
  primaryColor,
  categorySlugs: getExhibitorStackSlugs(categories),
});

export const DEFAULT_MAP_THEME_COLORS: MapThemeColors = buildMapThemeColors([]);

export const getMapThemeColorsFromDocument = (
  categorySlugs: string[] = DEFAULT_MAP_THEME_COLORS.categorySlugs
): MapThemeColors => {
  if (typeof document === "undefined") {
    return DEFAULT_MAP_THEME_COLORS;
  }

  const style = getComputedStyle(document.documentElement);
  const read = (varName: string, fallback: string) =>
    style.getPropertyValue(varName).trim() || fallback;

  const categories: Record<string, { bg: string; font: string }> = {};

  for (const slug of categorySlugs) {
    const { bg, font } = getCategoryCssVarNames(slug);
    const defaults = DEFAULT_MAP_THEME_COLORS.categories[slug];
    categories[slug] = {
      bg: read(bg, defaults?.bg ?? "#000000"),
      font: read(font, defaults?.font ?? "#ffffff"),
    };
  }

  return {
    categories,
    route: MAP_ROUTE_STOP_BACKGROUND_HEX,
    primaryColor: read(
      "--primary-color",
      DEFAULT_MAP_THEME_COLORS.primaryColor
    ),
    categorySlugs,
  };
};

const backgroundForType = (
  type: ExhibitorType,
  colors: MapThemeColors
): string => colors.categories[type]?.bg ?? "#000000";

const fontForType = (type: ExhibitorType, colors: MapThemeColors): string =>
  colors.categories[type]?.font ?? "#ffffff";

export type RouteStopMarkerColors = {
  backgroundColor: string;
  color: string;
};

/** Resolved fill/text colors for a route stop marker (PDF, route list). */
export const getRouteStopMarkerColors = (
  participantType: ExhibitorType | null,
  colors: MapThemeColors
): RouteStopMarkerColors => {
  if (!participantType) {
    return {
      backgroundColor: colors.route,
      color: "#ffffff",
    };
  }

  return {
    backgroundColor: backgroundForType(participantType, colors),
    color: fontForType(participantType, colors),
  };
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
  colors: MapThemeColors,
  variant: MapPointMarkerVariant
): MapPointFeature => {
  const markerColors =
    type === "route"
      ? getRouteStopMarkerColors(null, colors)
      : getRouteStopMarkerColors(type, colors);
  const { backgroundColor: circleColor, color: textColor } = markerColors;
  const resolvedLabel = label.trim() || " ";

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
      label: resolvedLabel,
      sortKey,
      circleColor,
      textColor,
      markerImageId: getMapMarkerImageId(type, resolvedLabel, variant),
    },
  };
};

export const buildLocationsGeoJSON = (
  locations: MapLocation[],
  colors: MapThemeColors = DEFAULT_MAP_THEME_COLORS,
  variant: MapPointMarkerVariant = "desktop"
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
        getMarkerSortKey(location, index),
        colors,
        variant
      )
    ),
  };
};

export const buildRouteStopsGeoJSON = (
  route: MapRoute,
  locations: MapLocation[],
  colors: MapThemeColors = DEFAULT_MAP_THEME_COLORS,
  variant: MapPointMarkerVariant = "desktop"
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
          getMarkerSortKey(location, routeStep),
          colors,
          variant
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
        getRouteMarkerSortKey(routeStep),
        colors,
        variant
      );
    });

  return {
    type: "FeatureCollection",
    features,
  };
};
