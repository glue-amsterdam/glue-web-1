/**
 * Figma A4 artboard (~300dpi). Design the print template in these px 1:1;
 * {@link RoutePrintSheet} scales the canvas down to CSS A4 (210×297mm).
 */
export const ROUTE_PRINT_FIGMA = {
  width: 2470,
  height: 3494,
  paddingX: 120,
  paddingY: 80,
  /** Primary-page description cap (Figma was 450; +100 when copy needs it). */
  descriptionMaxHeight: 550,
  /** Content-width map slot (artboard width − horizontal padding × 2). */
  mapWidth: 2230,
  mapHeight: 1175,
  /** Map can yield this much height when the description grows. */
  mapMinHeight: 1075,
} as const;

/** Figma width → CSS A4 width (210mm at 96dpi). Unitless for cross-browser `scale()`. */
export const ROUTE_PRINT_SCALE =
  ((210 / 25.4) * 96) / ROUTE_PRINT_FIGMA.width;
