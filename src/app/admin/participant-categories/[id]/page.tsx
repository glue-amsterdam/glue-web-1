import { notFound, permanentRedirect } from "next/navigation";
import { categoryToFormData } from "@/lib/admin/participant-category-form-data";
import { getAdminSupabaseOrRedirect } from "@/lib/admin/get-admin-supabase";
import { fetchParticipantCategoriesAdmin } from "@/lib/participants/fetch-participant-categories-admin";
import { ParticipantCategoryForm } from "@/components/admin/participant-categories/ParticipantCategoryForm";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export default async function EditParticipantCategoryPage({ params }: PageProps) {
  const { id: ref } = await params;
  const supabase = await getAdminSupabaseOrRedirect();
  const categories = await fetchParticipantCategoriesAdmin(supabase);
  const category = categories.find(
    (item) => item.slug === ref || item.id === ref
  );

  if (!category) {
    notFound();
  }

  if (ref !== category.slug) {
    permanentRedirect(`/admin/participant-categories/${category.slug}`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{category.label}</h1>
        <p className="text-sm text-gray-600">Edit participant category</p>
      </div>
      <ParticipantCategoryForm
        initialData={categoryToFormData(category)}
        canDelete={!category.isProtected}
      />
    </div>
  );
}
