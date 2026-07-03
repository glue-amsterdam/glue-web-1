import TextSectionBlock from "@/components/text-section-block";
import { getCachedTextSection } from "@/lib/text-sections/cached-text-sections";
import type { TextSectionSlug } from "@/schemas/textSectionSchema";

type Props = {
  slug: TextSectionSlug;
  shouldGrid?: boolean;
  bodyClassName?: "body-label" | "body-text";
};

const CmsTextSection = async ({ slug, shouldGrid = false, bodyClassName }: Props) => {
  const section = await getCachedTextSection(slug);

  return (
    <TextSectionBlock
      bodyClassName={bodyClassName}
      shouldGrid={shouldGrid}
      button={section.showButton}
      description={section.description}
      title={section.title}
      sectionId={section.sectionId}
      buttonLink={section.buttonLink ?? undefined}
      buttonLabel={section.buttonLabel ?? undefined}
    />
  );
};

export default CmsTextSection;
