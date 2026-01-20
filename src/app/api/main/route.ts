import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

import type {
  MainColors,
  MainLinks,
  MainMenuItem,
  MainSectionData,
  SubItem,
} from "@/schemas/mainSchema";
import type { EventDay } from "@/schemas/eventSchemas";

export async function GET() {
  try {
    const supabase = await createClient();
    // Fetch tour status first to determine which event days to show
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

    // Build event days query based on tour status
    // If "new": show current tour days from events_days table
    // If "older": show previous tour days from snapshot in tour_status
    let eventsDays;
    if (currentTourStatus === "new") {
      // Fetch current event days from events_days table
      const { data, error } = await supabase
        .from("events_days")
        .select();
      eventsDays = { data, error };
    } else if (currentTourStatus === "older") {
      // Use snapshot from tour_status for older tour
      eventsDays = {
        data: previousTourEventDays || [],
        error: null,
      };
    } else {
      // Fallback to current days
      const { data, error } = await supabase.from("events_days").select();
      eventsDays = { data, error };
    }

    const [
      mainColors,
      mainLinks,
      mainMenu,
      homeText,
      pressKitLinks,
    ] = await Promise.all([
      supabase.from("main_colors").select(),
      supabase.from("main_links").select().order("id"),
      supabase
        .from("main_menu")
        .select("menu_id, label, section, className, subItems"),
      supabase.from("home_text").select().limit(1),
      supabase.from("press_kit_links").select(),
    ]);

    if (eventsDays.error)
      throw new Error(
        `Error fetching events_days: ${eventsDays.error.message}`
      );
    if (mainColors.error)
      throw new Error(
        `Error fetching main_colors: ${mainColors.error.message}`
      );
    if (mainLinks.error)
      throw new Error(`Error fetching main_links: ${mainLinks.error.message}`);
    if (mainMenu.error)
      throw new Error(`Error fetching main_menu: ${mainMenu.error.message}`);
    if (homeText.error)
      throw new Error(`Error fetching home_text: ${homeText.error.message}`);
    if (pressKitLinks.error)
      throw new Error(
        `Error fetching press_kit_links: ${pressKitLinks.error.message}`
      );
    const mainColorsData = mainColors.data?.[0] as MainColors;
    const eventsDaysData = eventsDays.data;
    const mainMenuData = mainMenu.data;
    const homeTextData = homeText.data?.[0] || null;
    const pressKitLinksData = pressKitLinks.data;
    const tourStatusData = currentTourStatus;

    const events_days: EventDay[] = eventsDaysData.map((day) => ({
      dayId: day.dayId,
      label: day.label,
      date: day.date,
    }));

    const formattedMainLinks: MainLinks = {
      mainLinks: mainLinks.data.map(({ platform, link }) => ({
        platform,
        link,
      })),
    };

    const parsedMainMenuData: MainMenuItem[] = mainMenuData.map((item) => ({
      ...item,
      subItems: item.subItems ? (JSON.parse(item.subItems) as SubItem[]) : null,
    }));

    const formattedData: MainSectionData & {
      homeText?: { id: string; label: string; color?: string } | null;
    } = {
      mainColors: mainColorsData,
      mainLinks: formattedMainLinks,
      mainMenu: parsedMainMenuData,
      eventDays: events_days,
      homeText: homeTextData
        ? {
            id: homeTextData.id,
            label: homeTextData.label,
            color: homeTextData.color,
          }
        : null,
      pressKitLinks: {
        pressKitLinks: pressKitLinksData.map(({ id, link, description }) => ({
          id,
          link,
          description,
        })),
      },
      currentTourStatus: tourStatusData as "new" | "older",
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
