import { BASE_URL } from "@/constants";
import { MAIN_SECTION_CACHE_TAG } from "@/lib/main/main-section-cache-tags";
import { MainSectionData, mainSectionSchema } from "@/schemas/mainSchema";
import { ApiMainSectionData } from "@/types/api-main-raw";

const mainSection: MainSectionData = {
  eventDays: [
    {
      dayId: "day-1",
      date: "2025-01-16T00:00:00Z",
      label: "Thursday",
    },
    {
      dayId: "day-2",
      date: "2025-01-17T00:00:00Z",
      label: "Friday",
    },
    {
      dayId: "day-3",
      date: "2025-01-18T00:00:00Z",
      label: "Saturday",
    },
    {
      dayId: "day-4",
      date: "2025-01-19T00:00:00Z",
      label: "Sunday",
    },
  ],
  currentTourStatus: "new" as const,
};

function transformApiData(data: ApiMainSectionData): MainSectionData {
  const transformedEventDays = (data.eventDays || []).map((day) => ({
    dayId: day.dayId as string,
    label: day.label || "",
    date: day.date || null,
  }));

  return {
    eventDays: transformedEventDays,
    currentTourStatus: (data.currentTourStatus as "new" | "older") || "new",
  };
}

export async function fetchMain(): Promise<MainSectionData> {
  try {
    const response = await fetch(`${BASE_URL}/main`, {
      next: { revalidate: 3600, tags: [MAIN_SECTION_CACHE_TAG] },
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
    const transformedData = transformApiData(data);
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
