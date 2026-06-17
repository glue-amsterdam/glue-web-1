import { config } from "@/config";
import type { SupabaseClient } from "@supabase/supabase-js";

const PARTICIPANT_PLACEHOLDER_PATH = "participant-placeholder.jpg";

export const getParticipantPlaceholderUrl = (
  supabase: SupabaseClient
): string => {
  return supabase.storage
    .from(config.bucketName)
    .getPublicUrl(PARTICIPANT_PLACEHOLDER_PATH).data.publicUrl;
};
