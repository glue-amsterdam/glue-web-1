import type {
  ExhibitorsPageResponse,
  ExhibitorsQueryParams,
} from "@/lib/participants/exhibitor-types";
import { getExhibitorsPage } from "@/lib/participants/get-exhibitors-page";
import { parseExhibitorsQuery } from "@/lib/participants/exhibitors-query";
import { buildExhibitorsSearchParams } from "@/lib/participants/exhibitors-url";
import { createClient } from "@/utils/supabase/server";

export async function fetchExhibitorsPage(
  params?: Partial<ExhibitorsQueryParams>
): Promise<ExhibitorsPageResponse> {
  const supabase = await createClient();
  const query = parseExhibitorsQuery(
    buildExhibitorsSearchParams({
      limit: params?.limit,
      offset: params?.offset,
      type: params?.type,
      sort: params?.sort,
      order: params?.order,
      q: params?.q,
    })
  );

  return getExhibitorsPage(supabase, query);
}
