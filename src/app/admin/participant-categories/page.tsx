import Link from "next/link";
import { getAdminSupabaseOrRedirect } from "@/lib/admin/get-admin-supabase";
import { fetchParticipantCategoriesAdmin } from "@/lib/participants/fetch-participant-categories-admin";
import { Button } from "@/components/ui/button";

export default async function ParticipantCategoriesAdminPage() {
  const supabase = await getAdminSupabaseOrRedirect();
  const categories = await fetchParticipantCategoriesAdmin(supabase);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Participant Categories</h1>
          <p className="text-sm text-gray-600">
            Manage labels and badge colors for participant types.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/participant-categories/new">New category</Link>
        </Button>
      </div>

      <div className="space-y-3">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/admin/participant-categories/${category.slug}`}
            className="flex items-center justify-between rounded-md border border-gray-100 p-4 hover:bg-gray-50"
          >
            <div>
              <p className="font-medium">{category.label}</p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="inline-block size-6 rounded-full border"
                style={{ backgroundColor: category.bgColor }}
                aria-hidden
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
