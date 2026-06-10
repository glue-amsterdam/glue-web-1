import type { HubApiCall } from "@/schemas/hubSchemas";
import { getHubHostProfile } from "@/lib/hubs/get-hub-host-profiles";
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

  const hostUser = await getHubHostProfile(hub.hub_host_id);

  return {
    id: hub.id,
    name: hub.name,
    description: hub.description ?? "",
    display_number: hub.display_number,
    hub_host: {
      user_id: hostUser.user_id,
      user_name: hostUser.user_name ?? undefined,
      visible_emails: hostUser.visible_emails,
    },
    participants: hub.participants ?? [],
  };
};
