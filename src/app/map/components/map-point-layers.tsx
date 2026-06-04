"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FilterSpecification, SymbolLayerSpecification } from "mapbox-gl";
import { Layer, Source, useMap } from "react-map-gl/mapbox-legacy";
import type { ExhibitorType } from "@/lib/participants/exhibitor-types";
import type {
  MapPointFeatureCollection,
  MapThemeColors,
} from "@/lib/map/locations-geojson";
import { MAP_MARKER_IMAGE_IDS } from "@/lib/map/map-point-marker-svg";
import { registerMapPointMarkerImages } from "@/lib/map/register-map-point-marker-images";

const POINTER_CURSOR = "pointer";

export const MAP_LOCATIONS_SOURCE_ID = "map-locations";
export const MAP_ROUTE_STOPS_SOURCE_ID = "map-route-stops";

export const MAP_LOCATIONS_LAYER_PREFIX = "map-locations";
export const MAP_ROUTE_STOPS_LAYER_PREFIX = "map-route-stops";

/** Back-to-front: each type gets one symbol layer before the next type. */
export const EXHIBITOR_STACK_TYPES = [
  "hub",
  "up-to-three-participants",
  "special-program",
] as const satisfies readonly ExhibitorType[];

export const ROUTE_STOP_STACK_TYPES = [
  ...EXHIBITOR_STACK_TYPES,
  "route",
] as const;

const getMarkerLayerId = (
  prefix: string,
  type: ExhibitorType | "route"
): string => `${prefix}-${type}-markers`;

export const MAP_LOCATIONS_MARKER_LAYER_IDS = EXHIBITOR_STACK_TYPES.map((type) =>
  getMarkerLayerId(MAP_LOCATIONS_LAYER_PREFIX, type)
);

export const MAP_ROUTE_STOPS_MARKER_LAYER_IDS = ROUTE_STOP_STACK_TYPES.map(
  (type) => getMarkerLayerId(MAP_ROUTE_STOPS_LAYER_PREFIX, type)
);

export const MAP_POINT_INTERACTIVE_LAYER_IDS = [
  ...MAP_LOCATIONS_MARKER_LAYER_IDS,
  ...MAP_ROUTE_STOPS_MARKER_LAYER_IDS,
] as const;

const markerLayout = (
  type: ExhibitorType | "route"
): SymbolLayerSpecification["layout"] => ({
  "icon-image": MAP_MARKER_IMAGE_IDS[type],
  "icon-size": 1,
  "icon-allow-overlap": true,
  "icon-ignore-placement": true,
  "text-field": ["get", "label"],
  "text-size": 20,
  "text-font": ["DIN Pro Medium", "Arial Unicode MS Regular"],
  "text-allow-overlap": true,
  "text-ignore-placement": true,
  "symbol-sort-key": ["get", "sortKey"],
  "symbol-z-order": "source",
});

const markerPaint = (
  colors: MapThemeColors
): SymbolLayerSpecification["paint"] => ({
  "text-color": ["get", "textColor"],
  "icon-halo-color": colors.primaryColor,
  "icon-halo-blur": 0,
});

const typeFilter = (
  type: ExhibitorType | "route"
): FilterSpecification => ["==", ["get", "type"], type];

const MapPointMarkerImages = ({
  colors,
  onReadyChange,
}: {
  colors: MapThemeColors;
  onReadyChange: (ready: boolean) => void;
}) => {
  const { current: mapRef } = useMap();

  useEffect(() => {
    const map = mapRef?.getMap();
    if (!map) return;

    let cancelled = false;
    onReadyChange(false);

    const loadImages = async () => {
      if (!map.isStyleLoaded()) {
        map.once("style.load", () => {
          void loadImages();
        });
        return;
      }

      try {
        await registerMapPointMarkerImages(map, colors);
        if (!cancelled) {
          onReadyChange(true);
          map.triggerRepaint();
        }
      } catch (error) {
        console.error("Failed to register map point marker images:", error);
      }
    };

    void loadImages();

    return () => {
      cancelled = true;
      onReadyChange(false);
    };
  }, [mapRef, colors, onReadyChange]);

  return null;
};

type MapPointLayersProps = {
  sourceId: string;
  layerIdPrefix: string;
  stackTypes: readonly (ExhibitorType | "route")[];
  data: MapPointFeatureCollection;
  colors: MapThemeColors;
  /** When true, shows `cursor: pointer` while hovering dots (exhibitor mode). */
  showPointerCursor?: boolean;
};

const MapPointPointerCursor = ({
  layerIds,
  enabled,
}: {
  layerIds: string[];
  enabled: boolean;
}) => {
  const { current: mapRef } = useMap();

  useEffect(() => {
    if (!enabled) return;

    const map = mapRef?.getMap();
    if (!map) return;

    const canvas = map.getCanvas();
    let hoverCount = 0;

    const handleEnter = () => {
      hoverCount += 1;
      canvas.style.cursor = POINTER_CURSOR;
    };

    const handleLeave = () => {
      hoverCount = Math.max(0, hoverCount - 1);
      if (hoverCount === 0) {
        canvas.style.cursor = "";
      }
    };

    for (const layerId of layerIds) {
      map.on("mouseenter", layerId, handleEnter);
      map.on("mouseleave", layerId, handleLeave);
    }

    return () => {
      for (const layerId of layerIds) {
        map.off("mouseenter", layerId, handleEnter);
        map.off("mouseleave", layerId, handleLeave);
      }
      canvas.style.cursor = "";
    };
  }, [mapRef, layerIds, enabled]);

  return null;
};

export const MapPointLayers = ({
  sourceId,
  layerIdPrefix,
  stackTypes,
  data,
  colors,
  showPointerCursor = false,
}: MapPointLayersProps) => {
  const [imagesReady, setImagesReady] = useState(false);

  const markerLayerIds = useMemo(
    () => stackTypes.map((type) => getMarkerLayerId(layerIdPrefix, type)),
    [layerIdPrefix, stackTypes]
  );

  const handleImagesReadyChange = useCallback((ready: boolean) => {
    setImagesReady(ready);
  }, []);

  return (
    <>
      <MapPointMarkerImages
        colors={colors}
        onReadyChange={handleImagesReadyChange}
      />
      <MapPointPointerCursor
        layerIds={markerLayerIds}
        enabled={showPointerCursor && imagesReady}
      />
      {imagesReady && (
        <Source id={sourceId} type="geojson" data={data} promoteId="id">
          {stackTypes.map((type) => (
            <Layer
              key={getMarkerLayerId(layerIdPrefix, type)}
              id={getMarkerLayerId(layerIdPrefix, type)}
              type="symbol"
              filter={typeFilter(type)}
              layout={markerLayout(type)}
              paint={markerPaint(colors)}
            />
          ))}
        </Source>
      )}
    </>
  );
};
