import { IconType } from "react-icons/lib";

export interface MainSection {
  mainColors: MainColors;
  mainMenu: MenuItem[];
  mainLinks: MainLinks;
}

interface MenuItem {
  label: string;
  section: string;
  className: string;
}

interface LinkItem {
  link: string;
  icon?: IconType;
}

interface MainColors {
  box1: string;
  box2: string;
  box3: string;
  box4: string;
  triangle: string;
}

interface MainLinks {
  linkedin: LinkItem;
  twitter: LinkItem;
  instagram: LinkItem;
}
