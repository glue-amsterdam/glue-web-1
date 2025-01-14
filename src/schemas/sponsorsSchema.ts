import { z } from "zod";

const sponsorTypeSchema = z.object({
  label: z.string().min(1, "Sponsor type cannot be empty"),
});

export const sponsorsHeaderSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  sponsors_types: z
    .array(sponsorTypeSchema)
    .min(1, "At least 1 sponsor type is required")
    .max(8, "Maximum 8 sponsor types allowed"),
});

export const sponsorSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Name is required"),
  website: z.string().url("Invalid website URL"),
  sponsor_type: z.string().min(1, "Sponsor type is required"),
  image_url: z.string().min(1, "Image URL is required"),
  file: z.any().optional(),
  oldImageUrl: z.string().optional(),
});

export const sponsorsSectionSchema = z.object({
  sponsorsHeaderSchema,
  sponsors: z.array(sponsorSchema),
});

export type SponsorsHeader = z.infer<typeof sponsorsHeaderSchema>;
export type SponsorType = z.infer<typeof sponsorTypeSchema>;
export type Sponsor = z.infer<typeof sponsorSchema>;
export type SponsorsSection = z.infer<typeof sponsorsSectionSchema>;
