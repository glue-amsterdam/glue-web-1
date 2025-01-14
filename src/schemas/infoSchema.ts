import { imageDataSchema } from "@/schemas/baseSchema";
import { z } from "zod";

export const infoItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  image: imageDataSchema,
  description: z.string().min(10, "Description must be at least 10 characters"),
});

export const infoSectionHeaderSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

export const infoSectionSchema = infoSectionHeaderSchema.extend({
  infoItems: z
    .array(infoItemSchema)
    .min(3, "At least 1 info item is required")
    .max(3, "Maximum 2 info items allowed"),
});

export type InfoSection = z.infer<typeof infoSectionSchema>;
export type InfoItem = z.infer<typeof infoItemSchema>;

export const infoItemClientSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  image: z.object({
    image_url: z.string(),
  }),
});

export const infoSectionClientSchema = z.object({
  title: z.string(),
  description: z.string(),
  infoItems: z.array(infoItemClientSchema).min(3).max(3),
});

export type InfoItemClient = z.infer<typeof infoItemClientSchema>;
export type InfoSectionClient = z.infer<typeof infoSectionClientSchema>;
