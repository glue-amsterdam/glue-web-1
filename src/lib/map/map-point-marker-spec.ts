import type { ExhibitorType } from "@/lib/participants/exhibitor-types";

export type MapPointMarkerType = ExhibitorType | "route";

export type MapPointMarkerVariant = "mobile" | "tablet" | "desktop";

/**
 * Marker dimensions must stay in sync with the `RoundedNumber` component
 * (`src/components/rounded-number.tsx`) so the map dots and the in-list badges
 * look identical:
 *  - diameter: `size-[26px] md:size-[30px]`
 *  - font size: `body-text` (15px base / 19px at `lg`)
 *  - vertical text nudge: `translate-y-[1.35px]`
 */
export type MapPointMarkerDimensions = {
  diameterPx: number;
  fontSizePx: number;
  textOffsetYPx: number;
};

/**
 * Print badge metrics for `RoundedNumber` `size="print"` and route-print JPG
 * canvas dots. Edit here to keep list + map markers matched on the A4 sheet.
 */
export const PRINT_ROUNDED_NUMBER = {
  diameterPx: 72,
  fontSizePx: 42, // ~72 * (15/26), same optical fill as map UI badges
  textOffsetYPx: 1,
  fontFamily: "Lausanne, sans-serif",
} as const;

const MOBILE_DIMENSIONS: MapPointMarkerDimensions = {
  diameterPx: 26,
  fontSizePx: 15,
  textOffsetYPx: 1.35,
};

const TABLET_DIMENSIONS: MapPointMarkerDimensions = {
  diameterPx: 30,
  fontSizePx: 15,
  textOffsetYPx: 1.35,
};

const DESKTOP_DIMENSIONS: MapPointMarkerDimensions = {
  diameterPx: 30,
  fontSizePx: 19,
  textOffsetYPx: 1.35,
};

export const getMapPointMarkerVariant = (
  isMdScreen: boolean,
  isLgScreen: boolean
): MapPointMarkerVariant => {
  if (isLgScreen) return "desktop";
  if (isMdScreen) return "tablet";
  return "mobile";
};

export const getMapPointMarkerDimensions = (
  variant: MapPointMarkerVariant
): MapPointMarkerDimensions => {
  switch (variant) {
    case "mobile":
      return MOBILE_DIMENSIONS;
    case "tablet":
      return TABLET_DIMENSIONS;
    case "desktop":
      return DESKTOP_DIMENSIONS;
  }
};

const sanitizeMarkerLabelForImageId = (label: string): string =>
  label.trim().replace(/[^a-zA-Z0-9_-]/g, "_") || "empty";

export const getMapMarkerImageId = (
  type: MapPointMarkerType,
  label: string,
  variant: MapPointMarkerVariant
): string =>
  `map-marker-${variant}-${type}-${sanitizeMarkerLabelForImageId(label)}`;
