import type { SupabaseClient } from "@supabase/supabase-js";
import {
  mapPostWithMediaFromRow,
  mapPublicPostSummaryFromRow,
} from "./map-post-row";
import type { PublicPostSummaryData, PostWithMediaData } from "./types";

export const fetchPublishedPostSummaries = async (
  supabase: SupabaseClient
): Promise<PublicPostSummaryData[]> => {
  const { data, error } = await supabase
    .from("posts")
    .select(
      "id, title, slug, status, author, keywords, content_html, created_at, updated_at"
    )
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapPublicPostSummaryFromRow);
};

export const fetchPublishedPostBySlug = async (
  supabase: SupabaseClient,
  slug: string
): Promise<PostWithMediaData | null> => {
  const { data: post, error: postError } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
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
    .eq("post_id", post.id)
    .order("created_at", { ascending: true });

  if (mediaError) {
    throw mediaError;
  }

  return mapPostWithMediaFromRow(post, media ?? []);
};

export const fetchPublishedPostSlugs = async (
  supabase: SupabaseClient
): Promise<string[]> => {
  const { data, error } = await supabase
    .from("posts")
    .select("slug")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => row.slug);
};
