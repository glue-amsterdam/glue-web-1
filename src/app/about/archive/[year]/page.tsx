import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ArchiveYearDetailView from "@/components/archive/archive-year-detail-view";
import BottomBlock from "@/components/bottom-block";
import StaggerEnterContainer from "@/components/stagger-enter-container";
import { config } from "@/config";
import {
  getCachedAboutArchiveBlock,
  getCachedArchiveYear,
} from "@/lib/about/cached-about-data";
import {
  buildEntityMetadata,
  buildFallbackEntityMetadata,
} from "@/lib/seo/build-entity-metadata";
import { stripHtmlTags } from "@/lib/sanitize-html";

type PageProps = {
  params: Promise<{ year: string }>;
};

export const dynamicParams = true;

export const generateStaticParams = async () => {
  const block = await getCachedAboutArchiveBlock();

  return block.years.map((year) => ({
    year: String(year),
  }));
};

export const generateMetadata = async ({
  params,
}: PageProps): Promise<Metadata> => {
  const { year: yearParam } = await params;
  const year = Number(yearParam);

  if (!Number.isFinite(year)) {
    return buildFallbackEntityMetadata({
      title: `GLUE ${config.cityName} | Archive`,
      description: `Archive at GLUE ${config.cityName}.`,
      canonicalPath: `/about/archive/${yearParam}`,
    });
  }

  const section = await getCachedArchiveYear(year);

  if (!section) {
    return buildFallbackEntityMetadata({
      title: `GLUE ${config.cityName} | Archive ${year}`,
      description: `GLUE ${config.cityName} archive for ${year}.`,
      canonicalPath: `/about/archive/${year}`,
    });
  }

  const title = `GLUE ${config.cityName} - Archive ${year}`;
  const description =
  stripHtmlTags(section.text_block.description).trim() ||
    `GLUE ${config.cityName} archive for ${year}.`;

  return buildEntityMetadata({
    title,
    description,
    canonicalPath: `/about/archive/${year}`,
    keywords: ["GLUE", config.cityName, "archive", String(year)],
  });
};

export default async function ArchiveYearPage({ params }: PageProps) {
  const { year: yearParam } = await params;
  const year = Number(yearParam);

  if (!Number.isFinite(year)) {
    notFound();
  }

  const section = await getCachedArchiveYear(year);

  if (!section) {
    notFound();
  }

  return (
    <main id="archive-year-page">
      <StaggerEnterContainer variant="fade">
        <nav className="sr-only" aria-label="Breadcrumb">
          <ol>
            <li>
              <a href={config.baseUrl}>Home</a>
            </li>
            <li>
              <a href={`${config.baseUrl}/about`}>About</a>
            </li>
            <li>
              <a href={`${config.baseUrl}/about#archive`}>Archive</a>
            </li>
            <li>{year}</li>
          </ol>
        </nav>
        <ArchiveYearDetailView section={section} />
        <BottomBlock />
      </StaggerEnterContainer>
    </main>
  );
}
