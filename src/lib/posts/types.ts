import type { PostMedia, PostStatus } from "@/schemas/postSchema";

export type PostData = {
  id: string;
  title: string;
  slug: string;
  status: PostStatus;
  author: string | null;
  keywords: string[];
  contentHtml: string;
  createdAt: string;
  updatedAt: string;
};

export type PostWithMediaData = PostData & {
  media: PostMedia[];
};

export type PostSummaryData = {
  id: string;
  title: string;
  status: PostStatus;
  createdAt: string;
};

export type PublicPostSummaryData = {
  id: string;
  title: string;
  slug: string;
  author: string | null;
  keywords: string[];
  excerpt: string;
  createdAt: string;
  updatedAt: string;
};
