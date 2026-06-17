import { createClient } from "@/utils/supabase/server";

export type RouteZoneSummary = {
  id: string;
  name: string;
  routeCount: number;
};

export const getRouteZones = async (): Promise<RouteZoneSummary[]> => {
  const supabase = await createClient();

  const { data: zones, error: zonesError } = await supabase
    .from("route_zones")
    .select("id, name")
    .order("name");

  if (zonesError) {
    console.error("getRouteZones:", zonesError);
    return [];
  }

  const { data: routes, error: routesError } = await supabase
    .from("routes")
    .select("route_zone_id");

  if (routesError) {
    console.error("getRouteZones route counts:", routesError);
    return (zones ?? []).map((zone) => ({
      id: zone.id,
      name: zone.name,
      routeCount: 0,
    }));
  }

  const countByZoneId = new Map<string, number>();
  for (const route of routes ?? []) {
    if (!route.route_zone_id) continue;
    countByZoneId.set(
      route.route_zone_id,
      (countByZoneId.get(route.route_zone_id) ?? 0) + 1
    );
  }

  return (zones ?? []).map((zone) => ({
    id: zone.id,
    name: zone.name,
    routeCount: countByZoneId.get(zone.id) ?? 0,
  }));
};
