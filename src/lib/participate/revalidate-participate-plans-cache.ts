import { revalidatePath, revalidateTag } from "next/cache";
import { PARTICIPATE_PLANS_CACHE_TAG } from "@/lib/participate/participate-cache-tags";

export const revalidateParticipatePlansCache = (): void => {
  revalidateTag(PARTICIPATE_PLANS_CACHE_TAG, "max");
  revalidatePath("/participate");
};
