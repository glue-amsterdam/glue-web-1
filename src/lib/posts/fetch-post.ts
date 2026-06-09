import type { SupabaseClient } from "@supabase/supabase-js";
import {
  mapPostSummaryFromRow,
  mapPostWithMediaFromRow,
} from "./map-post-row";
import type { PostSummaryData, PostWithMediaData } from "./types";

export const fetchPostSummaries = async (
  supabase: SupabaseClient
): Promise<PostSummaryData[]> => {
  const { data, error } = await supabase
    .from("posts")
    .select("id, title, status, created_at, slug, author, keywords, content_html, updated_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapPostSummaryFromRow);
};

export const fetchPostById = async (
  supabase: SupabaseClient,
  id: string
): Promise<PostWithMediaData | null> => {
  const { data: post, error: postError } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (postError) {
    throw postError;
  }

  if (!post) {
    return null;
  }

  const { data: media, error: mediaError } = await supabase
    .from("post_media")
    .select("*")
    .eq("post_id", id)
    .order("created_at", { ascending: true });

  if (mediaError) {
    throw mediaError;
  }

  return mapPostWithMediaFromRow(post, media ?? []);
};
