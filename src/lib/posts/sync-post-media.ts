import type { SupabaseClient } from "@supabase/supabase-js";
import { deleteStoredMediaUrls } from "@/lib/admin/delete-stored-media-url";
import {
  collectMediaUrlsFromHtml,
  extractMediaFromHtml,
} from "./extract-media-from-html";

type PostMediaRow = {
  image_url: string | null;
  video_url: string | null;
};

export const collectPostMediaUrls = (rows: PostMediaRow[]): string[] => {
  return rows
    .map((row) => row.image_url ?? row.video_url)
    .filter((url): url is string => Boolean(url));
};

export const syncPostMedia = async (
  supabase: SupabaseClient,
  postId: string,
  contentHtml: string,
  previousMediaRows: PostMediaRow[]
): Promise<void> => {
  const extracted = extractMediaFromHtml(contentHtml);
  const previousUrls = collectPostMediaUrls(previousMediaRows);
  const nextUrls = collectMediaUrlsFromHtml(contentHtml);

  const orphanedUrls = previousUrls.filter((url) => !nextUrls.includes(url));

  const { error: deleteError } = await supabase
    .from("post_media")
    .delete()
    .eq("post_id", postId);

  if (deleteError) {
    throw deleteError;
  }

  if (extracted.length > 0) {
    const rows = extracted.map((item) => ({
      post_id: postId,
      image_url: item.imageUrl,
      video_url: item.videoUrl,
      width: item.width,
      height: item.height,
      max_width: item.maxWidth,
      max_height: item.maxHeight,
    }));

    const { error: insertError } = await supabase.from("post_media").insert(rows);

    if (insertError) {
      throw insertError;
    }
  }

  if (orphanedUrls.length > 0) {
    await deleteStoredMediaUrls(supabase, orphanedUrls);
  }
};
