import { getCachedPublishedPosts } from "@/lib/posts/cached-public-posts";
import { publicPostsListResponseSchema } from "@/schemas/postSchema";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const posts = await getCachedPublishedPosts();
    const response = publicPostsListResponseSchema.parse({ posts });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in GET /api/posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}
