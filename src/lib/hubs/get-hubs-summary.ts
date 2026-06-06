import { createClient } from "@/utils/supabase/server";

export type HubSummary = {
  id: string;
  name: string;
  hostName: string;
  participantCount: number;
};

const formatHostName = (user: {
  user_id: string;
  user_name: string | null;
  visible_emails: string[] | null;
}): string => {
  return (
    user.user_name ||
    user.visible_emails?.[0] ||
    user.user_id
  );
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

  const { data: hostUsers, error: hostError } = await supabase
    .from("user_info")
    .select("user_id, user_name, visible_emails")
    .in("user_id", hostIds);

  if (hostError) {
    console.error("getHubsSummary host users:", hostError);
  }

  const hostUserMap = new Map(
    (hostUsers ?? []).map((user) => [user.user_id, user])
  );

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
      hostName: formatHostName(host),
      participantCount: hub.participants?.length ?? 0,
    };
  });
};
