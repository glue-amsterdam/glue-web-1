import AboutTeamBlockForm from "@/components/admin/about/blocks/AboutTeamBlockForm";
import AboutTextDualBlockForm from "@/components/admin/about/blocks/AboutTextDualBlockForm";
import AboutFaqForm from "@/components/admin/about/blocks/AboutFaqForm";
import { ABOUT_BLOCK_IDS } from "@/schemas/aboutPageSchema";
import { redirect } from "next/navigation";
import { getAdminSupabaseOrRedirect } from "@/lib/admin/get-admin-supabase";
import { fetchAboutBlockAdmin } from "@/lib/about/fetch-about-block-admin";

interface AboutPageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

const SECTION_BLOCK_IDS: Record<string, string> = {
  "about-team": ABOUT_BLOCK_IDS.TEAM,
  "about-foundation": ABOUT_BLOCK_IDS.FOUNDATION,
  "about-mission": ABOUT_BLOCK_IDS.MISSION,
  "about-press-media": ABOUT_BLOCK_IDS.PRESS,
  "about-faq": ABOUT_BLOCK_IDS.FAQ,
};

export default async function AboutSectionPage({
  searchParams,
}: AboutPageProps) {
  const { section } = await searchParams;

  if (section === "about-archive") {
    redirect("/admin/yearly-content?section=archive");
  }

  const currentSection = (section as string) || "about-team";
  const blockId = SECTION_BLOCK_IDS[currentSection];
  const blockData = blockId
    ? await fetchAboutBlockAdmin(await getAdminSupabaseOrRedirect(), blockId)
    : null;

  return (
    <div className="border-t pt-8">
      {currentSection === "about-team" && (
        <AboutTeamBlockForm initialData={blockData} />
      )}
      {currentSection === "about-foundation" && (
        <AboutTextDualBlockForm
          disabled={true}
          blockId={ABOUT_BLOCK_IDS.FOUNDATION}
          blockLabel="GLUE Foundation"
          initialData={blockData}
        />
      )}
      {currentSection === "about-mission" && (
        <AboutTextDualBlockForm
          disabled={true}
          blockId={ABOUT_BLOCK_IDS.MISSION}
          blockLabel="Mission Statement"
          initialData={blockData}
        />
      )}
      {currentSection === "about-press-media" && (
        <AboutTextDualBlockForm
          disabled={true}
          blockId={ABOUT_BLOCK_IDS.PRESS}
          blockLabel="Press & Media"
          initialData={blockData}
        />
      )}
      {currentSection === "about-faq" && (
        <AboutFaqForm initialData={blockData} />
      )}
    </div>
  );
}
