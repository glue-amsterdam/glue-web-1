"use client";

import { useCallback, useRef, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import AccordionPlusCrossIcon from "@/components/icons/accordion-plus-cross-icon";
import type { ArchiveBlock, ArchiveYearSection } from "@/schemas/aboutPageSchema";
import { ABOUT_ANCHORS } from "@/schemas/aboutPageSchema";
import ArchiveYearPanelClient from "./archive-year-panel-client";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import { sanitizeHtml } from "@/lib/sanitize-html";

type Props = {
  block: ArchiveBlock;
  sanitizedDescription: string;
  initialSectionsByYear: Record<number, ArchiveYearSection>;
  sanitizedSectionDescriptions: Record<number, string>;
};

const getYearId = (year: number) => `archive-year-${year}`;

const ArchiveYearTrigger = ({ year }: { year: number }) => (
  <AccordionTrigger
    hideIcon
    className="group base-text-size main-boder-top hover:no-underline py-[15px]"
  >
    <div className="flex w-full flex-1 flex-col">
      <div className="flex w-full items-center justify-between gap-3">
        <span id={`${getYearId(year)}-label`} className="title-text">{year}</span>
        <AccordionPlusCrossIcon />
      </div>
    </div>
  </AccordionTrigger>
);

const buildLoadedYears = (
  initialSectionsByYear: Record<number, ArchiveYearSection>
): Set<number> => new Set(Object.keys(initialSectionsByYear).map(Number));

const ArchiveBlockClient = ({
  block,
  sanitizedDescription,
  initialSectionsByYear,
  sanitizedSectionDescriptions,
}: Props) => {
  const [sectionsByYear, setSectionsByYear] = useState<
    Record<number, ArchiveYearSection | undefined>
  >(() => ({ ...initialSectionsByYear }));
  const [sanitizedDescriptionsByYear, setSanitizedDescriptionsByYear] = useState<
    Record<number, string>
  >(() => ({ ...sanitizedSectionDescriptions }));
  const [loadingYears, setLoadingYears] = useState<Set<number>>(() => new Set());
  const loadedYearsRef = useRef<Set<number>>(buildLoadedYears(initialSectionsByYear));
  const loadingYearsRef = useRef<Set<number>>(new Set());

  const loadYear = useCallback(async (year: number) => {
    if (
      loadedYearsRef.current.has(year) ||
      loadingYearsRef.current.has(year)
    ) {
      return;
    }

    loadingYearsRef.current.add(year);
    setLoadingYears((prev) => new Set(prev).add(year));

    try {
      const res = await fetch(`/api/about/archive/${year}`);
      if (!res.ok) {
        setSectionsByYear((prev) => ({ ...prev, [year]: undefined }));
        loadedYearsRef.current.add(year);
        return;
      }

      const data = (await res.json()) as { section: ArchiveYearSection };
      setSectionsByYear((prev) => ({ ...prev, [year]: data.section }));
      setSanitizedDescriptionsByYear((prev) => ({
        ...prev,
        [year]: sanitizeHtml(data.section.text_block.description),
      }));
      loadedYearsRef.current.add(year);
    } catch (error) {
      console.error("[about] archive-year fetch failed", error);
      setSectionsByYear((prev) => ({ ...prev, [year]: undefined }));
      loadedYearsRef.current.add(year);
    } finally {
      loadingYearsRef.current.delete(year);
      setLoadingYears((prev) => {
        const next = new Set(prev);
        next.delete(year);
        return next;
      });
    }
  }, []);

  const handleValueChange = (values: string[]) => {
    for (const value of values) {
      const year = Number(value.replace("archive-year-", ""));
      if (!Number.isFinite(year)) {
        continue;
      }
      void loadYear(year);
    }
  };

  if (!block.is_visible) {
    return null;
  }

  const defaultYear = block.default_year ?? block.years[0];

  if (defaultYear == null || block.years.length === 0) {
    return (
      <section id={ABOUT_ANCHORS.ARCHIVE} aria-labelledby="archive-heading">
        <h2 id="archive-heading" className="title-text mini-padding">
          {block.title.toUpperCase()}
        </h2>
        {block.description ? (
          <div
            className="sr-only"
            dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
          />
        ) : null}
      </section>
    );
  }

  return (
    <section id={ABOUT_ANCHORS.ARCHIVE} aria-labelledby="archive-heading">
      <h2 id="archive-heading" className="title-text mini-padding">
        {block.title.toUpperCase()}
      </h2>
      {block.description ? (
        <div
          className="sr-only"
          dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
        />
      ) : null}
      <Accordion
        type="multiple"
        className="w-full pt-[40px] flex flex-col gap-[20px]"
        aria-label="Archive years"
        defaultValue={[]}
        onValueChange={handleValueChange}
      >
        {block.years.map((year) => {
          const yearId = getYearId(year);
          const section = sectionsByYear[year];
          const isLoading = loadingYears.has(year);
          const sanitizedTextBlockDescription = sanitizedDescriptionsByYear[year] ?? "";

          return (
            <AccordionItem key={yearId} value={yearId} className="border-b-0">
              <ArchiveYearTrigger year={year} />
              <AccordionContent aria-labelledby={`${yearId}-label`}>
                {isLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <LoadingSpinner />
                  </div>
                ) : section ? (
                  <ArchiveYearPanelClient
                    section={section}
                    sanitizedTextBlockDescription={sanitizedTextBlockDescription}
                  />
                ) : null}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </section>
  );
};

export default ArchiveBlockClient;
