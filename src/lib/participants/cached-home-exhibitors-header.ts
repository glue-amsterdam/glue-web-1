import { unstable_cache } from "next/cache";
import { createPublicSupabaseClient } from "@/utils/supabase/public";
import type { ParticipantsSectionHeader } from "@/schemas/participantsAdminSchema";
import {
  fetchHomeExhibitorsHeader,
  HOME_EXHIBITORS_HEADER_CACHE_TAG,
} from "./fetch-home-exhibitors-header";

export const getCachedHomeExhibitorsHeader =
  unstable_cache(
    async (): Promise<ParticipantsSectionHeader> => {
      const supabase = createPublicSupabaseClient();
      return fetchHomeExhibitorsHeader(supabase);
    },
    [HOME_EXHIBITORS_HEADER_CACHE_TAG],
    { tags: [HOME_EXHIBITORS_HEADER_CACHE_TAG], revalidate: 3600 }
  );
