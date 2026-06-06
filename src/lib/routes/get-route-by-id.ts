import { getParticipantDisplayName } from "@/lib/participants/get-participant-display-name";
import { resolveRouteZoneName } from "@/lib/routes/resolve-route-zone-name";
import type { IndividualRoute } from "@/schemas/routeSchema";
import { createClient } from "@/utils/supabase/server";

export const getRouteById = async (
  routeId: string
): Promise<IndividualRoute | null> => {
  const supabase = await createClient();

  const { data: routeData, error: routeError } = await supabase
    .from("routes")
    .select(
      `
        id,
        name,
        description,
        route_zone_id,
        route_zones(name),
        route_dots (
          id,
          route_step,
          user_id,
          hub_id,
          map_info:map_info_id (
            id,
            formatted_address
          )
        )
      `
    )
    .eq("id", routeId)
    .maybeSingle();

  if (routeError) {
    console.error("getRouteById:", routeError);
    return null;
  }

  if (!routeData) {
    return null;
  }

  const { data: hubsData, error: hubsError } = await supabase
    .from("hubs")
    .select("id, name");

  if (hubsError) {
    console.error("getRouteById hubs:", hubsError);
  }

  const routeDotUserIds = [
    ...new Set(
      routeData.route_dots
        .filter((dot) => !dot.hub_id)
        .map((dot) => dot.user_id)
    ),
  ];

  const { data: participantData, error: participantError } =
    routeDotUserIds.length > 0
      ? await supabase
          .from("participant_details")
          .select("user_id, display_name")
          .in("user_id", routeDotUserIds)
      : { data: [], error: null };

  if (participantError) {
    console.error("getRouteById participant_details:", participantError);
  }

  const hubMap = new Map((hubsData ?? []).map((hub) => [hub.id, hub.name]));
  const displayNameById = new Map(
    (participantData ?? []).map((participant) => [
      participant.user_id,
      getParticipantDisplayName(participant),
    ])
  );

  const processedRouteDots = routeData.route_dots.map((dot) => ({
    ...dot,
    map_info_id: dot.map_info?.id ?? "",
    route_dot_name: dot.hub_id
      ? hubMap.get(dot.hub_id) || "Unknown Hub"
      : displayNameById.get(dot.user_id) || "Unknown User",
  }));

  return {
    id: routeData.id,
    name: routeData.name,
    description: routeData.description ?? "",
    route_zone_id: routeData.route_zone_id,
    zone: resolveRouteZoneName(routeData.route_zones),
    route_dots: processedRouteDots,
  };
};
