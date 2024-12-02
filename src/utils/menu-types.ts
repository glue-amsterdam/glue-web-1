import { DAYS, DAYS_IDS } from "@/constants";
import {
  linkItemSchema,
  mainColorsSchema,
  MainMenuItem,
} from "@/schemas/mainSchema";
import { z } from "zod";

export type DayID = (typeof DAYS_IDS)[number];
export type DaysLabels = (typeof DAYS)[number];

export const eventDaySchema = z.object({
  dayId: z.enum(DAYS_IDS),
  date: z.string().nullable(),
  label: z.string().min(1, "Label is required"),
});

export type EventDay = z.infer<typeof eventDaySchema>;

export type MainColors = z.infer<typeof mainColorsSchema>;
export type MainLink = z.infer<typeof linkItemSchema>;

export interface MainSection {
  mainColors: MainColors;
  mainMenu: MainMenuItem[];
  mainLinks: MainLink[];
  eventsDays: EventDay[];
}
