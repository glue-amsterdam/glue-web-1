import type { SupabaseClient } from "@supabase/supabase-js";

export const parseStoredMediaUrl = (
  url: string
): { bucket: string; path: string } | null => {
  if (!url) {
    return null;
  }

  const marker = "/storage/v1/object/public/";
  const markerIndex = url.indexOf(marker);
  if (markerIndex === -1) {
    return null;
  }

  const bucketAndPath = url.slice(markerIndex + marker.length);
  const firstSlashIndex = bucketAndPath.indexOf("/");
  if (firstSlashIndex === -1) {
    return null;
  }

  return {
    bucket: bucketAndPath.slice(0, firstSlashIndex),
    path: bucketAndPath.slice(firstSlashIndex + 1),
  };
};

export const deleteStoredMediaUrl = async (
  supabase: SupabaseClient,
  url: string | null | undefined
): Promise<void> => {
  if (!url) {
    return;
  }

  const parsed = parseStoredMediaUrl(url);
  if (!parsed) {
    return;
  }

  const { error } = await supabase.storage
    .from(parsed.bucket)
    .remove([parsed.path]);

  if (error) {
    console.warn("[delete-stored-media] Failed to delete:", url, error);
  }
};

export const deleteStoredMediaUrls = async (
  supabase: SupabaseClient,
  urls: Array<string | null | undefined>
): Promise<void> => {
  await Promise.all(urls.map((url) => deleteStoredMediaUrl(supabase, url)));
};
