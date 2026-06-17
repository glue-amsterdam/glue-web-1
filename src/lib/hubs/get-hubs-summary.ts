import {
  formatHubHostName,
  getHubHostProfiles,
} from "@/lib/hubs/get-hub-host-profiles";
import { createClient } from "@/utils/supabase/server";

export type HubSummary = {
  id: string;
  name: string;
  hostName: string;
  participantCount: number;
};

export const getHubsSummary = async (): Promise<HubSummary[]> => {
  const supabase = await createClient();

  const { data: hubs, error } = await supabase
    .from("hubs")
    .select(
      `
        id,
        name,
        hub_host_id,
        participants: hub_participants (user_id)
      `
    )
    .order("name");

  if (error) {
    console.error("getHubsSummary:", error);
    return [];
  }

  if (!hubs?.length) {
    return [];
  }

  const hostIds = [...new Set(hubs.map((hub) => hub.hub_host_id))];
  const hostUserMap = await getHubHostProfiles(hostIds);

  return hubs.map((hub) => {
    const host =
      hostUserMap.get(hub.hub_host_id) ?? {
        user_id: hub.hub_host_id,
        user_name: null,
        visible_emails: [],
      };

    return {
      id: hub.id,
      name: hub.name,
      hostName: formatHubHostName(host),
      participantCount: hub.participants?.length ?? 0,
    };
  });
};
