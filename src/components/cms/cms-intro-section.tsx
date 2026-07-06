import { getCachedTextSection } from "@/lib/text-sections/cached-text-sections";
import { sanitizeHtml } from "@/lib/sanitize-html";
import type { TextSectionSlug } from "@/schemas/textSectionSchema";

type IntroSlug = Extract<TextSectionSlug, "visit-intro" | "participate-intro">;

type Props = {
  slug: IntroSlug;
};

const CmsIntroSection = async ({ slug }: Props) => {
  const section = await getCachedTextSection(slug);
  const sanitizedDescription = sanitizeHtml(section.description);

  return (
    <section id={section.sectionId}>
      <h1 className="title-text">{section.title.toUpperCase()}</h1>
      <div
        className="title-padding body-label lg:max-w-(--paragraph-max-width) post-content post-content-tight"
        dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
      />
    </section>
  );
};

export default CmsIntroSection;
