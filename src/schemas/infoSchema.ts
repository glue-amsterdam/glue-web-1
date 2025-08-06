import { z } from "zod";

export const infoItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  image_url: z.string(),
  is_visible: z.boolean(),
  file: z.any().optional(),
  oldImageUrl: z.string().optional(),
});

export const infoSectionHeaderSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  is_visible: z.boolean(),
  text_color: z.string(),
  background_color: z.string(),
});

export const infoItemsSectionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  is_visible: z.boolean(),
  infoItems: z.array(infoItemSchema).max(3, "Maximum 3 press items allowed"),
  text_color: z.string(),
  background_color: z.string(),
});

export type InfoSection = z.infer<typeof infoItemsSectionSchema>;
export type InfoItem = z.infer<typeof infoItemSchema>;

export const infoItemClientSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  image_url: z.string(),
});

export const infoSectionClientSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  is_visible: z.boolean(),
  infoItems: z.array(infoItemClientSchema).max(3),
  text_color: z.string(),
  background_color: z.string(),
});

export type InfoItemClient = z.infer<typeof infoItemClientSchema>;
export type InfoSectionClient = z.infer<typeof infoSectionClientSchema>;
