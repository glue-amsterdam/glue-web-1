import { getPostsPage } from "@/lib/posts/get-posts-page";
import { parsePostsQuery, PostsQueryError } from "@/lib/posts/posts-query";
import { createPublicSupabaseClient } from "@/utils/supabase/public";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = parsePostsQuery(searchParams);
    const supabase = createPublicSupabaseClient();
    const data = await getPostsPage(supabase, query);

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof PostsQueryError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error("Error in GET /api/posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 },
    );
  }
}
