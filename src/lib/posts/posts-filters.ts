import type { PublicPostSummary } from "@/schemas/postSchema";

export const POSTS_PAGE_SIZE = 12;

export const getPostItemKey = (post: Pick<PublicPostSummary, "id">): string =>
  post.id;

export const getPostLink = (slug: string): string => `/posts/${slug}`;
