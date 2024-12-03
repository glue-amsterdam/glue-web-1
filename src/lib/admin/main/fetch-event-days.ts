import { BASE_URL } from "@/constants";
import { EventDaysResponse, eventDaysSchema } from "@/schemas/eventSchemas";
import { cache } from "react";

const EVENT_DAYS_FALLBACK_DATA: EventDaysResponse = {
  eventDays: [
    {
      dayId: "day-1",
      date: "2024-11-08T03:00:00+00:00",
      label: "Thursday",
    },
    {
      dayId: "day-2",
      date: "2024-11-09T03:00:00+00:00",
      label: "Friday",
    },
    {
      dayId: "day-3",
      date: "2025-04-02T03:00:00+00:00",
      label: "Saturday",
    },
    {
      dayId: "day-4",
      date: "2024-11-21T03:00:00+00:00",
      label: "Sunday",
    },
  ],
};

export const fetchEventDays = cache(async (): Promise<EventDaysResponse> => {
  try {
    const res = await fetch(`${BASE_URL}/admin/main/days`, {
      next: { revalidate: 3600, tags: ["event-days"] },
    });

    if (!res.ok) {
      if (res.status === 404 || process.env.NEXT_PHASE === "build") {
        console.warn("Using fallback data for event days during build");
        return EVENT_DAYS_FALLBACK_DATA;
      }
      throw new Error(`Failed to fetch event days during build: ${res.status}`);
    }

    const data = await res.json();
    return eventDaysSchema.parse(data);
  } catch (error) {
    console.error("Error fetching event days:", error);
    throw error;
  }
});
