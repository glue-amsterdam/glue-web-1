import { getCachedPublishedPostBySlug } from "@/lib/posts/cached-public-posts";
import { publicPostSchema } from "@/schemas/postSchema";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;

  if (!slug?.trim()) {
    return NextResponse.json({ error: "Slug is required" }, { status: 400 });
  }

  try {
    const post = await getCachedPublishedPostBySlug(slug);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const response = publicPostSchema.parse(post);

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in GET /api/posts/[slug]:", error);
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}
