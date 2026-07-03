import type { ReactNode } from "react";
import Image from "next/image";
import HeadlineWCross from "@/components/headline-w-cross";
import Separator from "@/components/separator";
import TextSectionBlock from "@/components/text-section-block";
import CitizensOfHonourSection from "@/components/yearly-sections/citizens-of-honour-section";
import StickyParticipantsSection from "@/components/yearly-sections/sticky-participants-section";
import YearNumbersSection from "@/components/yearly-sections/year-numbers-section";
import {
  toArchiveCitizensSectionProps,
  toArchiveStickySectionProps,
  toArchiveYearNumbersSectionProps,
} from "@/lib/yearly-sections/map-yearly-section-props";
import type { ArchiveYearSection } from "@/schemas/aboutPageSchema";

type Props = {
  section: ArchiveYearSection;
};

const hasTextBlockContent = (section: ArchiveYearSection): boolean => {
  const title = section.text_block.title.trim();
  const description = section.text_block.description.trim();
  return title.length > 0 || description.length > 0;
};

const hasStickyContent = (section: ArchiveYearSection): boolean => {
  const stickyData = section.sticky_members.data;
  if (!stickyData) {
    return false;
  }

  return (
    stickyData.participants.length > 0 ||
    stickyData.additional_members_text.trim().length > 0
  );
};

const ArchiveYearDetailView = ({ section }: Props) => {
  const citizensData = section.citizens_of_honour.data;
  const stickyData = section.sticky_members.data;

  const blocks: ReactNode[] = [];

  if (section.media.video) {
    blocks.push(
      <video
        key="media-video"
        src={section.media.video.src}
        poster={section.media.video.poster || undefined}
        controls
        className="aspect-video w-full max-w-4xl mx-auto"
        aria-label={section.media.video.alt}
      />
    );
  } else if (section.media.image) {
    blocks.push(
      <div
        key="media-image"
        className="relative aspect-video w-full max-w-4xl mx-auto"
      >
        <Image
          src={section.media.image.src}
          alt={section.media.image.alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 896px"
        />
      </div>
    );
  }

  if (section.numbers.length > 0) {
    blocks.push(
      <YearNumbersSection
        className="main-boder-top"
        key="year-numbers"
        {...toArchiveYearNumbersSectionProps(section.year, section.numbers)}
        headingLevel="h3"
      />
    );
  }

  if (hasTextBlockContent(section)) {
    blocks.push(
      <TextSectionBlock
        className="main-boder-top"
        key="text-block"
        title={section.text_block.title}
        description={section.text_block.description}
        button={false}
        sectionId={`archive-${section.year}-text-section`}
      />
    );
  }

  if (citizensData?.citizens?.length) {
    blocks.push(
      <CitizensOfHonourSection
        key="citizens"
        hasPadding={false}
        {...toArchiveCitizensSectionProps(section.year, citizensData)}
        headingLevel="h3"
        archiveYear={section.year}
      />
    );
  }

  if (hasStickyContent(section) && stickyData) {
    blocks.push(
      <section key="sticky" aria-label={`Sticky members ${section.year}`}>
        <StickyParticipantsSection
          hasPadding={false}
          {...toArchiveStickySectionProps(section.year, stickyData)}
        />
      </section>
    );
  }

  return (
    <section
      id={`archive-${section.year}`}
      aria-labelledby={`archive-${section.year}-heading`}
      className="text-(--black-color) pt-[122px] lg:pt-[113px]"
    >
      <h1 className="sr-only" id={`archive-${section.year}-heading`}>
        GLUE {section.year}
      </h1>
      <HeadlineWCross
        title={String(section.year)}
        closeFallbackHref="/about#archive"
        preferCloseFallback
      />
      {blocks.length > 0 ? (
        <div className="title-padding max-w-[1045px] w-full mx-auto">
          {blocks.map((block, index) => (
            <div key={index}>
              {index > 0 ? <Separator noBorderBottom /> : null}
              {block}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
};

export default ArchiveYearDetailView;
