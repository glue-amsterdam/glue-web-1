import { BASE_URL, THREE_DAYS_IN_S } from "@/constants";
import { mainSection } from "@/lib/mockMain";
import { MainSectionData } from "@/schemas/mainSchema";

export async function fetchMain(): Promise<MainSectionData> {
  try {
    const response = await fetch(`${BASE_URL}/main`, {
      next: { revalidate: THREE_DAYS_IN_S },
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
