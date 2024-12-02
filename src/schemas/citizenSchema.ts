import { z } from "zod";

export const citizenSchema = z.object({
  id: z.string(),
  section_id: z.string(),
  name: z.string().min(1, "Name is required"),
  image_url: z.string(),
  image_name: z.string().optional(),
  alt: z.string().min(1, "Alt text is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  year: z.string(),
  file: z.any().optional(),
  oldImageUrl: z.string().optional(),
});

export const citizensByYearSchema = z.record(
  z.string(),
  z
    .array(citizenSchema)
    .min(3, "At least 3 citizens are required")
    .max(3, "Maximum 3 citizens allowed")
);

export const citizensSectionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  citizensByYear: citizensByYearSchema,
});

export type Citizen = z.infer<typeof citizenSchema>;
export type CitizensByYear = z.infer<typeof citizensByYearSchema>;
export type CitizensSection = z.infer<typeof citizensSectionSchema>;
