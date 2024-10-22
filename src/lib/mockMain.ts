import { MainSection } from "@/utils/menu-types";

export const mainSection: MainSection = {
  mainColors: {
    box1: "#0c0c0c",
    box2: "#072f4a",
    box3: "#0086cd",
    box4: "#7dadc7",
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
    linkedin: {
      link: "https://www.facebook.com/",
      icon: "facebook",
    },
    instagram: {
      link: "https://www.instagram.com/",
      icon: "instagram",
    },
  },
};
