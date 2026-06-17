import { createClient } from "@/utils/supabase/server";

export type HubHostProfile = {
  user_id: string;
  user_name: string | null;
  visible_emails: string[] | null;
};

export const formatHubHostName = (host: HubHostProfile): string =>
  host.user_name?.trim() ||
  host.visible_emails?.[0] ||
  host.user_id;

export const getHubHostProfiles = async (
  hostIds: string[]
): Promise<Map<string, HubHostProfile>> => {
  if (!hostIds.length) {
    return new Map();
  }

  const supabase = await createClient();
  const uniqueIds = [...new Set(hostIds)];

  const { data, error } = await supabase
    .from("participant_details")
    .select("user_id, display_name, visible_emails")
    .in("user_id", uniqueIds);

  if (error) {
    console.error("getHubHostProfiles:", error);
    return new Map();
  }

  return new Map(
    (data ?? []).map((row) => [
      row.user_id,
      {
        user_id: row.user_id,
        user_name: row.display_name?.trim() || null,
        visible_emails: row.visible_emails,
      },
    ])
  );
};

export const getHubHostProfile = async (
  hostId: string
): Promise<HubHostProfile> => {
  const profiles = await getHubHostProfiles([hostId]);

  return (
    profiles.get(hostId) ?? {
      user_id: hostId,
      user_name: null,
      visible_emails: [],
    }
  );
};
