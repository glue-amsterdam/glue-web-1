"use server";

import { requireAdmin } from "@/lib/admin/require-admin";
import { deleteStoredMediaUrls } from "@/lib/admin/delete-stored-media-url";
import { fetchPostById, fetchPostSummaries } from "@/lib/posts/fetch-post";
import {
  mapPostSummaryToApiResponse,
  mapPostWithMediaToApiResponse,
} from "@/lib/posts/map-post-row";
import { revalidatePostsCache } from "@/lib/posts/revalidate-posts-cache";
import { generateUniquePostSlug } from "@/lib/posts/slugify-post-title";
import {
  collectPostMediaUrls,
  syncPostMedia,
} from "@/lib/posts/sync-post-media";
import { rewriteHtmlMediaToKeys } from "@/lib/media/media-url";
import { postCreateSchema, postPatchSchema } from "@/schemas/postSchema";
import { z } from "zod";

export async function getPostSummaries() {
  const supabase = await requireAdmin();
  const summaries = await fetchPostSummaries(supabase);
  return summaries.map(mapPostSummaryToApiResponse);
}

export async function createPost(data: { title: string }) {
  const supabase = await requireAdmin();
  const { title } = postCreateSchema.parse(data);
  const slug = await generateUniquePostSlug(supabase, title);

  const { data: post, error } = await supabase
    .from("posts")
    .insert({
      title,
      slug,
      status: "draft",
      content_html: "",
      keywords: [],
    })
    .select("id, slug")
    .single();

  if (error) {
    throw error;
  }

  revalidatePostsCache(post.slug);
  return { id: post.id };
}

export async function getPostById(id: string) {
  const supabase = await requireAdmin();

  if (!z.string().uuid().safeParse(id).success) {
    throw new Error("Invalid post id");
  }

  const post = await fetchPostById(supabase, id);

  if (!post) {
    throw new Error("Post not found");
  }

  return mapPostWithMediaToApiResponse(post);
}

export async function patchPost(
  id: string,
  data: {
    title?: string;
    author?: string | null;
    keywords?: string[];
    content_html?: string;
    status?: "draft" | "published";
  }
) {
  const supabase = await requireAdmin();

  if (!z.string().uuid().safeParse(id).success) {
    throw new Error("Invalid post id");
  }

  const existing = await fetchPostById(supabase, id);

  if (!existing) {
    throw new Error("Post not found");
  }

  const validated = postPatchSchema.parse(data);
  const nextTitle = validated.title ?? existing.title;
  const nextSlug = await generateUniquePostSlug(supabase, nextTitle, id);

  const updateRow: Record<string, unknown> = { slug: nextSlug };

  // Persist bucket-relative keys inside the rich-text HTML.
  const nextContentHtmlKeys =
    validated.content_html !== undefined
      ? rewriteHtmlMediaToKeys(validated.content_html)
      : undefined;

  if (validated.title !== undefined) updateRow.title = validated.title;
  if (validated.author !== undefined) updateRow.author = validated.author;
  if (validated.keywords !== undefined) updateRow.keywords = validated.keywords;
  if (nextContentHtmlKeys !== undefined) {
    updateRow.content_html = nextContentHtmlKeys;
  }
  if (validated.status !== undefined) updateRow.status = validated.status;

  const { error: updateError } = await supabase
    .from("posts")
    .update(updateRow)
    .eq("id", id);

  if (updateError) {
    throw updateError;
  }

  if (nextContentHtmlKeys !== undefined) {
    await syncPostMedia(
      supabase,
      id,
      nextContentHtmlKeys,
      existing.media.map((item) => ({
        image_url: item.image_url,
        video_url: item.video_url,
      }))
    );
  }

  revalidatePostsCache(existing.slug);
  if (nextSlug !== existing.slug) {
    revalidatePostsCache(nextSlug);
  }

  return getPostById(id);
}

export async function removePost(id: string) {
  const supabase = await requireAdmin();

  if (!z.string().uuid().safeParse(id).success) {
    throw new Error("Invalid post id");
  }

  const existing = await fetchPostById(supabase, id);

  if (!existing) {
    throw new Error("Post not found");
  }

  const mediaUrls = collectPostMediaUrls(existing.media);
  await deleteStoredMediaUrls(supabase, mediaUrls);

  const { error } = await supabase.from("posts").delete().eq("id", id);

  if (error) {
    throw error;
  }

  revalidatePostsCache(existing.slug);
}
