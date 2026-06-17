import type { MapInfoAPICall, RouteStep } from "@/schemas/mapSchema";
import type { IndividualRoute, RouteDot } from "@/schemas/routeSchema";

export const routeDotsToSteps = (
  dots: RouteDot[],
  mapInfoList: MapInfoAPICall[]
): RouteStep[] => {
  return dots.map((dot) => {
    const mapInfoId = dot.map_info_id || dot.map_info?.id || "";
    const mapInfo = mapInfoList.find((item) => item.id === mapInfoId);

    return {
      id: mapInfoId,
      user_id: dot.user_id,
      formatted_address:
        dot.map_info?.formatted_address ?? mapInfo?.formatted_address ?? "",
      latitude: mapInfo?.latitude ?? null,
      longitude: mapInfo?.longitude ?? null,
      no_address: mapInfo?.no_address ?? false,
      display_name: dot.route_dot_name || mapInfo?.display_name || "",
      route_step: dot.route_step,
    };
  });
};

export const buildHubIdByMapInfoId = (
  route: IndividualRoute
): Map<string, string | null> => {
  const map = new Map<string, string | null>();
  route.route_dots.forEach((dot) => {
    const mapInfoId = dot.map_info_id || dot.map_info?.id || "";
    if (mapInfoId) {
      map.set(mapInfoId, dot.hub_id);
    }
  });
  return map;
};
