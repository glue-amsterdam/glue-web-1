"use client";

import BigButton from "@/components/big-button";
import ExhibitorsGrid from "@/components/exhibitors/exhibitors-grid";
import { useExhibitorsPage } from "@/hooks/useExhibitorsPage";
import type { ExhibitorsPageResponse } from "@/lib/participants/exhibitor-types";
import type { ExhibitorsFilters } from "@/lib/participants/exhibitors-filters";

type Props = {
  initialData: ExhibitorsPageResponse;
  initialFilters: ExhibitorsFilters;
};

const ExhibitorsClientPage = ({ initialData, initialFilters }: Props) => {
  const {
    items,
    hasMore,
    loading,
    isRefetching,
    loadingMore,
    error,
    handleLoadMore,
    handleRetry,
  } = useExhibitorsPage(initialData, initialFilters);

  const showGridLoading = loading && items.length === 0;
  const showEmpty =
    !loading && !isRefetching && items.length === 0;

  return (
    <>
      {error && (
        <div className="">
          <p className="">{error}</p>
          <div className="">
            <BigButton
              as="button"
              label="Try again"
              mode="big"
              onClick={handleRetry}
            />
          </div>
        </div>
      )}

      {!error && (
        <>
          <ExhibitorsGrid
            exhibitors={items}
            loading={showGridLoading || isRefetching}
            mode="fullpage"
          />

          {showEmpty && (
            <p className="pt-[15px] lg:pt-[30px] base-text-size text-(--black-color)">
              No exhibitors found.
            </p>
          )}

          {hasMore && (
            <div className="pt-[40px] lg:pt-[60px] flex justify-center">
              <BigButton
                as="button"
                label={loadingMore ? "loading..." : "view more"}
                mode="big"
                disabled={loadingMore || loading || isRefetching || !hasMore}
                onClick={handleLoadMore}
              />
            </div>
          )}
        </>
      )}
    </>
  );
};

export default ExhibitorsClientPage;
