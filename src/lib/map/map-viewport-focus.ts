import { LngLatBounds, type Map as MapboxMap } from "mapbox-gl";
import type { MapRoute } from "@/lib/map/types";
import { measureMapBottomInset } from "@/lib/map/map-viewport-insets";

export const MAP_FOCUS_ANIMATION_MS = 1000;

export type MapFocusPadding = {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
};

const DEFAULT_SIDE_PADDING = 80;
const DEFAULT_TOP_PADDING = 120;

export const getMapFocusPadding = (
  bottomInset?: number
): Required<MapFocusPadding> => ({
  top: DEFAULT_TOP_PADDING,
  bottom: bottomInset ?? measureMapBottomInset(),
  left: DEFAULT_SIDE_PADDING,
  right: DEFAULT_SIDE_PADDING,
});

const resolveFocusPadding = (
  padding?: MapFocusPadding
): Required<MapFocusPadding> => {
  const base = getMapFocusPadding(padding?.bottom);

  return {
    top: padding?.top ?? base.top,
    bottom: padding?.bottom ?? base.bottom,
    left: padding?.left ?? base.left,
    right: padding?.right ?? base.right,
  };
};

export const getRouteCentroid = (
  route: MapRoute
): { longitude: number; latitude: number } | null => {
  if (route.dots.length === 0) return null;

  const totals = route.dots.reduce(
    (acc, dot) => ({
      longitude: acc.longitude + dot.longitude,
      latitude: acc.latitude + dot.latitude,
    }),
    { longitude: 0, latitude: 0 }
  );

  return {
    longitude: totals.longitude / route.dots.length,
    latitude: totals.latitude / route.dots.length,
  };
};

const buildRouteBounds = (route: MapRoute): LngLatBounds | null => {
  if (route.dots.length === 0) return null;

  const bounds = new LngLatBounds();
  route.dots.forEach((dot) => {
    bounds.extend([dot.longitude, dot.latitude]);
  });

  return bounds;
};

const areAllRouteDotsVisible = (
  map: MapboxMap,
  route: MapRoute,
  padding: Required<MapFocusPadding>
): boolean => {
  const width = map.getContainer().clientWidth;
  const height = map.getContainer().clientHeight;

  return route.dots.every((dot) => {
    const point = map.project([dot.longitude, dot.latitude]);
    return (
      point.x >= padding.left &&
      point.x <= width - padding.right &&
      point.y >= padding.top &&
      point.y <= height - padding.bottom
    );
  });
};

export const focusMapOnPoint = (
  map: MapboxMap,
  longitude: number,
  latitude: number,
  options?: {
    instant?: boolean;
    padding?: MapFocusPadding;
  }
): void => {
  const padding = resolveFocusPadding(options?.padding);

  map.easeTo({
    center: [longitude, latitude],
    zoom: map.getZoom(),
    bearing: map.getBearing(),
    pitch: map.getPitch(),
    padding,
    duration: options?.instant ? 0 : MAP_FOCUS_ANIMATION_MS,
  });
};

export const focusMapOnRoute = (
  map: MapboxMap,
  route: MapRoute,
  options?: {
    instant?: boolean;
    padding?: MapFocusPadding;
  }
): void => {
  if (route.dots.length === 0) return;

  const padding = resolveFocusPadding(options?.padding);

  if (route.dots.length === 1) {
    const dot = route.dots[0];
    focusMapOnPoint(map, dot.longitude, dot.latitude, options);
    return;
  }

  const bounds = buildRouteBounds(route);
  if (!bounds) return;

  const allVisible = areAllRouteDotsVisible(map, route, padding);

  if (!allVisible) {
    map.fitBounds(bounds, {
      padding,
      maxZoom: map.getZoom(),
      bearing: map.getBearing(),
      pitch: map.getPitch(),
      duration: options?.instant ? 0 : MAP_FOCUS_ANIMATION_MS,
    });
    return;
  }

  const centroid = getRouteCentroid(route);
  if (!centroid) return;

  focusMapOnPoint(map, centroid.longitude, centroid.latitude, options);
};
