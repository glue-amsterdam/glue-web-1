import { DAYS, DAYS_IDS } from "@/constants";
import { z } from "zod";

export type DayID = (typeof DAYS_IDS)[number];
export type DaysLabels = (typeof DAYS)[number];

export const eventDaySchema = z.object({
  dayId: z.enum(DAYS_IDS),
  date: z.string().nullable(),
  label: z.string().min(1, "Label is required"),
});

export type EventDay = z.infer<typeof eventDaySchema>;

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

export interface MainLink {
  platform: string;
  link: string;
}

export interface MainSection {
  mainColors: MainColors;
  mainMenu: MainMenuItem[];
  mainLinks: MainLink[];
  eventsDays: EventDay[];
}
