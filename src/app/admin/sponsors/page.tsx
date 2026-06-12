import { getAdminSupabaseOrRedirect } from "@/lib/admin/get-admin-supabase";
import {
  fetchAboutSponsors,
  fetchAboutSponsorsHeader,
} from "@/lib/about/fetch-about-admin";
import { createClient } from "@/utils/supabase/server";
import AboutSponsorsForm from "@/components/admin/about/sponsors/AboutSponsorsForm";

export default async function SponsorsAdminPage() {
  await getAdminSupabaseOrRedirect();
  const supabase = await createClient();

  const [sponsorsHeaderData, sponsorsData] = await Promise.all([
    fetchAboutSponsorsHeader(supabase),
    fetchAboutSponsors(supabase),
  ]);

  return (
    <div className="rounded-lg bg-white p-4 shadow-md">
      <AboutSponsorsForm
        initialHeaderData={sponsorsHeaderData}
        initialSponsors={sponsorsData}
      />
    </div>
  );
}
