import { getAdminSupabaseOrRedirect } from "@/lib/admin/get-admin-supabase";
import { fetchEmailTemplates } from "@/lib/email/fetch-email-templates-admin";
import EmailTemplatesList from "@/components/admin/email-templates/EmailTemplatesList";

export default async function EmailTemplatesPage() {
  await getAdminSupabaseOrRedirect();
  const templates = await fetchEmailTemplates();

  return (
    <div className="flex flex-col gap-4 rounded-lg bg-white p-4 shadow-md">
      <EmailTemplatesList templates={templates} />
    </div>
  );
}
