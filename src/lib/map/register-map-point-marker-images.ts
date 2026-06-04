import type { Map as MapboxMap } from "mapbox-gl";
import type { MapThemeColors } from "@/lib/map/locations-geojson";
import {
  buildMapPointMarkerSvgForType,
  loadMapPointMarkerImage,
  MAP_MARKER_IMAGE_IDS,
  MAP_POINT_MARKER_PIXEL_RATIO,
  MAP_POINT_MARKER_TYPES,
  type MapPointMarkerType,
} from "@/lib/map/map-point-marker-svg";

const upsertMapImage = (
  map: MapboxMap,
  id: string,
  image: HTMLImageElement
): void => {
  const options = { pixelRatio: MAP_POINT_MARKER_PIXEL_RATIO };

  if (map.hasImage(id)) {
    map.updateImage(id, image);
    return;
  }

  map.addImage(id, image, options);
};

export const registerMapPointMarkerImage = async (
  map: MapboxMap,
  type: MapPointMarkerType,
  colors: MapThemeColors
): Promise<void> => {
  const svg = buildMapPointMarkerSvgForType(type, colors);
  const image = await loadMapPointMarkerImage(svg);
  upsertMapImage(map, MAP_MARKER_IMAGE_IDS[type], image);
};

export const registerMapPointMarkerImages = async (
  map: MapboxMap,
  colors: MapThemeColors
): Promise<void> => {
  await Promise.all(
    MAP_POINT_MARKER_TYPES.map((type) =>
      registerMapPointMarkerImage(map, type, colors)
    )
  );
};
