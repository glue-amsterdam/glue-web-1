import AboutTeamBlockForm from "@/components/admin/about/blocks/AboutTeamBlockForm";
import AboutTextDualBlockForm from "@/components/admin/about/blocks/AboutTextDualBlockForm";
import AboutFaqForm from "@/components/admin/about/blocks/AboutFaqForm";
import { ABOUT_BLOCK_IDS } from "@/schemas/aboutPageSchema";
import { redirect } from "next/navigation";

interface AboutPageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function AboutSectionPage({
  searchParams,
}: AboutPageProps) {
  const { section } = await searchParams;

  if (section === "about-archive") {
    redirect("/admin/yearly-content?section=archive");
  }

  const currentSection = (section as string) || "about-team";

  return (
    <div className="border-t pt-8">
      {currentSection === "about-team" && <AboutTeamBlockForm />}
      {currentSection === "about-foundation" && (
        <AboutTextDualBlockForm
          disabled={true}
          blockId={ABOUT_BLOCK_IDS.FOUNDATION}
          blockLabel="GLUE Foundation"
        />
      )}
      {currentSection === "about-mission" && (
        <AboutTextDualBlockForm
          disabled={true}
          blockId={ABOUT_BLOCK_IDS.MISSION}
          blockLabel="Mission Statement"
        />
      )}
      {currentSection === "about-press-media" && (
        <AboutTextDualBlockForm
          disabled={true}
          blockId={ABOUT_BLOCK_IDS.PRESS}
          blockLabel="Press & Media"
        />
      )}
      {currentSection === "about-faq" && <AboutFaqForm />}
    </div>
  );
}
