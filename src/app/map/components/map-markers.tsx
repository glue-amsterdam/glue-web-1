"use client";

import { memo, useMemo } from "react";
import { Marker } from "react-map-gl/mapbox-legacy";
import type { MarkerEvent } from "react-map-gl/mapbox-legacy";
import type {
  MapPointFeature,
  MapPointFeatureCollection,
} from "@/lib/map/locations-geojson";
import type { MapPointMarkerVariant } from "@/lib/map/map-point-marker-spec";
import { getMapPointMarkerDimensions } from "@/lib/map/map-point-marker-spec";

/**
 * HTML-marker rendering of the map dots.
 *
 * Each dot is a real DOM element (identical to the `RoundedNumber` component)
 * anchored to a geographic coordinate via react-map-gl's `<Marker>`. Mapbox
 * re-projects the anchor to screen pixels on every move/zoom frame internally —
 * we never track zoom or compute pixel positions ourselves. This guarantees the
 * dots stay pinned AND look pixel-identical to the in-list `RoundedNumber`
 * badges (no canvas rasterization / resampling quality loss).
 */

// Marker z-indexes must stay BELOW the Mapbox popup (`.mapboxgl-popup` is
// `z-index: 10 !important` in globals.css) so an open exhibitor/route popup is
// never covered by a dot. Non-selected dots stack by Mapbox's own DOM order; we
// only raise the selected dot slightly so it sits above sibling dots.
const SELECTED_Z_INDEX = 5;

type MapMarkersProps = {
  data: MapPointFeatureCollection;
  variant: MapPointMarkerVariant;
  selectedId: string | null;
  /** Called with the feature id (dot id) that was clicked. */
  onMarkerClick: (feature: MapPointFeature) => void;
};

type SingleMarkerProps = {
  feature: MapPointFeature;
  diameterPx: number;
  fontSizePx: number;
  textOffsetYPx: number;
  isSelected: boolean;
  onMarkerClick: (feature: MapPointFeature) => void;
};

const SingleMarker = memo(function SingleMarker({
  feature,
  diameterPx,
  fontSizePx,
  textOffsetYPx,
  isSelected,
  onMarkerClick,
}: SingleMarkerProps) {
  const [longitude, latitude] = feature.geometry.coordinates;
  const { label, circleColor, textColor } = feature.properties;

  const handleClick = (event: MarkerEvent<MouseEvent>) => {
    // Prevent the map's own click handler from also firing / deselecting.
    event.originalEvent.stopPropagation();
    onMarkerClick(feature);
  };

  return (
    <Marker
      longitude={longitude}
      latitude={latitude}
      anchor="center"
      onClick={handleClick}
      // Raise the selected dot above sibling dots, but keep it below the popup.
      style={isSelected ? { zIndex: SELECTED_Z_INDEX } : undefined}
    >
      <div
        className="flex shrink-0 cursor-pointer items-center justify-center rounded-full font-lausanne"
        style={{
          width: diameterPx,
          height: diameterPx,
          backgroundColor: circleColor,
        }}
        aria-hidden
      >
        <span
          className="m-0 block min-w-[1ch] text-center tabular-nums leading-none"
          style={{
            color: textColor,
            fontSize: fontSizePx,
            transform: `translateY(${textOffsetYPx}px)`,
          }}
        >
          {label.trim()}
        </span>
      </div>
    </Marker>
  );
});

const MapMarkers = ({
  data,
  variant,
  selectedId,
  onMarkerClick,
}: MapMarkersProps) => {
  const dimensions = useMemo(
    () => getMapPointMarkerDimensions(variant),
    [variant]
  );

  return (
    <>
      {data.features.map((feature) => (
        <SingleMarker
          key={feature.id}
          feature={feature}
          diameterPx={dimensions.diameterPx}
          fontSizePx={dimensions.fontSizePx}
          textOffsetYPx={dimensions.textOffsetYPx}
          isSelected={feature.id === selectedId}
          onMarkerClick={onMarkerClick}
        />
      ))}
    </>
  );
};

export default memo(MapMarkers);
