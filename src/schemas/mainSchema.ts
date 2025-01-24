import { eventDaySchema } from "@/schemas/eventSchemas";
import { z } from "zod";

export const subMenuItemSchema = z.object({
  href: z.string(),
  title: z.string(),
  is_visible: z.boolean().default(true),
  place: z.number().int().positive(),
});

export const mainMenuItemSchema = z.object({
  menu_id: z.string().uuid(),
  label: z.string().min(1, "Label is required"),
  section: z.string(),
  className: z.string(),
  subItems: z.array(subMenuItemSchema).optional().nullable(),
});

export type MainMenuItem = z.infer<typeof mainMenuItemSchema>;

export const mainMenuSchema = z.object({
  mainMenu: z.array(mainMenuItemSchema),
});

export type MainMenuData = z.infer<typeof mainMenuSchema>;

const hexColorSchema = z
  .string()
  .regex(/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/, "Invalid hex color format");

export const mainColorsSchema = z.object({
  box1: hexColorSchema.min(1, "Box 1 color is required"),
  box2: hexColorSchema.min(1, "Box 2 color is required"),
  box3: hexColorSchema.min(1, "Box 3 color is required"),
  box4: hexColorSchema.min(1, "Box 4 color is required"),
  triangle: hexColorSchema.min(1, "Triangle color is required"),
});

export const linkItemSchema = z.object({
  platform: z.string().min(1, "Platform is required"),
  link: z.string().url("Must be a valid URL"),
});

export const mainLinksSchema = z.object({
  mainLinks: z.array(linkItemSchema),
});

export const mainSectionSchema = z.object({
  mainColors: mainColorsSchema,
  mainMenu: z.array(mainMenuItemSchema),
  mainLinks: mainLinksSchema,
  eventDays: z.array(eventDaySchema),
});

export type MainSectionData = z.infer<typeof mainSectionSchema>;
export type LinkItem = z.infer<typeof linkItemSchema>;
export type MainLinks = z.infer<typeof mainLinksSchema>;
export type MainColors = z.infer<typeof mainColorsSchema>;
export type MainLink = z.infer<typeof linkItemSchema>;
export type SubItem = z.infer<typeof subMenuItemSchema>;
