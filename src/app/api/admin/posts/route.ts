import { requireAdminToken } from "@/lib/admin/require-admin-token";
import { fetchPostSummaries } from "@/lib/posts/fetch-post";
import { mapPostSummaryToApiResponse } from "@/lib/posts/map-post-row";
import { generateUniquePostSlug } from "@/lib/posts/slugify-post-title";
import { revalidatePostsCache } from "@/lib/posts/revalidate-posts-cache";
import { postCreateSchema } from "@/schemas/postSchema";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET() {
  const auth = await requireAdminToken();
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const summaries = await fetchPostSummaries(auth.supabase);

    return NextResponse.json({
      posts: summaries.map(mapPostSummaryToApiResponse),
    });
  } catch (error) {
    console.error("Error in GET /api/admin/posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const auth = await requireAdminToken();
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const body = await request.json();
    const { title } = postCreateSchema.parse(body);
    const slug = await generateUniquePostSlug(auth.supabase, title);

    const { data, error } = await auth.supabase
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

    revalidatePostsCache(data.slug);

    return NextResponse.json({ id: data.id }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/admin/posts:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
