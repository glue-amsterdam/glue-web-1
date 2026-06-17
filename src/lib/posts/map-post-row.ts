import {
  truncateMetaDescription,
} from "@/lib/seo/build-entity-metadata";
import { sanitizePostHtml, stripHtmlTags } from "@/lib/sanitize-html";
import { normalizePostImagesForDisplay } from "@/lib/posts/normalize-post-html";
import type { PostMedia, PublicPost, PublicPostSummary } from "@/schemas/postSchema";
import type {
  PostData,
  PostSummaryData,
  PublicPostSummaryData,
  PostWithMediaData,
} from "./types";

type PostDbRow = {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "published";
  author: string | null;
  keywords: string[];
  content_html: string;
  created_at: string;
  updated_at: string;
};

type PostMediaDbRow = {
  id: string;
  post_id: string;
  image_url: string | null;
  video_url: string | null;
  width: number | null;
  height: number | null;
  max_width: string | null;
  max_height: string | null;
  created_at: string;
};

export const mapPostFromRow = (row: PostDbRow): PostData => ({
  id: row.id,
  title: row.title,
  slug: row.slug,
  status: row.status,
  author: row.author,
  keywords: row.keywords ?? [],
  contentHtml: row.content_html,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const mapPostSummaryFromRow = (row: PostDbRow): PostSummaryData => ({
  id: row.id,
  title: row.title,
  status: row.status,
  createdAt: row.created_at,
});

export const mapPostMediaFromRow = (row: PostMediaDbRow): PostMedia => ({
  id: row.id,
  post_id: row.post_id,
  image_url: row.image_url,
  video_url: row.video_url,
  width: row.width,
  height: row.height,
  max_width: row.max_width,
  max_height: row.max_height,
  created_at: row.created_at,
});

export const mapPostWithMediaFromRow = (
  row: PostDbRow,
  media: PostMediaDbRow[]
): PostWithMediaData => ({
  ...mapPostFromRow(row),
  media: media.map(mapPostMediaFromRow),
});

export const mapPostToApiResponse = (post: PostData) => ({
  id: post.id,
  title: post.title,
  slug: post.slug,
  status: post.status,
  author: post.author,
  keywords: post.keywords,
  content_html: post.contentHtml,
  created_at: post.createdAt,
  updated_at: post.updatedAt,
});

export const mapPostWithMediaToApiResponse = (post: PostWithMediaData) => ({
  ...mapPostToApiResponse(post),
  media: post.media,
});

export const mapPostSummaryToApiResponse = (summary: PostSummaryData) => ({
  id: summary.id,
  title: summary.title,
  status: summary.status,
  created_at: summary.createdAt,
});

const buildPostExcerpt = (contentHtml: string): string =>
  truncateMetaDescription(stripHtmlTags(contentHtml));

export const mapPublicPostSummaryFromRow = (
  row: PostDbRow
): PublicPostSummaryData => ({
  id: row.id,
  title: row.title,
  slug: row.slug,
  author: row.author,
  keywords: row.keywords ?? [],
  excerpt: buildPostExcerpt(row.content_html),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const mapPublicPostSummaryToApiResponse = (
  summary: PublicPostSummaryData
): PublicPostSummary => ({
  id: summary.id,
  title: summary.title,
  slug: summary.slug,
  author: summary.author,
  keywords: summary.keywords,
  excerpt: summary.excerpt,
  created_at: summary.createdAt,
  updated_at: summary.updatedAt,
});

export const mapPublicPostWithMediaToApiResponse = (
  post: PostWithMediaData
): PublicPost => ({
  ...mapPublicPostSummaryToApiResponse(mapPublicPostSummaryFromRow({
    id: post.id,
    title: post.title,
    slug: post.slug,
    status: post.status,
    author: post.author,
    keywords: post.keywords,
    content_html: post.contentHtml,
    created_at: post.createdAt,
    updated_at: post.updatedAt,
  })),
  content_html: normalizePostImagesForDisplay(sanitizePostHtml(post.contentHtml)),
  media: post.media,
});
