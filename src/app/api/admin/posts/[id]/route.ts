import { requireAdminToken } from "@/lib/admin/require-admin-token";
import { deleteStoredMediaUrls } from "@/lib/admin/delete-stored-media-url";
import { fetchPostById } from "@/lib/posts/fetch-post";
import { mapPostWithMediaToApiResponse } from "@/lib/posts/map-post-row";
import { revalidatePostsCache } from "@/lib/posts/revalidate-posts-cache";
import { generateUniquePostSlug } from "@/lib/posts/slugify-post-title";
import {
  collectPostMediaUrls,
  syncPostMedia,
} from "@/lib/posts/sync-post-media";
import { rewriteHtmlMediaToKeys } from "@/lib/media/media-url";
import { postPatchSchema } from "@/schemas/postSchema";
import { NextResponse } from "next/server";
import { z } from "zod";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const isUuid = (value: string) =>
  z.string().uuid().safeParse(value).success;

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireAdminToken();
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const { id } = await context.params;

    if (!isUuid(id)) {
      return NextResponse.json({ error: "Invalid post id" }, { status: 400 });
    }

    const post = await fetchPostById(auth.supabase, id);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(mapPostWithMediaToApiResponse(post));
  } catch (error) {
    console.error("Error in GET /api/admin/posts/[id]:", error);
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireAdminToken();
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const { id } = await context.params;

    if (!isUuid(id)) {
      return NextResponse.json({ error: "Invalid post id" }, { status: 400 });
    }

    const existing = await fetchPostById(auth.supabase, id);

    if (!existing) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const body = await request.json();
    const validated = postPatchSchema.parse(body);

    const nextTitle = validated.title ?? existing.title;
    const nextSlug = await generateUniquePostSlug(
      auth.supabase,
      nextTitle,
      id
    );

    const updateRow: Record<string, unknown> = {
      slug: nextSlug,
    };

    // Persist bucket-relative keys inside the rich-text HTML.
    const nextContentHtmlKeys =
      validated.content_html !== undefined
        ? rewriteHtmlMediaToKeys(validated.content_html)
        : undefined;

    if (validated.title !== undefined) {
      updateRow.title = validated.title;
    }
    if (validated.author !== undefined) {
      updateRow.author = validated.author;
    }
    if (validated.keywords !== undefined) {
      updateRow.keywords = validated.keywords;
    }
    if (nextContentHtmlKeys !== undefined) {
      updateRow.content_html = nextContentHtmlKeys;
    }
    if (validated.status !== undefined) {
      updateRow.status = validated.status;
    }

    const { error: updateError } = await auth.supabase
      .from("posts")
      .update(updateRow)
      .eq("id", id);

    if (updateError) {
      throw updateError;
    }

    if (nextContentHtmlKeys !== undefined) {
      await syncPostMedia(
        auth.supabase,
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

    const updated = await fetchPostById(auth.supabase, id);

    if (!updated) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(mapPostWithMediaToApiResponse(updated));
  } catch (error) {
    console.error("Error in PATCH /api/admin/posts/[id]:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireAdminToken();
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const { id } = await context.params;

    if (!isUuid(id)) {
      return NextResponse.json({ error: "Invalid post id" }, { status: 400 });
    }

    const existing = await fetchPostById(auth.supabase, id);

    if (!existing) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const mediaUrls = collectPostMediaUrls(
      existing.media.map((item) => ({
        image_url: item.image_url,
        video_url: item.video_url,
      }))
    );

    const { error: deleteError } = await auth.supabase
      .from("posts")
      .delete()
      .eq("id", id);

    if (deleteError) {
      throw deleteError;
    }

    if (mediaUrls.length > 0) {
      await deleteStoredMediaUrls(auth.supabase, mediaUrls);
    }

    revalidatePostsCache(existing.slug);

    return NextResponse.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error in DELETE /api/admin/posts/[id]:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}
