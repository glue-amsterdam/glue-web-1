import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

import {
  MainColors,
  MainLinks,
  MainMenuItem,
  MainSectionData,
} from "@/schemas/mainSchema";
import { EventDay } from "@/schemas/eventSchemas";

export async function GET() {
  try {
    const supabase = await createClient();
    const [eventsDays, mainColors, mainLinks, mainMenu] = await Promise.all([
      supabase.from("events_days").select(),
      supabase.from("main_colors").select(),
      supabase.from("main_links").select().order("id"),
      supabase
        .from("main_menu")
        .select("menu_id, label, section, className, subItems"),
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

    const mainColorsData = mainColors.data?.[0] as MainColors;
    const eventsDaysData = eventsDays.data;
    const mainMenuData = mainMenu.data as MainMenuItem[];

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

    const formattedData: MainSectionData = {
      mainColors: mainColorsData,
      mainLinks: formattedMainLinks,
      mainMenu: mainMenuData,
      eventDays: events_days,
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
