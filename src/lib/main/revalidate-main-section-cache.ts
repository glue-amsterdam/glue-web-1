import { revalidatePath, revalidateTag } from "next/cache";
import { MAIN_SECTION_CACHE_TAG } from "@/lib/main/main-section-cache-tags";
import { revalidateProgramCache } from "@/lib/program/revalidate-program-cache";

export const revalidateMainSectionCache = (): void => {
  revalidateTag(MAIN_SECTION_CACHE_TAG, "max");
  revalidatePath("/", "layout");
  revalidateProgramCache();
};
