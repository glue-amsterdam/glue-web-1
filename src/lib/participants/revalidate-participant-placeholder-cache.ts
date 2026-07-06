import { revalidatePath, revalidateTag } from "next/cache";
import { revalidateMapDataCache } from "@/lib/map/revalidate-map-cache";
import { revalidateProgramCache } from "@/lib/program/revalidate-program-cache";
import { EXHIBITORS_PAGE_CACHE_TAG } from "@/lib/participants/exhibitors-cache-tags";
import { HOME_EXHIBITORS_RANDOM_CACHE_TAG } from "@/lib/participants/fetch-random-home-exhibitors";
import { PARTICIPANT_PLACEHOLDER_CACHE_TAG } from "@/lib/participants/get-participant-placeholder-url";

export const revalidateParticipantPlaceholderCache = (): void => {
  revalidateTag(PARTICIPANT_PLACEHOLDER_CACHE_TAG, "max");
  revalidateTag(EXHIBITORS_PAGE_CACHE_TAG, "max");
  revalidateTag(HOME_EXHIBITORS_RANDOM_CACHE_TAG, "max");
  revalidatePath("/");
  revalidatePath("/exhibitors");
  revalidateMapDataCache();
  revalidateProgramCache();
};
