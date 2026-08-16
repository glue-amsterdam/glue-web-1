import type { MapInfoAPICall, RouteStep } from "@/schemas/mapSchema";
import type { IndividualRoute, RouteDot } from "@/schemas/routeSchema";

export const withRenumberedSteps = (dots: RouteStep[]): RouteStep[] =>
  dots.map((dot, index) => ({ ...dot, route_step: index + 1 }));

export const reorderRouteSteps = (
  dots: RouteStep[],
  fromIndex: number,
  toIndex: number
): RouteStep[] => {
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= dots.length ||
    toIndex >= dots.length
  ) {
    return dots;
  }

  const next = [...dots];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return withRenumberedSteps(next);
};

export const routeDotsToSteps = (
  dots: RouteDot[],
  mapInfoList: MapInfoAPICall[]
): RouteStep[] => {
  const mapInfoById = new Map(mapInfoList.map((item) => [item.id, item]));

  return [...dots]
    .sort((a, b) => a.route_step - b.route_step)
    .map((dot) => {
      const mapInfoId = dot.map_info_id || dot.map_info?.id || "";
      const mapInfo = mapInfoById.get(mapInfoId);

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
