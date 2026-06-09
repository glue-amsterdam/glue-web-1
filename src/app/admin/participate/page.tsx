import { config } from "@/config";

import TextSectionAdminForm from "@/components/admin/text-sections/text-section-admin-form";
import type { TextSectionData } from "@/lib/text-sections/types";

const fetchParticipateTextSections = async (): Promise<TextSectionData[]> => {
  const res = await fetch(
    `${config.baseApiUrl}/admin/text-sections?group=participate`,
    { cache: "no-store" }
  );
  return res.json();
};

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
  const participateTextSections = await fetchParticipateTextSections();

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
