import { z } from "zod";

export const POST_STATUSES = ["draft", "published"] as const;
export type PostStatus = (typeof POST_STATUSES)[number];

export const postMediaSchema = z.object({
  id: z.string().uuid(),
  post_id: z.string().uuid(),
  image_url: z.string().url().nullable(),
  video_url: z.string().url().nullable(),
  width: z.number().int().positive().nullable(),
  height: z.number().int().positive().nullable(),
  max_width: z.string().nullable(),
  max_height: z.string().nullable(),
  created_at: z.string(),
});

export type PostMedia = z.infer<typeof postMediaSchema>;

export const postSummarySchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  status: z.enum(POST_STATUSES),
  created_at: z.string(),
});

export type PostSummary = z.infer<typeof postSummarySchema>;

export const postSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1),
  status: z.enum(POST_STATUSES),
  author: z.string().nullable(),
  keywords: z.array(z.string()),
  content_html: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Post = z.infer<typeof postSchema>;

export const postWithMediaSchema = postSchema.extend({
  media: z.array(postMediaSchema),
});

export type PostWithMedia = z.infer<typeof postWithMediaSchema>;

export const postPatchSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  author: z.string().nullable().optional(),
  keywords: z.array(z.string()).optional(),
  content_html: z.string().optional(),
  status: z.enum(POST_STATUSES).optional(),
});

export type PostPatch = z.infer<typeof postPatchSchema>;

export const postCreateSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
});

export type PostCreate = z.infer<typeof postCreateSchema>;

export const postCreateResponseSchema = z.object({
  id: z.string().uuid(),
});

export const publicPostSummarySchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  slug: z.string(),
  author: z.string().nullable(),
  keywords: z.array(z.string()),
  excerpt: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type PublicPostSummary = z.infer<typeof publicPostSummarySchema>;

export const publicPostSchema = publicPostSummarySchema.extend({
  content_html: z.string(),
  media: z.array(postMediaSchema),
});

export type PublicPost = z.infer<typeof publicPostSchema>;

export const publicPostsListResponseSchema = z.object({
  posts: z.array(publicPostSummarySchema),
});

export type PublicPostsListResponse = z.infer<
  typeof publicPostsListResponseSchema
>;
