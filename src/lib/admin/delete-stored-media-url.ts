import type { SupabaseClient } from "@supabase/supabase-js";
import { config } from "@/config";
import { toMediaKey } from "@/lib/media/media-url";

const deleteStoredMediaUrl = async (
  supabase: SupabaseClient,
  value: string | null | undefined
): Promise<void> => {
  // Stored values are now bucket-relative keys; toMediaKey also tolerates legacy
  // absolute URLs. Local assets (leading "/") resolve to themselves and are skipped.
  const key = toMediaKey(value);
  if (!key || key.startsWith("/") || /^https?:\/\//i.test(key)) {
    return;
  }

  const { error } = await supabase.storage
    .from(config.bucketName)
    .remove([key]);

  if (error) {
    console.warn("[delete-stored-media] Failed to delete:", value, error);
  }
};

export const deleteStoredMediaUrls = async (
  supabase: SupabaseClient,
  urls: Array<string | null | undefined>
): Promise<void> => {
  await Promise.all(urls.map((url) => deleteStoredMediaUrl(supabase, url)));
};
