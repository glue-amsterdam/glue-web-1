import { unstable_cache } from "next/cache";
import { createPublicSupabaseClient } from "@/utils/supabase/public";
import {
  EVENT_HEADER_CACHE_TAG,
  fetchEventHeaderTitle,
  type EventHeaderTitle,
} from "./fetch-event-header-title";

export const getCachedEventHeaderTitle = unstable_cache(
  async (): Promise<EventHeaderTitle> => {
    const supabase = createPublicSupabaseClient();
    return fetchEventHeaderTitle(supabase);
  },
  [EVENT_HEADER_CACHE_TAG],
  { tags: [EVENT_HEADER_CACHE_TAG], revalidate: 3600 }
);
