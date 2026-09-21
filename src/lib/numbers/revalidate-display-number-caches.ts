import type { SupabaseClient } from "@supabase/supabase-js";
import { revalidateParticipantVisibilityCaches } from "@/lib/participants/revalidate-participant-visibility-caches";
import { revalidateProgramCacheIfLiveTour } from "@/lib/program/revalidate-program-cache";

export const revalidateDisplayNumberCaches = async (
  supabase: SupabaseClient
): Promise<void> => {
  await revalidateParticipantVisibilityCaches(supabase);
  await revalidateProgramCacheIfLiveTour(supabase);
};
