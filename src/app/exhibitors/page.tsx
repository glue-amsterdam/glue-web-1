import { Suspense } from "react";
import type { Metadata } from "next";
import ExhibitorsClientPage from "@/app/exhibitors/exhibitors-client-page";
import { config } from "@/config";
import { exhibitorsMetadata } from "@/lib/metadata";
import { fetchExhibitorsPage } from "@/lib/participants/fetch-exhibitors";
import {
  filtersToQueryParams,
  recordToSearchParams,
  searchParamsToFilters,
} from "@/lib/participants/exhibitors-url";
import MainContainer from "@/components/main-container";
import BottomBlock from "@/components/bottom-block";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = exhibitorsMetadata;


export default async function Page({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const urlSearchParams = recordToSearchParams(resolvedSearchParams);
  const initialFilters = searchParamsToFilters(urlSearchParams);
  const initialData = await fetchExhibitorsPage(
    filtersToQueryParams(initialFilters, 0)
  );


  return (
    <main id="exhibitors-page" className="pt-(--nav-total-h)">
      <MainContainer className="pt-[40px] lg:pt-[calc(var(--nav-secondary-h)-3px)]">
        <section id="exhibitors-section">
          <h1 className="sr-only">
            GLUE {config.cityName} Exhibitors
          </h1>
          <p className="sr-only">
            Browse all exhibitors of GLUE {config.cityName} design route.
          </p>
          <Suspense fallback={<p className="">Loading...</p>}>
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
