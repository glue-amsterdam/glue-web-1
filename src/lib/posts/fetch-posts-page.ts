import { unstable_cache } from "next/cache";
import { createPublicSupabaseClient } from "@/utils/supabase/public";
import { getPostsPage } from "./get-posts-page";
import { parsePostsQuery } from "./posts-query";
import type { PostsPageResponse, PostsQueryParams } from "./posts-types";
import { buildPostsSearchParams } from "./posts-url";

export const POSTS_PAGE_CACHE_TAG = "posts-page";

const fetchPostsPageCached = unstable_cache(
  async (queryKey: string): Promise<PostsPageResponse> => {
    const supabase = createPublicSupabaseClient();
    const query = parsePostsQuery(new URLSearchParams(queryKey));
    return getPostsPage(supabase, query);
  },
  [POSTS_PAGE_CACHE_TAG],
  { tags: [POSTS_PAGE_CACHE_TAG], revalidate: 60 },
);

export const fetchPostsPage = async (
  params?: Partial<PostsQueryParams>,
): Promise<PostsPageResponse> => {
  const searchParams = buildPostsSearchParams({
    limit: params?.limit,
    offset: params?.offset,
  });

  return fetchPostsPageCached(searchParams.toString());
};
