import { Suspense } from "react";
import type { Metadata } from "next";
import ExhibitorsClientPage from "@/app/exhibitors/exhibitors-client-page";
import { config } from "@/config";
import { exhibitorsMetadata } from "@/lib/metadata";
import { getCachedHomeExhibitorsHeader } from "@/lib/participants/cached-home-exhibitors-header";
import { fetchExhibitorsPage } from "@/lib/participants/fetch-exhibitors";
import { buildExhibitorsCollectionJsonLd } from "@/lib/seo/build-json-ld";
import {
  filtersToQueryParams,
  recordToSearchParams,
  searchParamsToFilters,
} from "@/lib/participants/exhibitors-url";
import MainContainer from "@/components/main-container";
import BottomBlock from "@/components/bottom-block";
import SrOnlySanitized from "@/components/sr-only-sanitized";
import LoadingSpinner from "../components/LoadingSpinner";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = exhibitorsMetadata;

export default async function Page({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const urlSearchParams = recordToSearchParams(resolvedSearchParams);
  const initialFilters = searchParamsToFilters(urlSearchParams);
  const [initialData, header] = await Promise.all([
    fetchExhibitorsPage(filtersToQueryParams(initialFilters, 0)),
    getCachedHomeExhibitorsHeader(),
  ]);
  const structuredData = buildExhibitorsCollectionJsonLd(initialData.items);

  return (
    <main id="exhibitors-page" className="pt-(--nav-total-h)">
      <MainContainer>
        <h1 className="title-text lg:absolute translate-y-[15px] sr-only lg:not-sr-only">
          {header.title.toUpperCase()}
        </h1>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        /></MainContainer>
      <MainContainer className="pt-[40px] lg:pt-[calc(var(--nav-secondary-h)-3px)] stagger-enter-fade">
        <nav className="sr-only" aria-label="Breadcrumb">
          <ol>
            <li>
              <a href={config.baseUrl}>Home</a>
            </li>
            <li>
              <a href={`${config.baseUrl}/exhibitors`}>Exhibitors</a>
            </li>
          </ol>
        </nav>
        <section id="exhibitors-section">

          <SrOnlySanitized html={header.description} />
          <Suspense fallback={<div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}>
            <ExhibitorsClientPage
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
