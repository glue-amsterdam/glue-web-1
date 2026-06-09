import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { fetchMainLinks } from "@/lib/main/get-main-links";

import type { MainSectionData } from "@/schemas/mainSchema";
import type { EventDay } from "@/schemas/eventSchemas";

export async function GET() {
  try {
    const supabase = await createClient();
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

    let eventsDays;
    if (currentTourStatus === "new") {
      const { data, error } = await supabase.from("events_days").select();
      eventsDays = { data, error };
    } else if (currentTourStatus === "older") {
      eventsDays = {
        data: previousTourEventDays || [],
        error: null,
      };
    } else {
      const { data, error } = await supabase.from("events_days").select();
      eventsDays = { data, error };
    }

    const [
      { data: pressKitLinks, error: pressKitLinksError },
      mainLinks,
    ] = await Promise.all([
      supabase.from("press_kit_links").select(),
      fetchMainLinks(),
    ]);

    if (eventsDays.error) {
      throw new Error(
        `Error fetching events_days: ${eventsDays.error.message}`
      );
    }

    if (pressKitLinksError) {
      throw new Error(
        `Error fetching press_kit_links: ${pressKitLinksError.message}`
      );
    }

    const eventsDaysData = eventsDays.data || [];
    const pressKitLinksData = pressKitLinks ?? [];

    const events_days: EventDay[] = eventsDaysData.map((day) => ({
      dayId: day.dayId,
      label: day.label,
      date: day.date,
    }));

    const formattedData: MainSectionData = {
      eventDays: events_days,
      pressKitLinks: {
        pressKitLinks: pressKitLinksData.map(({ id, link, description }) => ({
          id,
          link,
          description,
        })),
      },
      currentTourStatus: currentTourStatus as "new" | "older",
      mainLinks,
    };

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Error fetching main data in api endpoint:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
