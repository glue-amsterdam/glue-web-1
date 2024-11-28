import { BASE_URL, THREE_DAYS_IN_S } from "@/constants";
import { MainSection } from "@/utils/menu-types";
import { cache } from "react";

export const fetchMain = cache(async (): Promise<MainSection> => {
  const res = await fetch(`${BASE_URL}/main`, {
    next: { revalidate: THREE_DAYS_IN_S },
  });
  if (!res.ok) {
    console.error("Failed to fetch Main, using mock data");
    return await import("@/lib/mockMain").then((result) => result.mainSection);
  }
  return res.json();
});
