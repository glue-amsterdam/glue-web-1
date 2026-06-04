import { revalidatePath, revalidateTag } from "next/cache";
import { HOME_CITIZENS_CACHE_TAG, HOME_STICKY_CACHE_TAG } from "./types";

export const revalidateHomeStickyCache = (): void => {
  revalidateTag(HOME_STICKY_CACHE_TAG, "max");
  revalidatePath("/");
};

export const revalidateHomeCitizensCache = (): void => {
  revalidateTag(HOME_CITIZENS_CACHE_TAG, "max");
  revalidatePath("/");
};
