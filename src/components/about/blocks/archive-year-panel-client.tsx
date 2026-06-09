"use client";

import Image from "next/image";
import CitizensOfHonourSection from "@/components/yearly-sections/citizens-of-honour-section";
import StickyParticipantsSection from "@/components/yearly-sections/sticky-participants-section";
import YearNumbersSection from "@/components/yearly-sections/year-numbers-section";
import {
  toArchiveCitizensSectionProps,
  toArchiveStickySectionProps,
  toArchiveYearNumbersSectionProps,
} from "@/lib/yearly-sections/map-yearly-section-props";
import type { ArchiveYearSection } from "@/schemas/aboutPageSchema";
import Separator from "@/components/separator";

type Props = {
  section: ArchiveYearSection;
  sanitizedTextBlockDescription: string;
};

const ArchiveYearPanelClient = ({
  section,
  sanitizedTextBlockDescription,
}: Props) => {
  const headingId = `archive-${section.year}-heading`;

  const citizensData = section.citizens_of_honour.data;
  const stickyData = section.sticky_members.data;

  return (
    <section
      id={`archive-${section.year}`}
      aria-labelledby={headingId}
      className="pt-[40px] lg:pt-[60px]"
    >
      <h3 className="sr-only" id={headingId}>
        GLUE {section.year}
      </h3>

      {section.media.video ? (
        <video
          src={section.media.video.src}
          poster={section.media.video.poster || undefined}
          controls
          className="aspect-video w-full max-w-4xl mx-auto"
          aria-label={section.media.video.alt}
        />
      ) : null}

      {section.media.image ? (
        <div className="relative aspect-video w-full max-w-4xl mx-auto">
          <Image
            src={section.media.image.src}
            alt={section.media.image.alt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 896px"
          />
        </div>
      ) : null}

      {section.numbers.length > 0 ? (
        <>
          <Separator />
          <YearNumbersSection
            {...toArchiveYearNumbersSectionProps(section.year, section.numbers)}
            headingLevel="h3"
          />
        </>
      ) : null}

      {section.text_block.title ? (
        <>
          <Separator />
          <h4 className="title-text mini-padding">{section.text_block.title}</h4>
        </>
      ) : null}
      {section.text_block.description ? (
        <div
          className="base-text-size"
          dangerouslySetInnerHTML={{ __html: sanitizedTextBlockDescription }}
        />
      ) : null}

      {citizensData?.citizens?.length ? (
        <section aria-label={`Creative Citizens of Honour ${section.year}`}>
          <CitizensOfHonourSection
            {...toArchiveCitizensSectionProps(section.year, citizensData)}
            headingLevel="h3"
            archiveYear={section.year}
          />
        </section>
      ) : null}

      {stickyData?.participants?.length ? (
        <section aria-label={`Sticky members ${section.year}`}>
          <StickyParticipantsSection
            showCta={false}
            {...toArchiveStickySectionProps(section.year, stickyData)}
          />
        </section>
      ) : null}
    </section>
  );
};

export default ArchiveYearPanelClient;
