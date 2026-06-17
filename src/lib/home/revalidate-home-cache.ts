import { revalidateAboutArchiveYearCache } from "@/lib/about/revalidate-about-cache";
import { revalidatePath, revalidateTag } from "next/cache";
import {
  HOME_CITIZENS_CACHE_TAG,
  HOME_STICKY_CACHE_TAG,
  HOME_VIDEO_CACHE_TAG,
} from "./types";

export const revalidateHomeStickyCache = (year?: number): void => {
  revalidateTag(HOME_STICKY_CACHE_TAG, "max");
  revalidatePath("/");
  revalidatePath("/about");
  if (year != null) {
    revalidateTag(`about-sticky-${year}`, "max");
    revalidateAboutArchiveYearCache(year);
  }
};

export const revalidateHomeCitizensCache = (year?: number): void => {
  revalidateTag(HOME_CITIZENS_CACHE_TAG, "max");
  revalidatePath("/");
  revalidatePath("/about");
  if (year != null) {
    revalidateTag(`about-citizens-${year}`, "max");
  }
};

export const revalidateHomeVideoCache = (): void => {
  revalidateTag(HOME_VIDEO_CACHE_TAG, "max");
  revalidatePath("/");
};
