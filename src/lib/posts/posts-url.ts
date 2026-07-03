import {
  getListVisibleCount,
  LIST_VISIBLE_PARAM,
} from "@/lib/list-page-session-cache";
import type { PostsQueryParams } from "./posts-types";
import { POSTS_PAGE_SIZE } from "./posts-filters";

export const buildPostsSearchParams = (
  params: PostsQueryParams,
): URLSearchParams => {
  const searchParams = new URLSearchParams();

  searchParams.set("limit", String(params.limit ?? POSTS_PAGE_SIZE));
  searchParams.set("offset", String(params.offset ?? 0));

  return searchParams;
};

export const buildPostsPageQueryParams = (
  offset = 0,
): PostsQueryParams => ({
  limit: POSTS_PAGE_SIZE,
  offset,
});

export const getPostsVisibleCount = (searchParams: URLSearchParams): number =>
  getListVisibleCount(searchParams, POSTS_PAGE_SIZE);

export const buildPostsPageUrl = (
  pathname: string,
  visibleCount = POSTS_PAGE_SIZE,
): string => {
  if (visibleCount <= POSTS_PAGE_SIZE) {
    return pathname;
  }

  const searchParams = new URLSearchParams();
  searchParams.set(LIST_VISIBLE_PARAM, String(visibleCount));
  return `${pathname}?${searchParams.toString()}`;
};

export const recordToSearchParams = (
  params: Record<string, string | string[] | undefined>,
): URLSearchParams => {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string" && value.length > 0) {
      searchParams.set(key, value);
    }
  }

  return searchParams;
};
