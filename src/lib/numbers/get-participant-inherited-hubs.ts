import type { SupabaseClient } from "@supabase/supabase-js";
import type { InheritedHubOption } from "./pick-inherited-hub";

export const getParticipantInheritedHubs = async (
  supabase: SupabaseClient,
  userId: string
): Promise<InheritedHubOption[]> => {
  const [hostedResult, memberResult] = await Promise.all([
    supabase
      .from("hubs")
      .select("id, name, display_number, hub_host_id")
      .eq("hub_host_id", userId),
    supabase
      .from("hub_participants")
      .select("hub_id, hubs (id, name, display_number, hub_host_id)")
      .eq("user_id", userId),
  ]);

  if (hostedResult.error) {
    console.error("getParticipantInheritedHubs hosted:", hostedResult.error);
  }
  if (memberResult.error) {
    console.error("getParticipantInheritedHubs members:", memberResult.error);
  }

  const hubsById = new Map<string, InheritedHubOption>();

  const addHub = (hub: {
    id: string;
    name: string;
    display_number: string | null;
    hub_host_id: string;
  }) => {
    hubsById.set(hub.id, {
      hubId: hub.id,
      name: hub.name,
      displayNumber: hub.display_number,
      type: "hub",
      isHost: hub.hub_host_id === userId,
      hubHostUserId: hub.hub_host_id,
    });
  };

  for (const hub of hostedResult.data ?? []) {
    addHub(hub);
  }

  for (const row of memberResult.data ?? []) {
    const hub = Array.isArray(row.hubs) ? row.hubs[0] : row.hubs;
    if (!hub) continue;
    const existing = hubsById.get(hub.id);
    addHub({
      ...hub,
      hub_host_id: existing?.isHost ? userId : hub.hub_host_id,
    });
    if (existing?.isHost) {
      const current = hubsById.get(hub.id);
      if (current) current.isHost = true;
    }
  }

  return Array.from(hubsById.values());
};
