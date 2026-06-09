import { getCachedTextSection } from "@/lib/text-sections/cached-text-sections";
import type { TextSectionSlug } from "@/schemas/textSectionSchema";

type IntroSlug = Extract<TextSectionSlug, "visit-intro" | "participate-intro">;

type Props = {
  slug: IntroSlug;
};

const CmsIntroSection = async ({ slug }: Props) => {
  const section = await getCachedTextSection(slug);

  return (
    <section id={section.sectionId}>
      <h1 className="title-text">{section.title.toUpperCase()}</h1>
      <p className="pt-[40px] base-text-size lg:max-w-(--paragraph-max-width)">
        {section.description}
      </p>
    </section>
  );
};

export default CmsIntroSection;
