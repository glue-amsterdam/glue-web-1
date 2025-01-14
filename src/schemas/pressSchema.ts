import { z } from "zod";

export const pressItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  image_url: z.string(),
  isVisible: z.boolean().default(false),
  file: z.any().optional(),
  oldImageUrl: z.string().optional(),
});

export const pressItemsSectionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  pressItems: z.array(pressItemSchema).max(2, "Maximum 2 press items allowed"),
});

export type PressItemsSectionContent = z.infer<typeof pressItemsSectionSchema>;
export type PressItem = z.infer<typeof pressItemSchema>;
