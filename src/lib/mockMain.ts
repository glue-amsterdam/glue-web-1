import { MainSection } from "@/utils/menu-types";

export const mainSection: MainSection = {
  mainColors: {
    box1: "#10069f",
    box2: "#230051",
    box3: "#000000",
    box4: "#bfb030",
    triangle: "#e1d237",
  },
  mainMenu: [
    {
      label: "dashboard",
      section: "dashboard",
      className: "leftbutton",
    },
    {
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
      label: "events",
      section: "events",
      className: "rightbutton",
    },
    {
      label: "map",
      section: "map",
      className: "downbutton",
    },
  ],
  mainLinks: {
    newsletter: {
      link: "https://amsterdam.us5.list-manage.com/subscribe?u=b588bd4354fa4df94fbd3803c&id=9cda67fd4c",
    },
    linkedin: {
      link: "https://www.linkedin.com/company/glue-amsterdam-connected-by-design/",
    },
    instagram: {
      link: "https://www.instagram.com/glue.amsterdam",
    },
    youtube: {
      link: "https://www.youtube.com/@GLUETV_amsterdam",
    },
  },
};
