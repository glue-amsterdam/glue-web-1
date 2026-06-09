import PostsListClient from "@/components/admin/posts/posts-list-client";
import { getAdminSupabaseOrRedirect } from "@/lib/admin/get-admin-supabase";
import { fetchPostSummaries } from "@/lib/posts/fetch-post";
import { mapPostSummaryToApiResponse } from "@/lib/posts/map-post-row";

export default async function AdminPostsPage() {
  const supabase = await getAdminSupabaseOrRedirect();
  const summaries = await fetchPostSummaries(supabase);
  const posts = summaries.map(mapPostSummaryToApiResponse);

  return (
    <section className="border-t pt-8">
      <PostsListClient initialPosts={posts} />
    </section>
  );
}
