import { unstable_cache } from "next/cache";
import { createPublicSupabaseClient } from "@/utils/supabase/public";
import { getProgramPage } from "./get-program-page";
import { parseProgramQuery } from "./program-query";
import type { ProgramPageResponse, ProgramQueryParams } from "./program-types";
import { buildProgramSearchParams } from "./program-url";

export const PROGRAM_PAGE_CACHE_TAG = "program-page";

const fetchProgramPageCached = unstable_cache(
  async (queryKey: string): Promise<ProgramPageResponse> => {
    const supabase = createPublicSupabaseClient();
    const query = parseProgramQuery(new URLSearchParams(queryKey));
    return getProgramPage(supabase, query);
  },
  [PROGRAM_PAGE_CACHE_TAG],
  { tags: [PROGRAM_PAGE_CACHE_TAG], revalidate: 60 }
);

export const fetchProgramPage = async (
  params?: Partial<ProgramQueryParams>
): Promise<ProgramPageResponse> => {
  const searchParams = buildProgramSearchParams({
    limit: params?.limit,
    offset: params?.offset,
    type: params?.type,
    day: params?.day,
    q: params?.q,
  });

  return fetchProgramPageCached(searchParams.toString());
};
