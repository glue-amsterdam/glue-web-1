import { z } from "zod";
import { mainSectionSchema } from "@/schemas/mainSchema";

// Create a partial version of the schema that allows undefined fields
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const partialMainSectionSchema = mainSectionSchema.partial();

// Define the type based on the partial schema
export type PartialMainSectionData = z.infer<typeof partialMainSectionSchema>;

// Define more specific types for each section
export type ApiMainMenuItem = {
  menu_id?: string;
  label?: string;
  section?: string;
  className?: string;
  subItems?:
    | { title?: string; href?: string; is_visible?: boolean; place: number }[]
    | null;
};

export type ApiMainColors = {
  box1?: string;
  box2?: string;
  box3?: string;
  box4?: string;
  triangle?: string;
};

export type ApiMainLinks = {
  mainLinks?: { platform?: string; link?: string }[];
};

export type ApiEventDay = {
  dayId?: string;
  label?: string;
  date?: string;
};

export type ApiPressKitLinks = {
  pressKitLinks?: { id: number; link: string; description?: string | null }[];
};

// Main type for the API response
export type ApiMainSectionData = {
  mainColors?: ApiMainColors;
  mainMenu?: ApiMainMenuItem[];
  mainLinks?: ApiMainLinks;
  eventDays?: ApiEventDay[];
  homeText?: { id: string; label: string; color?: string | null } | null;
  pressKitLinks?: ApiPressKitLinks;
  currentTourStatus?: "new" | "older";
};
