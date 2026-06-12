import { Suspense } from "react";
import type { Metadata } from "next";
import ProgramClientPage from "@/app/program/program-client-page";
import BottomBlock from "@/components/bottom-block";
import MainContainer from "@/components/main-container";
import { config } from "@/config";
import { getCachedEventHeaderTitle } from "@/lib/events/cached-event-header-title";
import { programMetadata } from "@/lib/metadata";
import { fetchProgramPage } from "@/lib/program/fetch-program-page";
import { buildProgramCollectionJsonLd } from "@/lib/seo/build-json-ld";
import {
  filtersToQueryParams,
  recordToSearchParams,
  searchParamsToFilters,
} from "@/lib/program/program-url";
import LoadingSpinner from "../components/LoadingSpinner";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = programMetadata;

export default async function Page({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const urlSearchParams = recordToSearchParams(resolvedSearchParams);
  const initialFilters = searchParamsToFilters(urlSearchParams);
  const [initialData, header] = await Promise.all([
    fetchProgramPage(filtersToQueryParams(initialFilters, 0)),
    getCachedEventHeaderTitle(),
  ]);
  const structuredData = buildProgramCollectionJsonLd(initialData.items);

  return (
    <main id="program-page" className="pt-(--nav-total-h)">
      <MainContainer>
        <h1 className="title-text lg:absolute pt-[15px] sr-only lg:not-sr-only translate-y-[15px]">
          {header.header_title.toUpperCase()}
        </h1>
      </MainContainer>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <MainContainer className="pt-[40px] lg:pt-[calc(var(--nav-secondary-h)-3px)]">
        <section id="program-section">
          <p className="sr-only">
            Browse the program of GLUE {config.cityName} design route events.
          </p>
          <Suspense fallback={<div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}>
            <ProgramClientPage
              initialData={initialData}
              initialFilters={initialFilters}
            />
          </Suspense>
        </section>
        <BottomBlock />
      </MainContainer>
    </main>
  );
}
