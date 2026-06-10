import { revalidatePath, revalidateTag } from "next/cache";
import { SPONSORS_CACHE_TAG } from "./sponsors-cache-tags";

export const revalidateSponsorsCache = (): void => {
  revalidateTag(SPONSORS_CACHE_TAG, "max");
  revalidatePath("/", "layout");
};
