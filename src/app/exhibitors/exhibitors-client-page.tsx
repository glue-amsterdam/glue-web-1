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
    loadingMore,
    error,
    handleLoadMore,
    handleRetry,
  } = useExhibitorsPage(initialData, initialFilters);

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
            loading={loading && items.length === 0}
            mode="fullpage"
          />

          {!loading && items.length === 0 && (
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
                disabled={loadingMore || loading || !hasMore}
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
