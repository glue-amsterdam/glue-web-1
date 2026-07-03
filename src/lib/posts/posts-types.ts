import type { PublicPostSummary } from "@/schemas/postSchema";

export type PostsPageResponse = {
  items: PublicPostSummary[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
};

export type PostsQueryParams = {
  limit?: number;
  offset?: number;
};

export type ParsedPostsQuery = {
  limit: number;
  offset: number;
};
