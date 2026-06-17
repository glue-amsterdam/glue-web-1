import { getAdminSupabaseOrRedirect } from "@/lib/admin/get-admin-supabase";
import { fetchVisitorAreas } from "@/lib/visitors/fetch-visitor-areas";
import VisitorsClientPage from "@/components/admin/visitors/VisitorsClientPage";

export default async function VisitorsPage() {
  const supabase = await getAdminSupabaseOrRedirect();
  const areas = await fetchVisitorAreas(supabase);

  return <VisitorsClientPage initialAreas={areas} />;
}
