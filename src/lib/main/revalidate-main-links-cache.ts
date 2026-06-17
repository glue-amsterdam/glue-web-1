import { revalidateTag } from "next/cache";
import { MAIN_LINKS_CACHE_TAG } from "@/lib/main/main-links-cache-tags";

export const revalidateMainLinksCache = (): void => {
  revalidateTag(MAIN_LINKS_CACHE_TAG, "max");
};
