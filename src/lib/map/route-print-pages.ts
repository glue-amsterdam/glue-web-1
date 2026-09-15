import type { RouteStopDisplay } from "@/lib/map/route-stop-display";

/** Every page uses the same stop block: 4 cols × 5 rows. */
export const ROUTE_PRINT_STOPS_COLS = 4;
export const ROUTE_PRINT_STOPS_ROWS = 5;
export const ROUTE_PRINT_STOPS_PER_PAGE =
  ROUTE_PRINT_STOPS_COLS * ROUTE_PRINT_STOPS_ROWS;

export type RoutePrintPageKind = "primary" | "continuation";

export type RoutePrintPage = {
  kind: RoutePrintPageKind;
  stops: RouteStopDisplay[];
};

/** Chunks stops into 4×5 blocks (20 each). 60 stops → 3 pages. */
export const buildRoutePrintPages = (
  stops: RouteStopDisplay[]
): RoutePrintPage[] => {
  if (stops.length === 0) {
    return [{ kind: "primary", stops: [] }];
  }

  const pages: RoutePrintPage[] = [];
  for (let offset = 0; offset < stops.length; offset += ROUTE_PRINT_STOPS_PER_PAGE) {
    pages.push({
      kind: offset === 0 ? "primary" : "continuation",
      stops: stops.slice(offset, offset + ROUTE_PRINT_STOPS_PER_PAGE),
    });
  }
  return pages;
};
