import type { HubApiCall } from "@/schemas/hubSchemas";
import { createClient } from "@/utils/supabase/server";

export const getHubById = async (
  hubId: string
): Promise<HubApiCall | null> => {
  const supabase = await createClient();

  const { data: hub, error } = await supabase
    .from("hubs")
    .select(
      `
        id,
        name,
        description,
        hub_host_id,
        display_number,
        participants: hub_participants (user_id)
      `
    )
    .eq("id", hubId)
    .maybeSingle();

  if (error) {
    console.error("getHubById:", error);
    return null;
  }

  if (!hub) {
    return null;
  }

  const { data: hostUser, error: hostError } = await supabase
    .from("user_info")
    .select("user_id, user_name, visible_emails")
    .eq("user_id", hub.hub_host_id)
    .maybeSingle();

  if (hostError) {
    console.error("getHubById host user:", hostError);
  }

  return {
    id: hub.id,
    name: hub.name,
    description: hub.description ?? "",
    display_number: hub.display_number,
    hub_host: hostUser ?? {
      user_id: hub.hub_host_id,
      user_name: undefined,
      visible_emails: [],
    },
    participants: hub.participants ?? [],
  };
};
