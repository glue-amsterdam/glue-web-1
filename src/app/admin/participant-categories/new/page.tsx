import { emptyCategoryFormData } from "@/lib/admin/participant-category-form-data";
import { getAdminSupabaseOrRedirect } from "@/lib/admin/get-admin-supabase";
import { ParticipantCategoryForm } from "@/components/admin/participant-categories/ParticipantCategoryForm";

export default async function NewParticipantCategoryPage() {
  await getAdminSupabaseOrRedirect();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">New category</h1>
        <p className="text-sm text-gray-600">
          New types appear in filters, badges, and the moderator profile
          selector automatically.
        </p>
      </div>
      <ParticipantCategoryForm initialData={emptyCategoryFormData()} isNew />
    </div>
  );
}
