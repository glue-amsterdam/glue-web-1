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

export type MainMenuFormData = z.input<typeof mainMenuSchema>;
export type MainMenuData = z.output<typeof mainMenuSchema>;

const hexColorSchema = z
  .string()
  .regex(/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/, "Invalid hex color format");

export const homeBackgroundColorsSchema = z.object({
  box1: hexColorSchema.min(1, "Box 1 color is required"),
  box2: hexColorSchema.min(1, "Box 2 color is required"),
  box3: hexColorSchema.min(1, "Box 3 color is required"),
  box4: hexColorSchema.min(1, "Box 4 color is required"),
  triangle: hexColorSchema.min(1, "Triangle color is required"),
});

export const siteThemeColorsSchema = z.object({
  primaryColor: hexColorSchema.min(1, "Primary color is required"),
  backgroundColor: hexColorSchema.min(1, "Background color is required"),
  blackColor: hexColorSchema.min(1, "Black color is required"),
  whiteColor: hexColorSchema.min(1, "White color is required"),
  upToThreeParticipantsColor: hexColorSchema.min(
    1,
    "Up to three participants color is required"
  ),
  hubColor: hexColorSchema.min(1, "Hub color is required"),
  specialProgramColor: hexColorSchema.min(1, "Special program color is required"),
  hubFontColor: hexColorSchema.min(1, "Hub font color is required"),
  upToThreeParticipantsFontColor: hexColorSchema.min(
    1,
    "Up to three participants font color is required"
  ),
  specialProgramFontColor: hexColorSchema.min(
    1,
    "Special program font color is required"
  ),
});

export const mainColorsFormSchema = homeBackgroundColorsSchema.merge(
  siteThemeColorsSchema
);

/** Legacy home background colors used by fetchMain / MainContext */
export const mainColorsSchema = homeBackgroundColorsSchema;

export const linkItemSchema = z.object({
  platform: z.string().min(1, "Platform is required"),
  link: z.string().url("Must be a valid URL"),
});

export const linkItemAdminSchema = z.object({
  platform: z.string().min(1, "Platform is required"),
  link: z
    .string()
    .nullable()
    .optional()
    .refine(
      (value) =>
        value == null ||
        value.trim() === "" ||
        z.string().url().safeParse(value.trim()).success,
      { message: "Must be a valid URL" }
    ),
});

export const mainLinksSchema = z.object({
  mainLinks: z.array(linkItemSchema),
});

export const mainLinksAdminSchema = z.object({
  mainLinks: z.array(linkItemAdminSchema),
});

export const homeTextPlacementSchema = z.enum([
  "marquee",
  "footer_left",
  "footer_right",
]);

const optionalHrefSchema = z
  .string()
  .trim()
  .optional()
  .nullable()
  .refine(
    (value) =>
      !value ||
      value.startsWith("/") ||
      z.string().url().safeParse(value).success,
    { message: "Must be a valid URL or internal path" }
  );

const homeTextItemFieldsSchema = z.object({
  label: z.string(),
  color: z.string().nullable().optional(),
  href: optionalHrefSchema,
  placement: homeTextPlacementSchema,
  sort_order: z.number().int().nonnegative(),
});

export const homeTextItemSchema = homeTextItemFieldsSchema.extend({
  id: z.string().uuid(),
  label: z.string().min(1, "Text is required"),
});

export const homeTextItemFormSchema = homeTextItemFieldsSchema.extend({
  id: z.string().uuid().optional(),
});

export const homeTextsSchema = z.object({
  homeTexts: z.array(homeTextItemSchema),
});

export const homeTextsFormSchema = z.object({
  homeTexts: z.array(homeTextItemFormSchema),
});

export const homeTextsSaveSchema = z.object({
  homeTexts: z.array(
    homeTextItemFormSchema.extend({
      label: z.string().trim().min(1, "Text is required"),
    })
  ),
});

export type HomeTextPlacement = z.infer<typeof homeTextPlacementSchema>;
export type HomeTextItem = z.infer<typeof homeTextItemSchema>;
export type HomeTextsFormData = z.infer<typeof homeTextsFormSchema>;

export const pressKitLinkSchema = z.object({
  id: z.number().int().positive(),
  link: z.string().url("Must be a valid URL"),
  description: z.string().nullable().optional(),
});

export const pressKitLinkFormSchema = z.object({
  id: z.number().int().positive(),
  link: z.string().min(1, "Link is required").url("Must be a valid URL"),
  description: z.string().nullable().optional(),
});

export const pressKitLinksSchema = z.object({
  pressKitLinks: z.array(pressKitLinkSchema),
});

export const pressKitLinksFormSchema = z.object({
  pressKitLinks: z.array(pressKitLinkFormSchema),
});

export type PressKitLink = z.infer<typeof pressKitLinkSchema>;

export const tourStatusSchema = z.enum(["new", "older"]);

export const mainSectionSchema = z.object({
  eventDays: z.array(eventDaySchema),
  currentTourStatus: tourStatusSchema,
});

export type MainSectionData = z.infer<typeof mainSectionSchema>;
export type LinkItem = z.infer<typeof linkItemSchema>;
export type LinkItemAdmin = z.infer<typeof linkItemAdminSchema>;
export type MainLinks = z.infer<typeof mainLinksSchema>;
export type MainLinksAdmin = z.infer<typeof mainLinksAdminSchema>;
export type MainColors = z.infer<typeof mainColorsSchema>;
export type SiteThemeColors = z.infer<typeof siteThemeColorsSchema>;
export type MainColorsFormData = z.infer<typeof mainColorsFormSchema>;
export type MainLink = z.infer<typeof linkItemSchema>;
export type SubItem = z.infer<typeof subMenuItemSchema>;
export type TourStatus = z.infer<typeof tourStatusSchema>;
