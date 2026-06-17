import type { ExhibitorType } from "@/lib/participants/exhibitor-types";
import type { MapThemeColors } from "@/lib/map/locations-geojson";

/** Logical on-screen diameter in CSS pixels (matches former circle-radius 16). */
export const MAP_POINT_MARKER_DIAMETER_PX = 64;

/** Bitmap side length before Mapbox pixelRatio scaling. */
export const MAP_POINT_MARKER_IMAGE_SIZE_PX = 64;

export const MAP_POINT_MARKER_PIXEL_RATIO = 2;

export const MAP_POINT_MARKER_STROKE_COLOR = "transparent";

export const MAP_POINT_MARKER_STROKE_WIDTH_PX = 0.5;

export type MapPointMarkerType = ExhibitorType | "route";

export const MAP_POINT_MARKER_TYPES = [
  "hub",
  "up-to-three-participants",
  "special-program",
  "route",
] as const satisfies readonly MapPointMarkerType[];

export const MAP_MARKER_IMAGE_IDS: Record<MapPointMarkerType, string> = {
  hub: "map-marker-hub",
  "up-to-three-participants": "map-marker-up-to-three-participants",
  "special-program": "map-marker-special-program",
  route: "map-marker-route",
};

export type MapPointMarkerSvgOptions = {
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  size?: number;
};

export const buildMapPointMarkerSvg = ({
  fill,
  stroke = MAP_POINT_MARKER_STROKE_COLOR,
  strokeWidth = MAP_POINT_MARKER_STROKE_WIDTH_PX,
  size = MAP_POINT_MARKER_IMAGE_SIZE_PX,
}: MapPointMarkerSvgOptions): string => {
  const center = size / 2;
  const radius = MAP_POINT_MARKER_DIAMETER_PX / 2 - strokeWidth / 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <circle cx="${center}" cy="${center}" r="${radius}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" />
</svg>`;
};

export const getMapPointMarkerFillForType = (
  type: MapPointMarkerType,
  colors: MapThemeColors
): string => {
  switch (type) {
    case "hub":
      return colors.hub;
    case "up-to-three-participants":
      return colors.upToThreeParticipants;
    case "special-program":
      return colors.specialProgram;
    case "route":
      return colors.route;
  }
};

export const buildMapPointMarkerSvgForType = (
  type: MapPointMarkerType,
  colors: MapThemeColors
): string =>
  buildMapPointMarkerSvg({
    fill: getMapPointMarkerFillForType(type, colors),
  });

export const loadMapPointMarkerImage = (svg: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () =>
      reject(new Error("map-point-marker-svg: failed to load marker image"));
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });
