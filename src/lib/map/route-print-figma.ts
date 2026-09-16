/**
 * Figma A4 artboard (~300dpi). Design the print template in these px 1:1;
 * {@link RoutePrintSheet} scales the canvas down to CSS A4 (210×297mm).
 */
export const ROUTE_PRINT_FIGMA = {
  width: 2470,
  height: 3494,
  paddingX: 120,
  paddingY: 80,
  /** Content-width map slot (artboard width − horizontal padding × 2). */
  mapWidth: 2230,
  mapHeight: 1175,
  /** Map yields height when description + stops need room. */
  mapMinHeight: 650,
  /** Floor for primary-page stops block (5 rows + gaps + wrap under 25%). */
  stopsMinHeight: 1050,
  /** Cap stop name/address width (~¼ content / 4-col grid) so long copy wraps. */
  stopTextMaxWidth: Math.round(2230 / 4),
} as const;

/** Figma width → CSS A4 width (210mm at 96dpi). Unitless for cross-browser `scale()`. */
export const ROUTE_PRINT_SCALE =
  ((210 / 25.4) * 96) / ROUTE_PRINT_FIGMA.width;
