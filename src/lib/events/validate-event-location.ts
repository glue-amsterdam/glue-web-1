import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getAllAvailableEventLocations,
  getAvailableEventLocations,
} from "@/lib/events/get-available-event-locations";

export const validateEventLocation = async (
  supabase: SupabaseClient,
  userId: string,
  locationId: string
): Promise<boolean> => {
  const locations = await getAvailableEventLocations(supabase, userId);
  const allLocations = getAllAvailableEventLocations(locations);

  return allLocations.some((location) => location.id === locationId);
};
