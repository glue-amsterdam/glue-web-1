import * as z from "zod";

export const imageDataSchema: z.ZodType<ImageData> = z.object({
  id: z.string(),
  imageName: z.string(),
  imageUrl: z.string(),
  alt: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export interface ImageData {
  id: string;
  imageName: string;
  imageUrl: string;
  alt?: string;
  createdAt: Date;
  updatedAt: Date;
}

/* MAIN SECTION ADMIN FORM SCHEMAS => */
export const mainColorsSchema = z.object({
  box1: z.string().min(1, "Box 1 color is required"),
  box2: z.string().min(1, "Box 2 color is required"),
  box3: z.string().min(1, "Box 3 color is required"),
  box4: z.string().min(1, "Box 4 color is required"),
  triangle: z.string().min(1, "Triangle color is required"),
});

export const menuItemSchema = z.object({
  label: z.string().min(1, "Label is required"),
  section: z.string(),
  className: z.string(),
});

export const linkItemSchema = z.object({
  link: z.string().url("Invalid URL"),
  icon: z.string().optional(),
});

export const mainLinksSchema = z.object({
  newsletter: linkItemSchema,
  linkedin: linkItemSchema,
  instagram: linkItemSchema,
  youtube: linkItemSchema,
});

export const mainSectionSchema = z.object({
  mainColors: mainColorsSchema,
  mainMenu: z.array(menuItemSchema),
  mainLinks: mainLinksSchema,
});
/* <= MAIN SECTION ADMIN FORM SCHEMAS */

/* ABOUT SECTION ADMIN FORM SCHEMAS => */
export const carouselSectionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  slides: z
    .array(imageDataSchema)
    .min(1, "At least 1 slide is required")
    .max(15, "Maximum 15 slides allowed"),
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

export const infoItemsSectionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  infoItems: z
    .array(
      z.object({
        id: z.string(),
        title: z.string().min(1, "Title is required"),
        image: imageDataSchema,
        description: z
          .string()
          .min(10, "Description must be at least 10 characters"),
      })
    )
    .min(3, "At least 1 info item is required")
    .max(3, "Maximum 2 info items allowed"),
});
export const pressItemsSectionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  pressItems: z
    .array(
      z.object({
        id: z.string(),
        title: z.string().min(1, "Title is required"),
        image: imageDataSchema,
        description: z
          .string()
          .min(10, "Description must be at least 10 characters"),
        content: z.string().min(10, "Content must be at least 10 characters"),
      })
    )
    .min(1, "At least 1 press item is required")
    .max(2, "Maximum 2 press items allowed"),
});

export const glueInternationalSectionSchema = z.object({
  buttonColor: z
    .string()
    .min(1, "Button color is required")
    .regex(
      /^#(?:[0-9a-fA-F]{3}){1,2}$/,
      "Button color must be a valid hex code"
    ),
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
