import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { DayID, EventDay, MainLink, MainSection } from "@/utils/menu-types";

export async function GET() {
  const supabase = await createClient();

  try {
    const [eventsDays, mainColors, mainLinks, mainMenu] = await Promise.all([
      supabase.from("events_days").select(),
      supabase.from("main_colors").select(),
      supabase.from("main_links").select(),
      supabase.from("main_menu").select("label, section, className, subItems"),
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

    const mainColorsData = mainColors.data?.[0];
    const mainLinksData = mainLinks.data;
    const eventsDaysData = eventsDays.data;
    const mainMenuData = mainMenu.data;

    const main_links: Record<string, MainLink> = mainLinksData.reduce(
      (acc, item) => {
        acc[item.platform] = { link: item.link };
        return acc;
      },
      {} as Record<string, MainLink>
    );

    const events_days: EventDay[] = eventsDaysData.map((day) => ({
      dayId: day.dayId as DayID,
      label: day.label,
      date: new Date(day.date),
    }));

    const formattedData: MainSection = {
      mainColors: mainColorsData,
      mainLinks: main_links,
      mainMenu: mainMenuData,
      eventsDays: events_days,
    };

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Error fetching main data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
