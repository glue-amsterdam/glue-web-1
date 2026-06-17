import type { SupabaseClient } from "@supabase/supabase-js";
import { getParticipantDisplayName } from "@/lib/participants/get-participant-display-name";
import { resolveRouteZoneName } from "@/lib/routes/resolve-route-zone-name";
import type { MapRoute } from "./types";
import { ensureArray, getAddressLine } from "./utils";

type RouteRow = {
  id: string;
  name: string;
  description: string | null;
  route_zone_id: string | null;
  route_zones: { name: string } | { name: string }[] | null;
};

type RouteDotRow = {
  id: string;
  route_id: string;
  map_info_id: string;
  route_step: number;
  user_id: string;
  hub_id: string | null;
  map_info:
    | {
        id: string;
        latitude: number;
        longitude: number;
        formatted_address: string;
      }
    | {
        id: string;
        latitude: number;
        longitude: number;
        formatted_address: string;
      }[];
  hubs: { name: string } | { name: string }[] | null;
};

export const fetchMapRoutes = async (
  supabase: SupabaseClient
): Promise<MapRoute[]> => {
  const [routesResult, routeDotsResult] = await Promise.all([
    supabase
      .from("routes")
      .select("id, name, description, route_zone_id, route_zones(name)"),
    supabase
      .from("route_dots")
      .select(
        `
        id,
        route_id,
        map_info_id,
        route_step,
        user_id,
        hub_id,
        map_info (
          id,
          latitude,
          longitude,
          formatted_address
        ),
        hubs (
          name
        )
      `
      )
      .order("route_step"),
  ]);

  if (routesResult.error) throw routesResult.error;
  if (routeDotsResult.error) throw routeDotsResult.error;

  const routes = (routesResult.data as RouteRow[]) ?? [];
  const routeDots = (routeDotsResult.data as RouteDotRow[]) ?? [];

  const routeDotUserIds = new Set(
    routeDots.filter((dot) => !dot.hub_id).map((dot) => dot.user_id)
  );

  const routeDotParticipants =
    routeDotUserIds.size > 0
      ? await supabase
          .from("participant_details")
          .select("user_id, display_name")
          .in("user_id", Array.from(routeDotUserIds))
      : { data: [], error: null };

  if (routeDotParticipants.error) throw routeDotParticipants.error;

  const displayNameById = new Map<string, string>();
  routeDotParticipants.data?.forEach((participant) => {
    displayNameById.set(
      participant.user_id,
      getParticipantDisplayName(participant)
    );
  });

  return routes.map((route) => ({
    id: route.id,
    name: route.name,
    description: route.description,
    zone: resolveRouteZoneName(route.route_zones) ?? "",
    dots: routeDots
      .filter((dot) => dot.route_id === route.id)
      .map((dot) => {
        const mapInfo = ensureArray(dot.map_info)[0];
        const hubName = dot.hub_id
          ? ensureArray(dot.hubs)[0]?.name
          : undefined;
        const name =
          hubName ?? displayNameById.get(dot.user_id) ?? "Unknown";

        return {
          id: dot.id,
          routeStep: dot.route_step,
          latitude: mapInfo.latitude,
          longitude: mapInfo.longitude,
          addressLine: getAddressLine(mapInfo.formatted_address),
          name,
          mapInfoId: dot.map_info_id,
        };
      })
      .sort((a, b) => a.routeStep - b.routeStep),
  }));
};
