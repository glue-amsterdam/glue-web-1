import { DAYS } from "@/constants";

export interface MainSection {
  mainColors: MainColors;
  mainMenu: MainMenuItem[];
  mainLinks: Record<string, MainLink>;
  eventsDays: EventDay[];
}
export interface MainMenuItem {
  label: string;
  section: string;
  className: string;
  subItems?: SubMenuItem[];
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

export interface MainLink {
  link?: string;
}

export interface EventDay {
  dayId: DayID;
  label: DaysLabels;
  date: Date;
}

export type DayID = "day-1" | "day-2" | "day-3" | "day-4" | "extra-day";
export type DaysLabels = (typeof DAYS)[number];
