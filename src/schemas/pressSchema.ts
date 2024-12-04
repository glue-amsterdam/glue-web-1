import { imageDataSchema } from "@/schemas/baseSchema";
import { z } from "zod";

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

export type PressItemsSectionContent = z.infer<typeof pressItemsSectionSchema>;
export type PressItem = z.infer<typeof pressItemSchema>;
