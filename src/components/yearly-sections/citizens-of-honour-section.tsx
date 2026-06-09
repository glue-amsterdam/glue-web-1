import type { ClientCitizen } from "@/schemas/citizenSchema";
import CreativeCitizensDisplay from "@/components/home/citizens-of-honour-section/creative-citizens-display";

type HeadingLevel = "h2" | "h3";

type Props = {
  title: string;
  description: string;
  citizens: ClientCitizen[];
  sectionId?: string;
  isVisible?: boolean;
  headingLevel?: HeadingLevel;
  archiveYear?: number;
};

const CitizensOfHonourSection = ({
  title,
  description,
  citizens,
  sectionId = "creative-citizens-of-honour",
  isVisible = true,
  headingLevel = "h2",
  archiveYear,
}: Props) => {
  if (!isVisible || citizens.length === 0) {
    return null;
  }

  const HeadingTag = headingLevel;

  return (
    <section id={sectionId} className="main-padding">
      <HeadingTag className="title-text border-t lg:border-t-2 border-[var(--black-color)] pt-[15px] lg:pt-[30px]">
        {title.toUpperCase()}
      </HeadingTag>
      <CreativeCitizensDisplay
        description={description}
        citizens={citizens}
        archiveYear={archiveYear}
      />
    </section>
  );
};

export default CitizensOfHonourSection;
