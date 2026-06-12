import { getAdminSupabaseOrRedirect } from "@/lib/admin/get-admin-supabase";
import { fetchTextSectionsByGroup } from "@/lib/text-sections/fetch-text-sections-by-group";
import { createClient } from "@/utils/supabase/server";

import TextSectionAdminForm from "@/components/admin/text-sections/text-section-admin-form";
import type { TextSectionData } from "@/lib/text-sections/types";

const getTextSectionBySlug = (
  sections: TextSectionData[],
  slug: TextSectionData["slug"]
) => {
  const section = sections.find((item) => item.slug === slug);
  if (!section) {
    throw new Error(`Missing text section: ${slug}`);
  }
  return section;
};

export default async function ParticipateAdminPage() {
  await getAdminSupabaseOrRedirect();
  const supabase = await createClient();
  const participateTextSections = await fetchTextSectionsByGroup(
    supabase,
    "participate"
  );

  return (
    <div className="space-y-10">
      <section className="border-t pt-8">
        <h2 className="title-text mb-4">Participate Intro</h2>
        <TextSectionAdminForm
          slug="participate-intro"
          sectionTitle="Participate Intro"
          initialData={getTextSectionBySlug(
            participateTextSections,
            "participate-intro"
          )}
        />
      </section>

      <section className="border-t pt-8">
        <h2 className="title-text mb-4">How It Works</h2>
        <TextSectionAdminForm
          slug="participate-how-it-works"
          sectionTitle="How It Works"
          initialData={getTextSectionBySlug(
            participateTextSections,
            "participate-how-it-works"
          )}
        />
      </section>

      <section className="border-t pt-8">
        <h2 className="title-text mb-4">Select a Plan</h2>
        <TextSectionAdminForm
          slug="participate-select-plan"
          sectionTitle="Select a Plan"
          initialData={getTextSectionBySlug(
            participateTextSections,
            "participate-select-plan"
          )}
        />
      </section>
    </div>
  );
}
