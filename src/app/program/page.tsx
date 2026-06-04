import { Suspense } from "react";
import type { Metadata } from "next";
import ProgramClientPage from "@/app/program/program-client-page";
import BottomBlock from "@/components/bottom-block";
import MainContainer from "@/components/main-container";
import { config } from "@/config";
import { programMetadata } from "@/lib/metadata";
import { fetchProgramPage } from "@/lib/program/fetch-program-page";
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
  const initialData = await fetchProgramPage(
    filtersToQueryParams(initialFilters, 0)
  );

  return (
    <main id="program-page" className="pt-(--nav-total-h)">
      <MainContainer className="pt-[40px] lg:pt-[calc(var(--nav-secondary-h)-3px)]">
        <section id="program-section">
          <h1 className="sr-only">GLUE {config.cityName} Program</h1>
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
