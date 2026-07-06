"use client";

import BigButton from "@/components/big-button";
import ProgramGrid from "@/components/program/program-grid";
import { useProgramPage } from "@/hooks/useProgramPage";
import type { ProgramFilters } from "@/lib/program/program-filters";
import type { ProgramPageResponse } from "@/lib/program/program-types";

type Props = {
  initialData: ProgramPageResponse;
  initialFilters: ProgramFilters;
};

const ProgramClientPage = ({ initialData, initialFilters }: Props) => {
  const {
    items,
    hasMore,
    loading,
    isRefetching,
    loadingMore,
    error,
    handleLoadMore,
    handleRetry,
  } = useProgramPage(initialData, initialFilters);

  const showGridLoading = loading && items.length === 0;
  const showEmpty =
    !loading && !isRefetching && items.length === 0;

  return (
    <>
      {error && (
        <div>
          <p>{error}</p>
          <div>
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
          <ProgramGrid
            events={items}
            loading={showGridLoading || isRefetching}
          />

          {showEmpty && (
            <p className="pt-[15px] lg:pt-[30px] base-text-size text-[var(--black-color)]">
              No program events found.
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

export default ProgramClientPage;
