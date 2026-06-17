import { notFound } from "next/navigation";
import PostEditorForm from "@/components/admin/posts/post-editor-form";
import { getAdminSupabaseOrRedirect } from "@/lib/admin/get-admin-supabase";
import { fetchPostById } from "@/lib/posts/fetch-post";
import { mapPostWithMediaToApiResponse } from "@/lib/posts/map-post-row";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminPostEditorPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await getAdminSupabaseOrRedirect();
  const post = await fetchPostById(supabase, id);

  if (!post) {
    notFound();
  }

  return (
    <section className="border-t pt-8">
      <PostEditorForm initialData={mapPostWithMediaToApiResponse(post)} />
    </section>
  );
}
