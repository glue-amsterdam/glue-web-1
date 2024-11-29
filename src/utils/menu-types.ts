import { DAYS, DAYS_IDS } from "@/constants";
import { MainLinks } from "@/schemas/baseSchema";

export interface MainSection {
  mainColors: MainColors;
  mainMenu: MainMenuItem[];
  mainLinks: MainLinks;
  eventsDays: EventDay[];
}
export interface MainMenuItem {
  menu_id: string;
  label: string;
  section: string;
  className: string;
  subItems?: SubMenuItem[] | null;
}

interface SubMenuItem {
  title: string;
  href: string;
}

export interface MainColors {
  box1: string;
  box2: string;
  box3: string;
  box4: string;
  triangle: string;
}

export interface EventDay {
  dayId: DayID;
  label: DaysLabels;
  date: Date;
}

export type DayID = (typeof DAYS_IDS)[number];
export type DaysLabels = (typeof DAYS)[number];
