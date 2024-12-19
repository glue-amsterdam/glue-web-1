import { BASE_URL } from "@/constants";
import { mainSection } from "@/lib/mockMain";
import { MainSectionData, mainSectionSchema } from "@/schemas/mainSchema";
import { ApiMainSectionData } from "@/types/api-main-raw";
import { v4 as uuidv4 } from "uuid";

function transformApiData(data: ApiMainSectionData): MainSectionData {
  // Ensure mainColors has all required fields
  const transformedMainColors = {
    box1: data.mainColors?.box1 ?? "#000000",
    box2: data.mainColors?.box2 ?? "#000000",
    box3: data.mainColors?.box3 ?? "#000000",
    box4: data.mainColors?.box4 ?? "#000000",
    triangle: data.mainColors?.triangle ?? "#000000",
  };

  // Ensure mainMenu items have all required fields
  const transformedMainMenu = (data.mainMenu || []).map((item) => ({
    menu_id: item.menu_id || uuidv4(),
    label: item.label || "",
    section: item.section || "",
    className: item.className || "",
    subItems: item.subItems || null,
  }));

  // Ensure mainLinks exists and all items have required fields
  const transformedMainLinks = {
    mainLinks: (data.mainLinks?.mainLinks || []).map((link) => ({
      platform: link.platform || "",
      link: link.link || "",
    })),
  };

  // Ensure eventDays exists and all items have required fields
  const transformedEventDays = (data.eventDays || []).map((day) => ({
    dayId: (day.dayId as "day-1" | "day-2" | "day-3" | "day-4") || "day-1",
    label: day.label || "",
    date: day.date || null,
  }));

  return {
    mainColors: transformedMainColors,
    mainMenu: transformedMainMenu.map((item) => ({
      ...item,
      subItems:
        item.subItems?.map((subItem) => ({
          title: subItem.title || "",
          href: subItem.href || "",
        })) || null,
    })),
    mainLinks: transformedMainLinks,
    eventDays: transformedEventDays,
  };
}

export async function fetchMain(): Promise<MainSectionData> {
  try {
    const response = await fetch(`${BASE_URL}/main`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      if (
        process.env.NODE_ENV === "production" &&
        process.env.NEXT_PHASE === "phase-production-build"
      ) {
        console.log("Build environment detected, using mock data");
        return getMockData();
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiMainSectionData = await response.json();

    // Transform the data to match our schema
    const transformedData = transformApiData(data);

    // Validate the transformed data against the schema
    const validatedData = mainSectionSchema.parse(transformedData);

    return validatedData;
  } catch (error) {
    console.error("Error fetching main data in main-api-calls:", error);
    return getMockData();
  }
}

export function getMockData(): MainSectionData {
  return mainSection;
}
