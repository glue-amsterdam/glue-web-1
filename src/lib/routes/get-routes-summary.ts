import { resolveRouteZoneName } from "@/lib/routes/resolve-route-zone-name";
import { createClient } from "@/utils/supabase/server";

export type RouteSummary = {
  id: string;
  name: string;
  zone: string | null;
  stopCount: number;
};

export const getRoutesSummary = async (): Promise<RouteSummary[]> => {
  const supabase = await createClient();

  const { data: routes, error } = await supabase
    .from("routes")
    .select(
      "id, name, route_zone_id, route_zones(name), route_dots(route_step)"
    )
    .order("name");

  if (error) {
    console.error("getRoutesSummary:", error);
    return [];
  }

  return (routes ?? []).map((route) => ({
    id: route.id,
    name: route.name,
    zone: resolveRouteZoneName(route.route_zones),
    stopCount: route.route_dots?.length ?? 0,
  }));
};
