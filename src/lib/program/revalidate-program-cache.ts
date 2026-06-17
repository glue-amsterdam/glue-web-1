import { revalidatePath, revalidateTag } from "next/cache";
import { EVENT_HEADER_CACHE_TAG } from "@/lib/events/fetch-event-header-title";
import { PROGRAM_PAGE_CACHE_TAG } from "@/lib/program/fetch-program-page";

export const revalidateProgramCache = (): void => {
  revalidateTag(PROGRAM_PAGE_CACHE_TAG, "max");
  revalidateTag(EVENT_HEADER_CACHE_TAG, "max");
  revalidatePath("/program");
};
