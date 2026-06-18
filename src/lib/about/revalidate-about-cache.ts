import { revalidatePath, revalidateTag } from "next/cache";
import {
  HOME_CITIZENS_CACHE_TAG,
  HOME_STICKY_CACHE_TAG,
} from "@/lib/home/types";
import {
  ABOUT_ARCHIVE_CACHE_TAG,
  ABOUT_BLOCK_CACHE_TAGS,
  ABOUT_BLOCK_ORDER_CACHE_TAG,
  aboutArchiveYearCacheTag,
  aboutCitizensYearCacheTag,
  aboutStickyYearCacheTag,
} from "./about-cache-tags";

export const revalidateAboutPage = (): void => {
  revalidatePath("/about");
};

export const revalidateAboutTeamCache = (): void => {
  revalidateTag(ABOUT_BLOCK_CACHE_TAGS["meet-the-team"], "max");
  revalidateAboutPage();
};

export const revalidateAboutBlockCache = (blockId: string): void => {
  const tag = ABOUT_BLOCK_CACHE_TAGS[blockId];
  if (tag) {
    revalidateTag(tag, "max");
  }
  revalidateTag(ABOUT_BLOCK_ORDER_CACHE_TAG, "max");
  revalidateAboutPage();
};

export const revalidateAboutArchiveCache = (): void => {
  revalidateTag(ABOUT_ARCHIVE_CACHE_TAG, "max");
  revalidateAboutPage();
};

export const revalidateAboutCitizensYearCache = (year: number): void => {
  revalidateTag(aboutCitizensYearCacheTag(year), "max");
  revalidateTag(HOME_CITIZENS_CACHE_TAG, "max");
  revalidateAboutPage();
  revalidatePath("/");
};

export const revalidateAboutStickyYearCache = (year: number): void => {
  revalidateTag(aboutStickyYearCacheTag(year), "max");
  revalidateTag(HOME_STICKY_CACHE_TAG, "max");
  revalidateAboutPage();
  revalidatePath("/");
};

export const revalidateAboutArchiveYearCache = (year: number): void => {
  revalidateTag(aboutArchiveYearCacheTag(year), "max");
  revalidateAboutPage();
};
