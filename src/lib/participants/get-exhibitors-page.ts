import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  ExhibitorsPageResponse,
  ParsedExhibitorsQuery,
} from "./exhibitor-types";
import { getExhibitorsGroupedCached } from "./cached-get-exhibitors";
import {
  applyExhibitorsFilters,
  paginateExhibitors,
} from "./exhibitors-filter";
import { flattenExhibitors } from "./flatten-exhibitors";

export const getExhibitorsPage = async (
  _supabase: SupabaseClient,
  query: ParsedExhibitorsQuery
): Promise<ExhibitorsPageResponse> => {
  const grouped = await getExhibitorsGroupedCached();

  const items = applyExhibitorsFilters(flattenExhibitors(grouped), {
    type: query.type ?? "all",
    sort: query.sort,
    order: query.order,
    q: query.q ?? "",
  });

  const { pageItems, total, hasMore } = paginateExhibitors(
    items,
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
