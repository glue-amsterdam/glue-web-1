import { BASE_URL } from "@/constants";
import { MainMenuData, mainMenuSchema } from "@/schemas/mainSchema";
import { cache } from "react";

const MAIN_MENU_FALLBACK_DATA: MainMenuData = {
  mainMenu: [
    {
      label: "dashboard",
      section: "dashboard",
      className: "leftbutton",
      menu_id: "13ce1db4-382b-4b6d-99bf-c3b67ff8a5b1",
      subItems: null,
    },
    {
      label: "events",
      section: "events",
      className: "rightbutton",
      menu_id: "2e26f0ca-77cc-4b47-a100-fb222645d60b",
      subItems: null,
    },
    {
      label: "map",
      section: "map",
      className: "downbutton",
      menu_id: "31e469f3-3bd2-4055-82c3-c0ab336a58e0",
      subItems: null,
    },
    {
      label: "about",
      section: "about",
      className: "upperbutton",
      menu_id: "48736d26-8ff7-409c-9907-29c496c30890",
      subItems: [
        {
          href: "main",
          title: "Carousel",
        },
        {
          href: "participants",
          title: "Participants",
        },
        {
          href: "citizens",
          title: "Citizens of Honour",
        },
        {
          href: "curated",
          title: "Curated Members",
        },
        {
          href: "info",
          title: "Information",
        },
        {
          href: "last",
          title: "GLUE international",
        },
        {
          href: "last",
          title: "Sponsors",
        },
      ],
    },
  ],
};

export const fetchMainMenu = cache(async (): Promise<MainMenuData> => {
  try {
    const res = await fetch(`${BASE_URL}/admin/main/menu`, {
      next: { revalidate: 3600, tags: ["main-colors"] },
    });

    if (!res.ok) {
      if (res.status === 404 || process.env.NEXT_PHASE === "build") {
        console.warn("Using fallback data for main colors during build");
        return MAIN_MENU_FALLBACK_DATA;
      }
      throw new Error(
        `Failed to fetch main colors during build": ${res.statusText}`
      );
    }

    const data = await res.json();
    return mainMenuSchema.parse(data);
  } catch (error) {
    console.error("Error fetching main colors:", error);
    throw error;
  }
});
