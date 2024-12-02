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

export const citizensSectionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  citizensByYear: z.record(z.array(citizenSchema).length(3)),
});

export type Citizen = z.infer<typeof citizenSchema>;
export type CitizensSection = z.infer<typeof citizensSectionSchema>;
