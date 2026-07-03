import type {
  PostsPageResponse,
  PostsQueryParams,
} from "@/lib/posts/posts-types";
import { buildPostsSearchParams } from "@/lib/posts/posts-url";

export const fetchPostsPageClient = async (
  params: PostsQueryParams,
): Promise<PostsPageResponse> => {
  const searchParams = buildPostsSearchParams(params);
  const url = `/api/posts?${searchParams.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message =
      errorBody && typeof errorBody.error === "string"
        ? errorBody.error
        : "Failed to fetch posts";
    throw new Error(message);
  }

  return response.json();
};
