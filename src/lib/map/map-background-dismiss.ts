export type MapBackgroundDismissAction =
  | "clear-stop"
  | "clear-location"
  | "clear-route"
  | "noop";

export const resolveMapBackgroundDismissAction = ({
  selectedLocation,
  selectedRoute,
  activeRouteStopId,
}: {
  selectedLocation: string | null;
  selectedRoute: string | null;
  activeRouteStopId: string | null;
}): MapBackgroundDismissAction => {
  if (activeRouteStopId) return "clear-stop";
  if (selectedLocation) return "clear-location";
  if (selectedRoute) return "clear-route";
  return "noop";
};
