import { MainSectionData } from "@/schemas/mainSchema";
import { fetchMain, getMockData } from "@/utils/api/main-api-calls";

export async function getData(): Promise<MainSectionData> {
  try {
    const data = await fetchMain();
    return data;
  } catch (error) {
    console.error("Error fetching main data:", error);

    return {
      mainColors: getMockData().mainColors,
      mainLinks: getMockData().mainLinks,
      mainMenu: getMockData().mainMenu,
      eventDays: getMockData().eventDays,
    };
  }
}
