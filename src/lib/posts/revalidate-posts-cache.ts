import { revalidatePath, revalidateTag } from "next/cache";
import { POSTS_PAGE_CACHE_TAG } from "@/lib/posts/fetch-posts-page";

export const POSTS_CACHE_TAG = "posts";

export const revalidatePostsCache = (slug?: string): void => {
  revalidateTag(POSTS_CACHE_TAG, "max");
  revalidateTag(POSTS_PAGE_CACHE_TAG, "max");
  revalidatePath("/posts");
  revalidatePath("/");

  if (slug) {
    revalidatePath(`/posts/${slug}`);
  }
};
