import { MainSectionData } from "@/schemas/mainSchema";

export const mainSection: MainSectionData = {
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
        { title: "Carousel", href: "main" },
        { title: "Participants", href: "participants" },
        { title: "Citizens of Honour", href: "citizens" },
        { title: "Curated Members", href: "curated" },
        { title: "Information", href: "info" },
        { title: "GLUE international", href: "last" },
        { title: "Sponsors", href: "last" },
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
  mainLinks: [
    {
      platform: "newsletter",
      link: "https://amsterdam.us5.list-manage.com/subscribe?u=b588bd4354fa4df94fbd3803c&id=9cda67fd4c",
    },
    {
      platform: "linkedin",
      link: "https://www.linkedin.com/company/glue-amsterdam-connected-by-design/",
    },
    { platform: "instagram", link: "https://www.instagram.com/glue.amsterdam" },
    { platform: "youtube", link: "https://www.youtube.com/@GLUETV_amsterdam" },
  ],
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
