import { getAdminSupabaseOrRedirect } from "@/lib/admin/get-admin-supabase";
import { fetchAboutCarouselAdmin } from "@/lib/about/fetch-about-admin";
import { createClient } from "@/utils/supabase/server";

import AboutCarouselForm from "@/components/admin/about/carousel/AboutCarouselForm";

export default async function CarouselAdminPage() {
  await getAdminSupabaseOrRedirect();
  const supabase = await createClient();
  const carouselData = await fetchAboutCarouselAdmin(supabase);

  return (
    <div className="rounded-lg bg-white p-4 shadow-md">
      <div
        className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 base-text-size text-amber-900"
        role="status"
      >
        Deprecated — this carousel was used on the legacy About page (about-0.1)
        and is no longer part of the live site.
      </div>
      <AboutCarouselForm initialData={carouselData} />
    </div>
  );
}
