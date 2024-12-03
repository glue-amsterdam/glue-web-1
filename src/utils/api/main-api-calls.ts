import { BASE_URL } from "@/constants";
import { mainSection } from "@/lib/mockMain";
import { MainSectionData } from "@/schemas/mainSchema";

export async function fetchMain(): Promise<MainSectionData> {
  if (
    process.env.NODE_ENV === "production" &&
    process.env.NEXT_PHASE === "phase-production-build"
  ) {
    // During build time in production, return mock data
    return getMockData();
  }

  try {
    const response = await fetch(`${BASE_URL}/main`, {
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data as MainSectionData;
  } catch (error) {
    console.error("Error fetching main data in main-api-calls:", error);
    return getMockData();
  }
}

export function getMockData(): MainSectionData {
  return mainSection;
}
