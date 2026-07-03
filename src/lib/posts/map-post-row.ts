import {
  truncateMetaDescription,
} from "@/lib/seo/build-entity-metadata";
import { sanitizePostHtml, stripHtmlTags } from "@/lib/sanitize-html";
import { normalizePostImagesForDisplay } from "@/lib/posts/normalize-post-html";
import { rewriteHtmlKeysToUrls, toMediaKey, toMediaUrl } from "@/lib/media/media-url";
import { extractMediaFromHtml } from "@/lib/posts/extract-media-from-html";
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
  thumbnail: string | null;
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

const mapPostFromRow = (row: PostDbRow): PostData => ({
  id: row.id,
  title: row.title,
  slug: row.slug,
  status: row.status,
  author: row.author,
  keywords: row.keywords ?? [],
  contentHtml: row.content_html,
  thumbnail: row.thumbnail ?? null,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const mapPostSummaryFromRow = (row: PostDbRow): PostSummaryData => ({
  id: row.id,
  title: row.title,
  status: row.status,
  createdAt: row.created_at,
});

const mapPostMediaFromRow = (row: PostMediaDbRow): PostMedia => ({
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

// Media is stored as bucket-relative keys; expand to full URLs for API responses.
const mapPostMediaToApiResponse = (media: PostMedia): PostMedia => ({
  ...media,
  image_url: toMediaUrl(media.image_url) ?? null,
  video_url: toMediaUrl(media.video_url) ?? null,
});

export const mapPostWithMediaFromRow = (
  row: PostDbRow,
  media: PostMediaDbRow[]
): PostWithMediaData => ({
  ...mapPostFromRow(row),
  media: media.map(mapPostMediaFromRow),
});

const mapPostToApiResponse = (post: PostData) => ({
  id: post.id,
  title: post.title,
  slug: post.slug,
  status: post.status,
  author: post.author,
  keywords: post.keywords,
  content_html: post.contentHtml,
  thumbnail: toMediaUrl(post.thumbnail) ?? null,
  created_at: post.createdAt,
  updated_at: post.updatedAt,
});

export const mapPostWithMediaToApiResponse = (post: PostWithMediaData) => ({
  ...mapPostToApiResponse(post),
  content_html: rewriteHtmlKeysToUrls(post.contentHtml),
  media: post.media.map(mapPostMediaToApiResponse),
});

export const mapPostSummaryToApiResponse = (summary: PostSummaryData) => ({
  id: summary.id,
  title: summary.title,
  status: summary.status,
  created_at: summary.createdAt,
});

const buildPostExcerpt = (contentHtml: string): string =>
  truncateMetaDescription(stripHtmlTags(contentHtml));

const extractCoverImageUrl = (contentHtml: string): string | null => {
  const htmlWithUrls = rewriteHtmlKeysToUrls(contentHtml);
  const firstImage = extractMediaFromHtml(htmlWithUrls).find(
    (item) => item.imageUrl
  );
  if (!firstImage?.imageUrl) {
    return null;
  }
  return toMediaUrl(firstImage.imageUrl) ?? null;
};

const resolveCoverImageUrl = (
  thumbnail: string | null | undefined,
  contentHtml: string,
  postMedia: Array<{ image_url: string | null; created_at: string }> | null
): string | null => {
  if (thumbnail) {
    return toMediaUrl(thumbnail) ?? null;
  }

  const firstMediaUrl = [...(postMedia ?? [])]
    .filter((item) => item.image_url)
    .sort((a, b) => a.created_at.localeCompare(b.created_at))[0]?.image_url;

  if (firstMediaUrl) {
    return toMediaUrl(firstMediaUrl) ?? null;
  }

  return extractCoverImageUrl(contentHtml);
};

type HomePostDbRow = PostDbRow & {
  post_media: Array<{ image_url: string | null; created_at: string }> | null;
};

export const mapHomePostSummaryFromRow = (
  row: HomePostDbRow
): PublicPostSummaryData => ({
  ...mapPublicPostSummaryFromRow(row),
  coverImageUrl: resolveCoverImageUrl(
    row.thumbnail,
    row.content_html,
    row.post_media
  ),
});

export const mapPublicPostSummaryFromRow = (
  row: PostDbRow
): PublicPostSummaryData => ({
  id: row.id,
  title: row.title,
  slug: row.slug,
  author: row.author,
  keywords: row.keywords ?? [],
  excerpt: buildPostExcerpt(row.content_html),
  coverImageUrl: resolveCoverImageUrl(row.thumbnail, row.content_html, null),
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
  cover_image_url: summary.coverImageUrl,
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
    thumbnail: post.thumbnail,
    created_at: post.createdAt,
    updated_at: post.updatedAt,
  })),
  content_html: normalizePostImagesForDisplay(
    sanitizePostHtml(rewriteHtmlKeysToUrls(post.contentHtml))
  ),
  media: post.media.map(mapPostMediaToApiResponse),
});
