import { config } from "@/config";
import type { SupabaseClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
import { PUBLIC_MEDIA_CACHE_REVALIDATE_SECONDS } from "@/lib/media/public-media-cache";
import { createPublicSupabaseClient } from "@/utils/supabase/public";

export const PARTICIPANT_PLACEHOLDER_PATH = "participant-placeholder.jpg";
export const PARTICIPANT_PLACEHOLDER_CACHE_TAG = "participant-placeholder";

const getParticipantPlaceholderPublicUrl = (
  supabase: SupabaseClient
): string => {
  return supabase.storage
    .from(config.bucketName)
    .getPublicUrl(PARTICIPANT_PLACEHOLDER_PATH).data.publicUrl;
};

const fetchParticipantPlaceholderVersion = async (): Promise<string | null> => {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase.storage
    .from(config.bucketName)
    .list("", {
      search: PARTICIPANT_PLACEHOLDER_PATH,
      limit: 1,
    });

  if (error) {
    console.error("Failed to fetch participant placeholder version:", error);
    return null;
  }

  const file = data?.find((item) => item.name === PARTICIPANT_PLACEHOLDER_PATH);
  if (!file) {
    return null;
  }

  return file.updated_at ?? file.created_at ?? null;
};

const appendPlaceholderVersion = (
  publicUrl: string,
  version: string | null
): string => {
  const cacheBust = version ?? String(Date.now());
  return `${publicUrl}?v=${encodeURIComponent(cacheBust)}`;
};

const fetchParticipantPlaceholderVersionCached = unstable_cache(
  fetchParticipantPlaceholderVersion,
  [PARTICIPANT_PLACEHOLDER_CACHE_TAG],
  {
    tags: [PARTICIPANT_PLACEHOLDER_CACHE_TAG],
    revalidate: PUBLIC_MEDIA_CACHE_REVALIDATE_SECONDS,
  }
);

export const getParticipantPlaceholderUrl = async (
  supabase: SupabaseClient
): Promise<string> => {
  const publicUrl = getParticipantPlaceholderPublicUrl(supabase);
  const version = await fetchParticipantPlaceholderVersionCached();
  return appendPlaceholderVersion(publicUrl, version);
};

/** Uncached URL with a fresh cache-bust for admin preview right after upload. */
export const getParticipantPlaceholderUrlFresh = async (
  supabase: SupabaseClient
): Promise<string> => {
  const publicUrl = getParticipantPlaceholderPublicUrl(supabase);
  return appendPlaceholderVersion(publicUrl, String(Date.now()));
};
