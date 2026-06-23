import { unstable_cache } from "next/cache";

import { MAIN_SECTION_CACHE_TAG } from "@/lib/main/main-section-cache-tags";
import { MainSectionData, mainSectionSchema } from "@/schemas/mainSchema";
import { EventDay } from "@/schemas/eventSchemas";
import { createPublicSupabaseClient } from "@/utils/supabase/public";

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

const fetchMainCached = unstable_cache(
  async (): Promise<MainSectionData> => {
    const supabase = createPublicSupabaseClient();
    const { data: tourStatus, error: tourStatusError } = await supabase
      .from("tour_status")
      .select("current_tour_status, previous_tour_event_days")
      .single();

    if (tourStatusError) {
      console.error("Error fetching tour status:", tourStatusError);
    }

    const currentTourStatus = tourStatus?.current_tour_status || "new";
    const previousTourEventDays = (tourStatus?.previous_tour_event_days as
      | Array<{ dayId: string; label: string; date: string | null }>
      | null) || null;

    const shouldUseCurrentDays = currentTourStatus !== "older";
    const { data: currentEventDays, error: eventDaysError } = shouldUseCurrentDays
      ? await supabase.from("events_days").select()
      : { data: previousTourEventDays || [], error: null };

    if (eventDaysError) {
      throw new Error(`Error fetching events_days: ${eventDaysError.message}`);
    }

    const eventDays: EventDay[] = (currentEventDays || []).map((day) => ({
      dayId: day.dayId,
      label: day.label,
      date: day.date,
    }));

    return mainSectionSchema.parse({
      eventDays,
      currentTourStatus: currentTourStatus as "new" | "older",
    });
  },
  [MAIN_SECTION_CACHE_TAG],
  { tags: [MAIN_SECTION_CACHE_TAG], revalidate: 3600 }
);

export async function fetchMain(): Promise<MainSectionData> {
  try {
    return await fetchMainCached();
  } catch (error) {
    console.error("Error fetching main data in main-api-calls:", error);
    return getMockData();
  }
}

export function getMockData(): MainSectionData {
  return mainSection;
}
