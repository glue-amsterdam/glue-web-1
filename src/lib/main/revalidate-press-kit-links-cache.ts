import { revalidateTag } from "next/cache";
import { PRESS_KIT_LINKS_CACHE_TAG } from "@/lib/main/press-kit-links-cache-tags";

export const revalidatePressKitLinksCache = (): void => {
  revalidateTag(PRESS_KIT_LINKS_CACHE_TAG, "max");
};
