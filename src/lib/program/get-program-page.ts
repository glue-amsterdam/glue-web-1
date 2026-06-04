import type { SupabaseClient } from "@supabase/supabase-js";
import {
  applyProgramFilters,
  paginateProgram,
  toProgramFilterState,
} from "./program-filter";
import { loadProgramListItems } from "./get-program-events";
import type { ParsedProgramQuery, ProgramPageResponse } from "./program-types";

export const getProgramPage = async (
  supabase: SupabaseClient,
  query: ParsedProgramQuery
): Promise<ProgramPageResponse> => {
  const items = await loadProgramListItems(supabase, {
    type: query.type,
    day: query.day,
  });

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
