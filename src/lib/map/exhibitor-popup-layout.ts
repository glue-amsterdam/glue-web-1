import type { Anchor, Map as MapboxMap } from "mapbox-gl";
import {
  focusMapOnPoint,
  getMapFocusPadding,
  type MapFocusPadding,
} from "@/lib/map/map-viewport-focus";
import { measureMapBottomInset } from "@/lib/map/map-viewport-insets";

export const EXHIBITOR_POPUP_WIDTH_PX = 460;
export const EXHIBITOR_POPUP_HEIGHT_PX = 452;
export const EXHIBITOR_POPUP_GAP_PX = 16;
export const EXHIBITOR_POPUP_EDGE_PADDING_PX = 16;
export const MAP_FILTER_SIDEBAR_WIDTH_PX = 295;

export type ExhibitorPopupAnchor = Extract<Anchor, "left" | "right">;

export type ExhibitorPopupLayout = {
  anchor: ExhibitorPopupAnchor;
  offset: [number, number];
  focusPadding: Required<MapFocusPadding>;
};

export type ExhibitorPopupLayoutOptions = {
  sidebarOpen: boolean;
  bottomInset?: number;
};

const getBaseFocusPadding = (
  options: ExhibitorPopupLayoutOptions
): Required<MapFocusPadding> => {
  const base = getMapFocusPadding(options.bottomInset ?? measureMapBottomInset());

  return {
    top: base.top + EXHIBITOR_POPUP_EDGE_PADDING_PX,
    bottom: base.bottom + EXHIBITOR_POPUP_EDGE_PADDING_PX,
    left:
      base.left +
      EXHIBITOR_POPUP_EDGE_PADDING_PX +
      (options.sidebarOpen ? MAP_FILTER_SIDEBAR_WIDTH_PX : 0),
    right: base.right + EXHIBITOR_POPUP_EDGE_PADDING_PX,
  };
};

const getPopupOpensRight = (map: MapboxMap, longitude: number, latitude: number): boolean => {
  const projected = map.project([longitude, latitude]);
  const mapWidth = map.getContainer().clientWidth;
  return projected.x < mapWidth / 2;
};

const buildExhibitorPopupLayout = (
  map: MapboxMap,
  longitude: number,
  latitude: number,
  options: ExhibitorPopupLayoutOptions
): ExhibitorPopupLayout => {
  const basePadding = getBaseFocusPadding(options);
  const popupOpensRight = getPopupOpensRight(map, longitude, latitude);
  const popupReserve = EXHIBITOR_POPUP_WIDTH_PX + EXHIBITOR_POPUP_GAP_PX;

  if (popupOpensRight) {
    return {
      anchor: "left",
      offset: [EXHIBITOR_POPUP_GAP_PX, 0],
      focusPadding: {
        ...basePadding,
        right: basePadding.right + popupReserve,
      },
    };
  }

  return {
    anchor: "right",
    offset: [-EXHIBITOR_POPUP_GAP_PX, 0],
    focusPadding: {
      ...basePadding,
      left: basePadding.left + popupReserve,
    },
  };
};

export const getExhibitorPopupLayout = (
  map: MapboxMap,
  longitude: number,
  latitude: number,
  options: ExhibitorPopupLayoutOptions
): ExhibitorPopupLayout => {
  return buildExhibitorPopupLayout(map, longitude, latitude, options);
};

export const focusWithPopupLayout = (
  map: MapboxMap,
  longitude: number,
  latitude: number,
  options: ExhibitorPopupLayoutOptions,
  { instant = true }: { instant?: boolean } = {}
): ExhibitorPopupLayout => {
  let layout = getExhibitorPopupLayout(map, longitude, latitude, options);

  focusMapOnPoint(map, longitude, latitude, {
    instant,
    padding: layout.focusPadding,
  });

  const verifiedLayout = getExhibitorPopupLayout(map, longitude, latitude, options);

  if (verifiedLayout.anchor !== layout.anchor) {
    focusMapOnPoint(map, longitude, latitude, {
      instant,
      padding: verifiedLayout.focusPadding,
    });
    layout = verifiedLayout;
  } else {
    layout = verifiedLayout;
  }

  return layout;
};

export const focusExhibitorWithPopupLayout = (
  map: MapboxMap,
  longitude: number,
  latitude: number,
  options: ExhibitorPopupLayoutOptions
): ExhibitorPopupLayout => {
  return focusWithPopupLayout(map, longitude, latitude, options, { instant: true });
};
