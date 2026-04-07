import type { MapInfo, Route } from "@/app/hooks/useMapData";
import { markerColors } from "@/app/map/legend-config";

export type RouteStopDisplay = {
  dotId: string;
  longitude: number;
  latitude: number;
  label: string;
  backgroundColor: string;
  color: string;
  userName: string;
  addressLine: string;
};

const sortedRouteDots = (route: Route) =>
  [...route.dots].sort((a, b) => a.route_step - b.route_step);

export const getRouteStopsForDisplay = (
  route: Route,
  mapInfo: MapInfo[],
): RouteStopDisplay[] => {
  const dots = sortedRouteDots(route);

  return dots.map((dot, index) => {
    const location = mapInfo.find((loc) =>
      loc.participants.some((p) => p.user_name === dot.user_name),
    );

    const displayNumber = location
      ? location.hub_display_number ||
        location.display_number ||
        location.participants[0]?.display_number
      : null;

    const hasDisplayNumber = !!displayNumber;

    const isHub =
      location?.is_hub ||
      (location?.participants && location.participants.length >= 3);
    const isSpecialProgram = location?.is_special_program;

    let backgroundColor: string;
    let color: string;

    if (hasDisplayNumber) {
      if (isHub) {
        backgroundColor = markerColors.hub.hex;
        color = "#ffffff";
      } else if (isSpecialProgram) {
        backgroundColor = markerColors.specialProgram.hex;
        color = "#ffffff";
      } else {
        backgroundColor = markerColors.participant.hex;
        color = "#000000";
      }
    } else {
      backgroundColor = markerColors.route.hex;
      color = "#ffffff";
    }

    const label = hasDisplayNumber ? String(displayNumber) : String(index + 1);

    const addressLine = dot.formatted_address.split(",")[0]?.trim() ?? "";

    return {
      dotId: dot.id,
      longitude: dot.longitude,
      latitude: dot.latitude,
      label,
      backgroundColor,
      color,
      userName: dot.user_name,
      addressLine,
    };
  });
};
