import { getAdminSupabaseOrRedirect } from "@/lib/admin/get-admin-supabase";
import { fetchTerms } from "@/lib/terms/fetch-terms-admin";
import TermsForm from "@/components/admin/terms/TermsForm";

export default async function TermsPage() {
  await getAdminSupabaseOrRedirect();
  const termsData = await fetchTerms();

  return (
    <div className="flex flex-col gap-4 rounded-lg bg-white p-4 shadow-md">
      <TermsForm initialData={{ content: termsData.content }} />
    </div>
  );
}
