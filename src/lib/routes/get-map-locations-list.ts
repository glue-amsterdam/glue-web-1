import { getParticipantDisplayName } from "@/lib/participants/get-participant-display-name";
import type { MapInfoAPICall } from "@/schemas/mapSchema";
import { createClient } from "@/utils/supabase/server";

export const getMapLocationsList = async (): Promise<MapInfoAPICall[]> => {
  const supabase = await createClient();

  const { data: mapData, error: mapError } = await supabase
    .from("map_info")
    .select("*")
    .eq("no_address", false);

  if (mapError) {
    console.error("getMapLocationsList map_info:", mapError);
    return [];
  }

  if (!mapData?.length) {
    return [];
  }

  const userIds = mapData.map((item) => item.user_id);

  const { data: tourStatus, error: tourStatusError } = await supabase
    .from("tour_status")
    .select("current_tour_status")
    .single();

  if (tourStatusError) {
    console.error("getMapLocationsList tour_status:", tourStatusError);
  }

  const currentTourStatus = tourStatus?.current_tour_status || "new";

  let participantQuery = supabase
    .from("participant_details")
    .select("user_id, status, is_active, display_name")
    .in("user_id", userIds)
    .eq("status", "accepted");

  if (currentTourStatus === "new") {
    participantQuery = participantQuery.eq("is_active", true);
  } else if (currentTourStatus === "older") {
    participantQuery = participantQuery.eq("was_active_last_year", true);
  }

  const { data: participantDetails, error: participantError } =
    await participantQuery;

  if (participantError) {
    console.error("getMapLocationsList participant_details:", participantError);
    return [];
  }

  const participantByUserId = new Map(
    (participantDetails ?? []).map((participant) => [
      participant.user_id,
      participant,
    ])
  );
  const acceptedUserIds = new Set(participantByUserId.keys());

  const { data: hubsData, error: hubsError } = await supabase
    .from("hubs")
    .select("hub_host_id, name");

  if (hubsError) {
    console.error("getMapLocationsList hubs:", hubsError);
  }

  return mapData
    .filter((mapInfo) => acceptedUserIds.has(mapInfo.user_id))
    .map((mapInfo) => {
      const participant = participantByUserId.get(mapInfo.user_id);
      const hubInfo = (hubsData ?? []).find(
        (hub) => hub.hub_host_id === mapInfo.user_id
      );

      return {
        id: mapInfo.id,
        user_id: mapInfo.user_id,
        formatted_address: mapInfo.formatted_address,
        latitude: mapInfo.latitude,
        longitude: mapInfo.longitude,
        no_address: mapInfo.no_address ?? false,
        display_name: hubInfo
          ? hubInfo.name
          : participant
            ? getParticipantDisplayName(participant)
            : "Unknown User",
      };
    });
};
