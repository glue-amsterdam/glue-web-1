import { unstable_cache } from "next/cache";
import type {
  ExhibitorsPageResponse,
  ExhibitorsQueryParams,
} from "@/lib/participants/exhibitor-types";
import { getExhibitorsPage } from "@/lib/participants/get-exhibitors-page";
import { parseExhibitorsQuery } from "@/lib/participants/exhibitors-query";
import { getValidFilterSlugs } from "@/lib/participants/participant-categories";
import { buildExhibitorsSearchParams } from "@/lib/participants/exhibitors-url";
import { createPublicSupabaseClient } from "@/utils/supabase/public";
import { getTheme } from "@/lib/theme";
import { EXHIBITORS_PAGE_CACHE_TAG } from "@/lib/participants/exhibitors-cache-tags";

export { EXHIBITORS_PAGE_CACHE_TAG } from "@/lib/participants/exhibitors-cache-tags";

const fetchExhibitorsPageCached = unstable_cache(
  async (queryKey: string): Promise<ExhibitorsPageResponse> => {
    const supabase = createPublicSupabaseClient();
    const { participantCategories } = await getTheme();
    const validSlugs = getValidFilterSlugs(participantCategories);
    const query = parseExhibitorsQuery(new URLSearchParams(queryKey), validSlugs);
    return getExhibitorsPage(supabase, query);
  },
  [EXHIBITORS_PAGE_CACHE_TAG],
  { tags: [EXHIBITORS_PAGE_CACHE_TAG], revalidate: 60 }
);

export async function fetchExhibitorsPage(
  params?: Partial<ExhibitorsQueryParams>
): Promise<ExhibitorsPageResponse> {
  const searchParams = buildExhibitorsSearchParams({
    limit: params?.limit,
    offset: params?.offset,
    type: params?.type,
    sort: params?.sort,
    order: params?.order,
    q: params?.q,
  });

  return fetchExhibitorsPageCached(searchParams.toString());
}
