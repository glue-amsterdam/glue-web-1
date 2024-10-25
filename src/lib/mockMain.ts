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
    youtube: {
      link: "https://www.youtube.com/",
      icon: "youtube",
    },
  },
};
