import { config } from "@/config";

import TextSectionAdminForm from "@/components/admin/text-sections/text-section-admin-form";
import type { TextSectionData } from "@/lib/text-sections/types";
import Separator from "@/components/separator";

const fetchVisitTextSections = async (): Promise<TextSectionData[]> => {
  const res = await fetch(
    `${config.baseApiUrl}/admin/text-sections?group=visit`,
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

export default async function VisitAdminPage() {
  const visitTextSections = await fetchVisitTextSections();

  return (
    <div className="space-y-10">
      <section className="border-t pt-8">
        <h2 className="title-text mb-4">Visit Intro</h2>
        <TextSectionAdminForm
          slug="visit-intro"
          sectionTitle="Visit Intro"
          initialData={getTextSectionBySlug(visitTextSections, "visit-intro")}
        />
      </section>
      <Separator />
      <section className="border-t pt-8">
        <h2 className="title-text mb-4">Sign Up Section</h2>
        <TextSectionAdminForm
          slug="visit-sign-up"
          sectionTitle="Sign Up Section"
          initialData={getTextSectionBySlug(visitTextSections, "visit-sign-up")}
        />
      </section>
      <Separator />
      <section className="border-t pt-8">
        <h2 className="title-text mb-4">Discover Routes</h2>
        <TextSectionAdminForm
          slug="visit-discover"
          sectionTitle="Discover Routes"
          initialData={getTextSectionBySlug(visitTextSections, "visit-discover")}
        />
      </section>
    </div>
  );
}
