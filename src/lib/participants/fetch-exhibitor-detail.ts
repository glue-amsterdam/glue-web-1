import { unstable_cache } from "next/cache";
import { cache } from "react";
import { createPublicSupabaseClient } from "@/utils/supabase/public";
import type {
  ExhibitorHubDetail,
  ExhibitorParticipantDetail,
} from "./exhibitor-detail-types";
import {
  EXHIBITOR_DETAIL_CACHE_TAG,
  EXHIBITOR_HUB_DETAIL_CACHE_TAG,
  EXHIBITORS_PAGE_CACHE_TAG,
} from "./exhibitors-cache-tags";
import { getExhibitorBySlug } from "./get-exhibitor-by-slug";
import { getExhibitorHubById } from "./get-exhibitor-hub-by-id";

export {
  EXHIBITOR_DETAIL_CACHE_TAG,
  EXHIBITOR_HUB_DETAIL_CACHE_TAG,
} from "./exhibitors-cache-tags";

const fetchExhibitorDetailBySlugCached = unstable_cache(
  async (slug: string): Promise<ExhibitorParticipantDetail> => {
    const supabase = createPublicSupabaseClient();
    return getExhibitorBySlug(supabase, slug);
  },
  [EXHIBITOR_DETAIL_CACHE_TAG],
  {
    tags: [EXHIBITOR_DETAIL_CACHE_TAG, EXHIBITORS_PAGE_CACHE_TAG],
    revalidate: 120,
  }
);

const fetchExhibitorDetailByHubIdCached = unstable_cache(
  async (hubId: string): Promise<ExhibitorHubDetail> => {
    const supabase = createPublicSupabaseClient();
    return getExhibitorHubById(supabase, hubId);
  },
  [EXHIBITOR_HUB_DETAIL_CACHE_TAG],
  {
    tags: [EXHIBITOR_HUB_DETAIL_CACHE_TAG, EXHIBITORS_PAGE_CACHE_TAG],
    revalidate: 120,
  }
);

export const fetchExhibitorDetailBySlug = cache(
  async (slug: string): Promise<ExhibitorParticipantDetail> =>
    fetchExhibitorDetailBySlugCached(slug)
);

export const fetchExhibitorDetailByHubId = cache(
  async (hubId: string): Promise<ExhibitorHubDetail> =>
    fetchExhibitorDetailByHubIdCached(hubId)
);
