import { imageDataSchema } from "@/schemas/baseSchema";
import { z } from "zod";

export const sponsorSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  website: z.string().url("Invalid website URL"),
  sponsorT: z.string().min(1, "Sponsor type is required"),
  logo: imageDataSchema,
});

const sponsorTypeSchema = z.object({
  label: z.string().min(1, "Sponsor type cannot be empty"),
});

export const sponsorsHeaderSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  sponsors_types: z
    .array(sponsorTypeSchema)
    .min(1, "At least 1 sponsor type is required")
    .max(8, "Maximum 8 sponsor types allowed"),
});

export const sponsorsSectionSchema = z.object({
  sponsorsSection: sponsorsHeaderSchema,
  /* sponsors: z.array(sponsorSchema), */
});

export type Sponsor = z.infer<typeof sponsorSchema>;
export type SponsorsHeader = z.infer<typeof sponsorsHeaderSchema>;
export type SponsorsSection = z.infer<typeof sponsorsSectionSchema>;
