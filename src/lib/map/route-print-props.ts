import type { RouteStopDisplay } from "@/lib/map/route-stop-display";

export type RoutePrintProps = {
  routeName: string;
  routeDescription?: string;
  mapImageDataUrl: string;
  stops: RouteStopDisplay[];
  primaryColor: string;
  logoSrc: string;
  /** Site footer_left label (event dates); empty when unset. */
  headerText: string;
  /** Site footer_right label (tagline); empty when unset. */
  footerText: string;
};
