import CreatePostForm from "@/components/admin/posts/create-post-form";
import { getAdminSupabaseOrRedirect } from "@/lib/admin/get-admin-supabase";

export default async function AdminNewPostPage() {
  await getAdminSupabaseOrRedirect();

  return (
    <section className="border-t pt-8">
      <CreatePostForm />
    </section>
  );
}
