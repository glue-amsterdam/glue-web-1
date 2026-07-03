import { getAdminSupabaseOrRedirect } from "@/lib/admin/get-admin-supabase";
import { fetchStaticPage } from "@/lib/static-pages/fetch-static-page-admin";
import StaticPageForm from "@/components/admin/static-pages/StaticPageForm";

export default async function ImprintAdminPage() {
  const supabase = await getAdminSupabaseOrRedirect();
  const pageData = await fetchStaticPage("imprint", supabase);

  return (
    <div className="flex flex-col gap-4 rounded-lg bg-white p-4 shadow-md">
      <StaticPageForm
        slug="imprint"
        initialData={{
          title: pageData.title,
          subtitle: pageData.subtitle,
          content: pageData.content,
        }}
      />
    </div>
  );
}
