import type { SupabaseClient } from "@supabase/supabase-js";
import {
  applyProgramFilters,
  paginateProgram,
  toProgramFilterState,
} from "./program-filter";
import { loadProgramListItemsCached } from "./cached-load-program-items";
import type { ParsedProgramQuery, ProgramPageResponse } from "./program-types";

export const getProgramPage = async (
  _supabase: SupabaseClient,
  query: ParsedProgramQuery
): Promise<ProgramPageResponse> => {
  const items = await loadProgramListItemsCached();

  const filtered = applyProgramFilters(
    items,
    toProgramFilterState({
      type: query.type,
      day: query.day,
      q: query.q,
    })
  );

  const { pageItems, total, hasMore } = paginateProgram(
    filtered,
    query.offset,
    query.limit
  );

  return {
    items: pageItems,
    total,
    limit: query.limit,
    offset: query.offset,
    hasMore,
  };
};
