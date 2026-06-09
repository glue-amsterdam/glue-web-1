import { unstable_cache } from "next/cache";
import { createPublicSupabaseClient } from "@/utils/supabase/public";
import {
  fetchPublishedPostBySlug,
  fetchPublishedPostSlugs,
  fetchPublishedPostSummaries,
} from "./fetch-public-post";
import {
  mapPublicPostSummaryToApiResponse,
  mapPublicPostWithMediaToApiResponse,
} from "./map-post-row";
import { POSTS_CACHE_TAG } from "./revalidate-posts-cache";
import type { PublicPostSummaryData } from "./types";
import type { PublicPost, PublicPostSummary } from "@/schemas/postSchema";

const getCachedPublishedPostSummariesData = (): Promise<
  PublicPostSummaryData[]
> =>
  unstable_cache(
    async (): Promise<PublicPostSummaryData[]> => {
      const supabase = createPublicSupabaseClient();
      return fetchPublishedPostSummaries(supabase);
    },
    [POSTS_CACHE_TAG, "published-summaries"],
    {
      tags: [POSTS_CACHE_TAG],
      revalidate: false,
    }
  )();

export const getCachedPublishedPosts = async (): Promise<PublicPostSummary[]> => {
  const summaries = await getCachedPublishedPostSummariesData();
  return summaries.map(mapPublicPostSummaryToApiResponse);
};

export const getCachedPublishedPostBySlug = (
  slug: string
): Promise<PublicPost | null> =>
  unstable_cache(
    async (): Promise<PublicPost | null> => {
      const supabase = createPublicSupabaseClient();
      const post = await fetchPublishedPostBySlug(supabase, slug);

      if (!post) {
        return null;
      }

      return mapPublicPostWithMediaToApiResponse(post);
    },
    [POSTS_CACHE_TAG, "published-post", slug],
    {
      tags: [POSTS_CACHE_TAG],
      revalidate: false,
    }
  )();

export const getCachedPublishedPostSlugs = (): Promise<string[]> =>
  unstable_cache(
    async (): Promise<string[]> => {
      const supabase = createPublicSupabaseClient();
      return fetchPublishedPostSlugs(supabase);
    },
    [POSTS_CACHE_TAG, "published-slugs"],
    {
      tags: [POSTS_CACHE_TAG],
      revalidate: false,
    }
  )();
