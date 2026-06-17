import { revalidatePath, revalidateTag } from "next/cache";
import { SITE_THEME_CACHE_TAG } from "@/lib/main/site-theme-cache-tags";

export const revalidateSiteThemeCache = (): void => {
  revalidateTag(SITE_THEME_CACHE_TAG, "max");
  revalidatePath("/", "layout");
};
