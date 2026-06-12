import type { SupabaseClient } from "@supabase/supabase-js";

export type HubHostContext = {
  isHubHost: boolean;
  hostedLocationIds: string[];
  hubIds: string[];
};

export const getHubHostContext = async (
  supabase: SupabaseClient,
  userId: string,
): Promise<HubHostContext> => {
  const { data: hubs, error: hubsError } = await supabase
    .from("hubs")
    .select("id")
    .eq("hub_host_id", userId);

  if (hubsError) {
    console.error("getHubHostContext hubs:", hubsError);
    return { isHubHost: false, hostedLocationIds: [], hubIds: [] };
  }

  const hubIds = (hubs ?? []).map((hub) => hub.id as string);
  if (hubIds.length === 0) {
    return { isHubHost: false, hostedLocationIds: [], hubIds: [] };
  }

  const { data: mapInfoRows, error: mapInfoError } = await supabase
    .from("map_info")
    .select("id")
    .eq("user_id", userId);

  if (mapInfoError) {
    console.error("getHubHostContext map_info:", mapInfoError);
    return { isHubHost: true, hostedLocationIds: [], hubIds };
  }

  return {
    isHubHost: true,
    hostedLocationIds: (mapInfoRows ?? []).map((row) => row.id as string),
    hubIds,
  };
};

export const isHubHostForLocation = async (
  supabase: SupabaseClient,
  userId: string,
  locationId: string,
): Promise<boolean> => {
  const context = await getHubHostContext(supabase, userId);
  if (!context.isHubHost) return false;
  return context.hostedLocationIds.includes(locationId);
};
