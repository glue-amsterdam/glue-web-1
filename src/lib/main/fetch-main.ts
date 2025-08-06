import { BASE_URL } from "@/constants";
import { MainSectionData, mainSectionSchema } from "@/schemas/mainSchema";
import { ApiMainSectionData } from "@/types/api-main-raw";
import { v4 as uuidv4 } from "uuid";

const mainSection: MainSectionData = {
  mainColors: {
    box1: "#10069f",
    box2: "#230051",
    box3: "#000000",
    box4: "#bfb030",
    triangle: "#e1d237",
  },
  mainMenu: [
    {
      menu_id: "13ce1db4-382b-4b6d-99bf-c3b67ff8a5b1",
      label: "dashboard",
      section: "dashboard",
      className: "leftbutton",
    },
    {
      menu_id: "48736d26-8ff7-409c-9907-29c496c30890",
      label: "about",
      section: "about",
      className: "upperbutton",
      subItems: [
        { title: "Carousel", href: "main", is_visible: true, place: 1 },
        {
          title: "Participants",
          href: "participants",
          is_visible: true,
          place: 2,
        },
        {
          title: "Citizens of Honour",
          href: "citizens",
          is_visible: true,
          place: 3,
        },
        {
          title: "Curated Members",
          href: "curated",
          is_visible: true,
          place: 4,
        },
        { title: "Information", href: "info", is_visible: true, place: 5 },
        { title: "Press", href: "press", is_visible: true, place: 6 },
        {
          title: "GLUE international",
          href: "last",
          is_visible: true,
          place: 7,
        },
        { title: "Sponsors", href: "last", is_visible: true, place: 8 },
      ],
    },
    {
      menu_id: "2e26f0ca-77cc-4b47-a100-fb222645d60b",
      label: "events",
      section: "events",
      className: "rightbutton",
    },
    {
      menu_id: "31e469f3-3bd2-4055-82c3-c0ab336a58e0",
      label: "map",
      section: "map",
      className: "downbutton",
    },
  ],
  mainLinks: {
    mainLinks: [
      {
        platform: "newsletter",
        link: "https://amsterdam.us5.list-manage.com/subscribe?u=b588bd4354fa4df94fbd3803c&id=9cda67fd4c",
      },
      {
        platform: "linkedin",
        link: "https://www.linkedin.com/company/glue-amsterdam-connected-by-design/",
      },
      {
        platform: "instagram",
        link: "https://www.instagram.com/glue.amsterdam",
      },
      {
        platform: "youtube",
        link: "https://www.youtube.com/@GLUETV_amsterdam",
      },
    ],
  },
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
};

function transformApiData(data: ApiMainSectionData): MainSectionData {
  // Ensure mainColors has all required fields
  const transformedMainColors = {
    box1: data.mainColors?.box1 ?? "#000000",
    box2: data.mainColors?.box2 ?? "#000000",
    box3: data.mainColors?.box3 ?? "#000000",
    box4: data.mainColors?.box4 ?? "#000000",
    triangle: data.mainColors?.triangle ?? "#000000",
  };

  // Ensure mainMenu items have all required fields and sort by section order
  const sectionOrder = ["dashboard", "about", "events", "map"];
  const transformedMainMenu = (data.mainMenu || [])
    .map((item) => ({
      menu_id: item.menu_id || uuidv4(),
      label: item.label || "",
      section: item.section || "",
      className: item.className || "",
      subItems: item.subItems || null,
    }))
    .sort((a, b) => {
      const indexA = sectionOrder.indexOf(a.section);
      const indexB = sectionOrder.indexOf(b.section);
      return indexA - indexB;
    });

  // Ensure mainLinks exists and all items have required fields
  const transformedMainLinks = {
    mainLinks: (data.mainLinks?.mainLinks || []).map((link) => ({
      platform: link.platform || "",
      link: link.link || "",
    })),
  };

  // Ensure eventDays exists and all items have required fields
  const transformedEventDays = (data.eventDays || []).map((day) => ({
    dayId: day.dayId as string,
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
          is_visible: subItem.is_visible || false,
          place: subItem.place,
        })) || null,
    })),
    mainLinks: transformedMainLinks,
    eventDays: transformedEventDays,
    homeText: data.homeText || null,
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
