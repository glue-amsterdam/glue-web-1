import type { SupabaseClient } from "@supabase/supabase-js";

export type EventLocation = {
  id: string;
  formatted_address: string;
};

export type AvailableEventLocations = {
  userLocations: EventLocation[];
  hubLocations: EventLocation[];
};

export const getAvailableEventLocations = async (
  supabase: SupabaseClient,
  userId: string
): Promise<AvailableEventLocations> => {
  const { data: userLocations, error: userLocationsError } = await supabase
    .from("map_info")
    .select("id, formatted_address")
    .eq("user_id", userId);

  if (userLocationsError) {
    throw userLocationsError;
  }

  const { data: hubParticipants, error: hubParticipantsError } =
    await supabase
      .from("hub_participants")
      .select("hub_id")
      .eq("user_id", userId);

  if (hubParticipantsError) {
    throw hubParticipantsError;
  }

  const hubIds = (hubParticipants ?? []).map((participant) => participant.hub_id);

  if (hubIds.length === 0) {
    return {
      userLocations: userLocations ?? [],
      hubLocations: [],
    };
  }

  const { data: hubs, error: hubsError } = await supabase
    .from("hubs")
    .select("hub_host_id")
    .in("id", hubIds);

  if (hubsError) {
    throw hubsError;
  }

  const hostIds = (hubs ?? []).map((hub) => hub.hub_host_id);

  if (hostIds.length === 0) {
    return {
      userLocations: userLocations ?? [],
      hubLocations: [],
    };
  }

  const { data: hubLocations, error: hubLocationsError } = await supabase
    .from("map_info")
    .select("id, formatted_address")
    .in("user_id", hostIds);

  if (hubLocationsError) {
    throw hubLocationsError;
  }

  return {
    userLocations: userLocations ?? [],
    hubLocations: hubLocations ?? [],
  };
};

export const getAllAvailableEventLocations = (
  locations: AvailableEventLocations
): EventLocation[] => [...locations.userLocations, ...locations.hubLocations];
