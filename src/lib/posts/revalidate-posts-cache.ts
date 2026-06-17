import { revalidatePath, revalidateTag } from "next/cache";

export const POSTS_CACHE_TAG = "posts";

export const revalidatePostsCache = (slug?: string): void => {
  revalidateTag(POSTS_CACHE_TAG, "max");
  revalidatePath("/posts");

  if (slug) {
    revalidatePath(`/posts/${slug}`);
  }
};
