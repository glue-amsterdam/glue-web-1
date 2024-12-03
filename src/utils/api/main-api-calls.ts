import { BASE_URL, THREE_DAYS_IN_S } from "@/constants";
import { mainSection } from "@/lib/mockMain";
import { MainSectionData, mainSectionSchema } from "@/schemas/mainSchema";

export async function fetchMain(): Promise<MainSectionData> {
  try {
    // Check if we're in a build environment
    if (
      process.env.NODE_ENV === "production" &&
      process.env.NEXT_PHASE === "phase-production-build"
    ) {
      console.log("Build environment detected, using mock data");
      return getMockData();
    }

    const response = await fetch(`${BASE_URL}/main`, {
      next: { revalidate: THREE_DAYS_IN_S },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Validate the data against the schema
    const validatedData = mainSectionSchema.parse(data);

    return validatedData;
  } catch (error) {
    console.error("Error fetching main data in main-api-calls:", error);
    return getMockData();
  }
}

export function getMockData(): MainSectionData {
  return mainSection;
}
