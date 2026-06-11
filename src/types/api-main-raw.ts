import { z } from "zod";
import { mainSectionSchema } from "@/schemas/mainSchema";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const partialMainSectionSchema = mainSectionSchema.partial();

export type PartialMainSectionData = z.infer<typeof partialMainSectionSchema>;

export type ApiEventDay = {
  dayId?: string;
  label?: string;
  date?: string;
};

export type ApiPressKitLinks = {
  pressKitLinks?: { id: number; link: string; description?: string | null }[];
};

export type ApiMainLinks = {
  mainLinks?: { platform: string; link: string }[];
};

export type ApiMainSectionData = {
  eventDays?: ApiEventDay[];
  currentTourStatus?: "new" | "older";
};
