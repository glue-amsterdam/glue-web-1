import { revalidatePath, revalidateTag } from "next/cache";
import { PROGRAM_PAGE_CACHE_TAG } from "@/lib/program/fetch-program-page";

export const revalidateProgramCache = (): void => {
  revalidateTag(PROGRAM_PAGE_CACHE_TAG, "max");
  revalidatePath("/program");
};
