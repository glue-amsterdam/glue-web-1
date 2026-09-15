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
} as const;
