import { Suspense } from "react";
import { getAdminSupabaseOrRedirect } from "@/lib/admin/get-admin-supabase";
import { fetchAllYearlyContentYears } from "@/lib/admin/fetch-yearly-content-status";
import { createAdminClient } from "@/utils/supabase/adminClient";
import { YearlyContentManager } from "@/components/admin/yearly-content/YearlyContentManager";

export default async function YearlyContentAdminPage() {
  await getAdminSupabaseOrRedirect();
  const supabase = createAdminClient();
  const years = await fetchAllYearlyContentYears(supabase);

  return (
    <Suspense
      fallback={
        <p className="base-text-size text-gray-500">Loading yearly content...</p>
      }
    >
      <YearlyContentManager initialYears={years} />
    </Suspense>
  );
}
