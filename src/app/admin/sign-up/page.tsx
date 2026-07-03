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

export default async function SignUpAdminPage() {
  await getAdminSupabaseOrRedirect();
  const supabase = await createClient();
  const signUpTextSections = await fetchTextSectionsByGroup(supabase, "sign-up");

  return (
    <div className="space-y-10">
      <section className="border-t pt-8">
        <h2 className="title-text mb-4">Restricted sign up</h2>
        <p className="body-text mb-4 text-muted-foreground">
          Shown when signupSource=restricted (map, program, exhibitors).
        </p>
        <TextSectionAdminForm
          slug="sign-up-intro-restricted"
          sectionTitle="Restricted sign up"
          plainDescription
          initialData={getTextSectionBySlug(
            signUpTextSections,
            "sign-up-intro-restricted"
          )}
        />
      </section>
      <section className="border-t pt-8">
        <h2 className="title-text mb-4">Visitor sign up</h2>
        <p className="body-text mb-4 text-muted-foreground">
          Shown when signupSource=visitor or when no signupSource is set.
        </p>
        <TextSectionAdminForm
          slug="sign-up-intro-visitor"
          sectionTitle="Visitor sign up"
          plainDescription
          initialData={getTextSectionBySlug(
            signUpTextSections,
            "sign-up-intro-visitor"
          )}
        />
      </section>
    </div>
  );
}
