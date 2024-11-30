import * as z from "zod";

export const imageDataSchema = z.object({
  id: z.string(),
  image_name: z.string(),
  image_url: z.string(),
  alt: z.string().min(1, "Alt text is required"),
  file: z.any().optional(),
});

export type ImageData = z.infer<typeof imageDataSchema>;

/* MAIN SECTION ADMIN FORM SCHEMAS => */
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

export const menuItemSchema = z.object({
  menu_id: z.string().uuid(),
  label: z.string().min(1, "Label is required"),
  section: z.string(),
  className: z.string(),
});

export const mainMenuSchema = z.object({
  mainMenu: z.array(menuItemSchema),
});

export const linkItemSchema = z.object({
  platform: z.string().min(1, "Platform is required"),
  link: z.string().url("Must be a valid URL"),
});

export const mainLinksSchema = z.object({
  mainLinks: z.array(linkItemSchema),
});

export type LinkItem = z.infer<typeof linkItemSchema>;
export type MainLinks = z.infer<typeof mainLinksSchema>;

export const mainSectionSchema = z.object({
  mainColors: mainColorsSchema,
  mainMenu: mainMenuSchema,
  mainLinks: mainLinksSchema,
});
/* <= MAIN SECTION ADMIN FORM SCHEMAS */

/* ABOUT SECTION ADMIN FORM SCHEMAS => */

export type CarouselSectionContent = z.infer<typeof carouselSectionSchema>;
export type ParticipantsSectionContent = z.infer<
  typeof participantsSectionSchema
>;
export type CitizensSectionContent = z.infer<typeof citizensSectionSchema>;
export type CuratedMemberSectionContent = z.infer<
  typeof curatedMembersSectionSchema
>;
export type InfoSectionContent = z.infer<typeof infoItemsSectionSchema>;
export type PressItemsSectionContent = z.infer<typeof pressItemsSectionSchema>;
export type SponsorsSectionContent = z.infer<typeof sponsorsSectionSchema>;
export type GlueInternationalContent = z.infer<
  typeof glueInternationalSectionSchema
>;

export type Citizen = z.infer<typeof citizenSchema>;
export type InfoItem = z.infer<typeof infoItemSchema>;
export type PressItem = z.infer<typeof pressItemSchema>;

export const carouselSectionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  slides: z.array(imageDataSchema).max(15, "Maximum 15 slides allowed"),
});
export const citizenSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  image: imageDataSchema,
  description: z.string().min(10, "Description must be at least 10 characters"),
  year: z.number().int().min(1900).max(2100),
});

export const citizensSectionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  citizens: z.array(citizenSchema),
});

export const participantsSectionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

export const curatedMembersSectionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

export const infoItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  image: imageDataSchema,
  description: z.string().min(10, "Description must be at least 10 characters"),
});

export const infoItemsSectionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  infoItems: z
    .array(infoItemSchema)
    .min(3, "At least 1 info item is required")
    .max(3, "Maximum 2 info items allowed"),
});

export const pressItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  image: imageDataSchema,
  description: z.string().min(10, "Description must be at least 10 characters"),
  content: z
    .string()
    .min(10, "Content must be at least 10 characters")
    .optional(),
});

export const pressItemsSectionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  pressItems: z
    .array(pressItemSchema)
    .min(1, "At least 1 press item is required")
    .max(2, "Maximum 2 press items allowed"),
});

export const glueInternationalButtonColorSchema = z.object({
  buttonColor: z
    .string()
    .min(1, "Button color is required")
    .regex(
      /^#(?:[0-9a-fA-F]{3}){1,2}$/,
      "Button color must be a valid hex code"
    ),
});

export const glueInternationalSectionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().min(1, "Subtitle is required"),
  buttonText: z.string().min(1, "Button text is required"),
  website: z.string().url("Invalid website URL"),
  buttonColor: glueInternationalButtonColorSchema,
});

export const sponsorSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  website: z.string().url("Invalid website URL"),
  sponsorT: z.string().min(1, "Sponsor type is required"),
  logo: imageDataSchema,
});

export const sponsorsSectionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
});
/* <= ABOUT SECTION ADMIN FORM SCHEMAS */

/* API CALLS TYPES => */

export type DatabaseAboutContent = {
  carouselSection: CarouselSectionContent;
  participantsSection: ParticipantsSectionContent;
  citizensSection: CitizensSectionContent;
  curatedMembersSection: CuratedMemberSectionContent;
  infoItemsSection: InfoSectionContent;
  pressItemsSection: PressItemsSectionContent;
  sponsorsSection: SponsorsSectionContent;
  glueInternationalSection: GlueInternationalContent;
  createdAt: Date;
  updatedAt: Date;
};

/* <= API CALLS TYPES */
