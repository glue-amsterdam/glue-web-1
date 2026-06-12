import type { ClientCitizen } from "@/schemas/citizenSchema";
import CreativeCitizensDisplay from "@/components/home/citizens-of-honour-section/creative-citizens-display";
import { cn } from "@/lib/utils";

type HeadingLevel = "h2" | "h3";

type Props = {
  title: string;
  description: string;
  citizens: ClientCitizen[];
  sectionId?: string;
  headingLevel?: HeadingLevel;
  archiveYear?: number;
  hasPadding?: boolean;
};

const CitizensOfHonourSection = ({
  title,
  description,
  citizens,
  sectionId = "creative-citizens-of-honour",
  headingLevel = "h2",
  archiveYear,
  hasPadding = true,
}: Props) => {
  if (citizens.length === 0) {
    return null;
  }

  const HeadingTag = headingLevel;

  return (
    <section id={sectionId} className={cn(hasPadding ? "main-padding" : "mini-padding")}>
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
