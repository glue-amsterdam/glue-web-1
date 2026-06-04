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
    loadingMore,
    error,
    handleLoadMore,
    handleRetry,
  } = useProgramPage(initialData, initialFilters);

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
          <ProgramGrid events={items} loading={loading && items.length === 0} />

          {!loading && items.length === 0 && (
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

export default ProgramClientPage;
