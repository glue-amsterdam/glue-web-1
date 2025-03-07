import { imageDataSchema } from "@/schemas/baseSchema";
import { z } from "zod";

export const carouselSectionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  is_visible: z.boolean().default(true),
  slides: z.array(imageDataSchema).max(15, "Maximum 15 slides allowed"),
});

export type CarouselSection = z.infer<typeof carouselSectionSchema>;
export type CarouselClientType = {
  title: string;
  description: string;
  is_visible: boolean;
  slides: Array<{
    image_url: string;
  }>;
};
