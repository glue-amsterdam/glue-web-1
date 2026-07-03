import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchPublishedPostSummariesPage } from "./fetch-public-post";
import { mapPublicPostSummaryToApiResponse } from "./map-post-row";
import type { ParsedPostsQuery, PostsPageResponse } from "./posts-types";

export const getPostsPage = async (
  supabase: SupabaseClient,
  query: ParsedPostsQuery,
): Promise<PostsPageResponse> => {
  const { items, total } = await fetchPublishedPostSummariesPage(
    supabase,
    query.limit,
    query.offset,
  );

  const pageItems = items.map(mapPublicPostSummaryToApiResponse);
  const loadedCount = query.offset + pageItems.length;

  return {
    items: pageItems,
    total,
    limit: query.limit,
    offset: query.offset,
    hasMore: loadedCount < total,
  };
};
